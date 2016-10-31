// @flow

var BASE_URL = 'https://spreadsheets.google.com/feeds/';

type Callback<T> = (error: ?Error, result?: T) => any;

// Utility functions

// Get value from a nested structure or null.
function getIn(o: Object, keys: Array<string>): any {
  var k = keys[0],
      ks = keys.slice(1);
  if (!o.hasOwnProperty(k)) return null;
  return ks.length ? getIn(o[k], ks) : o[k];
}

// Fetching

function fetchData(params: Array<string>, callback: Callback<Object>): void {
  var url = BASE_URL + params.join('/') + '/public/values?alt=json';
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (!data.feed) return callback(new Error('No feed was returned'));
      callback(null, data.feed);
    })
    .catch(function(res) {
      if (res instanceof Error) return callback(res);
      // if (!res) return callback(new Error('No response.'));
      return callback(new Error('Google Spreadsheets responded with HTTP error ' + res.status + '. Are you sure the spreadsheet exists and is published?'));
    });
}

function fetchSpreadsheet(key: string, callback: Callback<Object>) {
  fetchData(['worksheets', key], function(err, feed: ?Object) {
    if (err) return callback(err);
    if (feed) callback(null, parseSpreadsheetFeed(feed));
  });
}

function fetchWorksheetById(key: string, worksheetId: string, callback: Callback<Object>) {
  fetchData(['cells', key, worksheetId], function(err, feed) {
    if (err) return callback(err);
    if (feed) callback(null, parseWorksheetFeed(feed));
  });
}

function fetchWorksheetByTitle(key: string, worksheetTitle: string, callback: Callback<Object>) {
  fetchSpreadsheet(key, function(err, spreadsheet) {
    if (err) return callback(err);
    if (spreadsheet) {
      var worksheet = spreadsheet.worksheets.filter(function(d) { return d.title === worksheetTitle; })[0];
      if (!worksheet) return callback(new Error('No worksheet with title \'' + worksheetTitle + '\' found.'));
      fetchWorksheetById(key, worksheet.id, callback);
    }
  });
}

// Parsing

function parseWorksheetIdInSpreadsheetFeed(uri: string): ?string {
  var re = /.*\/(.+)$/,
      matches = re.exec(uri);
  return matches ? matches[1] : null;
}

function parseWorksheet(worksheet: Object) {
  return {
    id: parseWorksheetIdInSpreadsheetFeed(getIn(worksheet, ['id', '$t'])),
    title: getIn(worksheet, ['title', '$t'])
  };
}

function parseSpreadsheetFeed(feed: Object) {
  return {
    updated: getIn(feed, ['updated', '$t']),
    title: getIn(feed, ['title', '$t']),
    worksheets: feed.entry ? feed.entry.map(parseWorksheet) : null
  };
}

function parseWorksheetFeed(feed: Object): {updated: string, title: string, data: ?Array<Object>} {
  return {
    updated: getIn(feed, ['updated', '$t']),
    title: getIn(feed, ['title', '$t']),
    data: feed.entry ? parseCellsIntoRows(feed.entry) : null
  };
}

function getCellData(cell: Object): {col: number, row: number, value: string | number} {
  var data = cell.gs$cell;
  return {
    col: +data.col,
    row: +data.row,
    value: data.numericValue ? +data.numericValue : data.$t
  };
}

function createRowFromHeaders(headers) {
  return headers.reduce(function(row, key) {
    row[key] = null;
    return row;
  }, {});
}

function parseCellsIntoRows(cells: Array<Object>): Array<Object> {
  var cellsData = cells.map(getCellData),
      headerCells = cellsData.filter(function(d) { return d.row === 1; }),
      headers = headerCells.map(function(d) { return d.value; }),
      headersByCol = headerCells.reduce(function(byCol, d) {
        byCol[d.col] = d.value;
        return byCol;
      }, {}),
      bodyCells = cellsData.filter(function(d) { return d.row !== 1; }),
      bodyByRow = bodyCells.reduce(function(byRow, d) {
        var row = byRow[d.row] || createRowFromHeaders(headers),
            key = headersByCol[d.col];
        row[key] = d.value;
        byRow[d.row] = row;
        return byRow;
      }, {});

  return Object.keys(bodyByRow)
    .sort(function(a, b) { return +a - +b; })
    .map(function(row) { return bodyByRow[row]; });
}

// Public API

module.exports = {
  getWorksheet: fetchWorksheetByTitle,
  getWorksheetById: fetchWorksheetById,
  getSpreadsheet: fetchSpreadsheet
};
