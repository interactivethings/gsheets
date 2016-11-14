// @flow

var BASE_URL = 'https://spreadsheets.google.com/feeds/';

type Feed = Object;

// Utility functions

// Get value from a nested structure or null.
function getIn(o: Object, keys: Array<string>): any {
  var k = keys[0],
      ks = keys.slice(1);
  if (!o.hasOwnProperty(k)) return null;
  return ks.length ? getIn(o[k], ks) : o[k];
}

// Fetching

function fetchFeed(params: Array<string>): Promise<*> {
  var url = BASE_URL + params.join('/') + '/public/values?alt=json';
  return fetch(url)
    .then((response) => response.json())
    .catch((err) => Promise.reject(new Error('Could not parse response. Make sure the spreadsheet does exist.')))
    .then((data: {feed?: Feed}) => {
      return new Promise((resolve, reject) => {
        if (data.feed) {
          resolve(data.feed);
        } else {
          reject(new Error('No feed was returned'));
        }
      });
    });
}

function fetchSpreadsheet(key: string): Promise<*> {
  return fetchFeed(['worksheets', key]).then(parseSpreadsheetFeed);
}

function fetchWorksheetById(key: string, worksheetId: string): Promise<*> {
  return fetchFeed(['cells', key, worksheetId]).then(parseWorksheetFeed);
}

function fetchWorksheetByTitle(key: string, worksheetTitle: string): Promise<*> {
  return fetchSpreadsheet(key)
    .then((spreadsheet: {worksheets: ?Array<Object>}) => {
      return new Promise((resolve, reject) => {
        const worksheet = spreadsheet.worksheets
          ? spreadsheet.worksheets.filter(d => d.title === worksheetTitle)[0]
          : null;
        if (worksheet) {
          resolve(fetchWorksheetById(key, worksheet.id));
        } else {
          reject(new Error('No worksheet with title \'' + worksheetTitle + '\' found.'));
        }
      });
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

function parseSpreadsheetFeed(feed: Feed) {
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

export const getWorksheet = fetchWorksheetByTitle;
export const getWorksheetById = fetchWorksheetById;
export const getSpreadsheet = fetchSpreadsheet;
