var request = require('request'),
    http = require('http');

var BASE_URL = 'https://spreadsheets.google.com/feeds/';

// Utility functions

// Get value from a nested structure or null.
function getIn(o, keys) {
  var k = keys[0],
      ks = keys.slice(1);
  if (!o.hasOwnProperty(k)) return null;
  return ks.length ? getIn(o[k], ks) : o[k];
}

// Fetching

function fetch(params, callback) {
  var url = BASE_URL + params.join('/') + '/public/values?alt=json';
  request.get({
    url: url,
    json: true
  }, function(err, resp, body) {
    if (err) return callback(err);
    if (!resp) return callback(new Error('No response.'));
    if (resp.statusCode >= 400) return callback(new Error('Google Spreadsheets responded with HTTP error ' + resp.statusCode + ' (' + http.STATUS_CODES[resp.statusCode] + '). Are you sure the spreadsheet exists and is published?'));
    if (!body.feed) return callback(new Error('No feed was returned'));
    callback(null, body.feed);
  });
}

function fetchSpreadsheet(key, callback) {
  fetch(['worksheets', key], function(err, feed) {
    if (err) return callback(err);
    callback(null, parseSpreadsheetFeed(feed));
  });
}

function fetchWorksheetById(key, worksheetId, callback) {
  fetch(['list', key, worksheetId], function(err, feed) {
    if (err) return callback(err);
    callback(null, parseWorksheetFeed(feed));
  });
}

function fetchWorksheetCellsById(key, worksheetId, callback) {
  fetch(['cells', key, worksheetId], function(err, feed) {
    if (err) return callback(err);
    callback(null, parseWorksheetFeed(feed));
  });
}

function fetchWorksheetByTitle(key, worksheetTitle, callback) {
  fetchSpreadsheet(key, function(err, spreadsheet) {
    if (err) return callback(err);
    var worksheet = spreadsheet.worksheets.filter(function(d) { return d.title === worksheetTitle; })[0];
    if (!worksheet) return callback(new Error('No worksheet with title \'' + worksheetTitle + '\' found.'));
    fetchWorksheetById(key, worksheet.id, callback);
  });
}

// Parsing

function parseWorksheetIdInSpreadsheetFeed(uri) {
  var re = /.*\/(.+)$/,
      matches = re.exec(uri);
  return matches ? matches[1] : null;
}

function parseWorksheet(worksheet) {
  return {
    id: parseWorksheetIdInSpreadsheetFeed(getIn(worksheet, ['id', '$t'])),
    title: getIn(worksheet, ['title', '$t'])
  };
}

function parseSpreadsheetFeed(feed) {
  return {
    updated: getIn(feed, ['updated', '$t']),
    worksheets: feed.entry ? feed.entry.map(parseWorksheet) : null
  };
}

function parseWorksheetFeed(feed) {
  return {
    updated: getIn(feed, ['updated', '$t']),
    title: getIn(feed, ['title', '$t']),
    data: feed.entry ? feed.entry.map(parseRow) : null
  };
}

function isValueKey(key) {
  // Keys which represent values are prefixed with 'gsx$'
  return (/^gsx\$/).test(key);
}

function parseValueKey(key) {
  // Strip the 'gsx$' prefix from 'gsx$colname'
  var re = /^gsx\$(.*)$/,
      matches = re.exec(key);
  return matches ? matches[1] : null;
}

function isNumeric(n) {
  // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric/174921#174921
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function parseCell(value) {
  if (value === null || value === '') return null;
  if (isNumeric(value)) return +value;
  return value;
}

function parseRow(row) {
  var keys = Object.keys(row),
      valueKeys = keys.filter(isValueKey);
  return valueKeys.reduce(function(parsed, key) {
    parsed[parseValueKey(key)] = parseCell(getIn(row, [key, '$t']));
    return parsed;
  }, {});
}

// Public API

module.exports = {
  sheet: fetchWorksheetByTitle,
  sheets: fetchSpreadsheet
};