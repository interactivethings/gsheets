// @flow

const BASE_URL = 'https://spreadsheets.google.com/feeds/';

type GSFeed = Object;

type GSSpreadsheetFeed = {
  updated: {$t: string};
  title: {$t: string};
  entry: Array<GSSpreadsheetWorksheet>
};

type GSSpreadsheetWorksheet = {
  id: {$t: string};
  title: {$t: string};
  // Other things we don't need
};

type GSWorksheetFeed = {
  updated: {$t: string};
  title: {$t: string};
  entry?: Array<GSCell>; // Missing if worksheet is empty
};

type GSCell = {
  gs$cell: {row: string, col: string, $t: string, numericValue?: string}
};

type SpreadsheetWorksheet = {
  id: string;
  title: string;
};

type Spreadsheet = {
  updated: string;
  title: string;
  worksheets: Array<SpreadsheetWorksheet>;
};

type Row = {[key: string]: number | string | null};

type Worksheet = {
  updated: string;
  title: string;
  data: Array<Row>;
};

// Fetching

function fetchFeed(params: Array<string>): Promise<GSFeed> {
  const url = BASE_URL + params.join('/') + '/public/values?alt=json';
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(new Error('The spreadsheet doesn´t exist or isn´t public.'))
      }
      return response.json()
    })
    .then((data: {feed?: GSFeed}) => {
      return new Promise((resolve, reject) => {
        if (data.feed) {
          resolve(data.feed);
        } else {
          reject(new Error('No feed was returned'));
        }
      });
    });
}

function fetchSpreadsheet(key: string): Promise<Spreadsheet> {
  return fetchFeed(['worksheets', key]).then(parseSpreadsheetFeed);
}

function fetchWorksheetById(key: string, worksheetId: string): Promise<Worksheet> {
  return fetchFeed(['cells', key, worksheetId]).then(parseWorksheetFeed);
}

function fetchWorksheetByTitle(key: string, worksheetTitle: string): Promise<Worksheet> {
  return fetchSpreadsheet(key)
    .then((spreadsheet: Spreadsheet) => {
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

function parseWorksheetIdInSpreadsheetFeed(uri: string): string {
  const re = /.*\/(.+)$/;
  const matches = re.exec(uri);
  return matches[1];
}

function parseWorksheet(worksheet: GSSpreadsheetWorksheet): SpreadsheetWorksheet {
  return {
    id: parseWorksheetIdInSpreadsheetFeed(worksheet.id.$t),
    title: worksheet.title.$t
  };
}

function parseSpreadsheetFeed(feed: GSSpreadsheetFeed): Spreadsheet {
  return {
    updated: feed.updated.$t,
    title: feed.title.$t,
    worksheets: feed.entry.map(parseWorksheet)
  };
}

function parseWorksheetFeed(feed: GSWorksheetFeed): Worksheet {
  return {
    updated: feed.updated.$t,
    title: feed.title.$t,
    data: feed.entry ? parseCellsIntoRows(feed.entry) : []
  };
}

function getCellData(cell: GSCell): {col: number, row: number, value: string | number} {
  const data = cell.gs$cell;
  return {
    col: +data.col,
    row: +data.row,
    value: data.numericValue ? +data.numericValue : data.$t
  };
}

function createRowFromHeaders(headers: Array<string>): Row {
  return headers.reduce(function(row, key) {
    row[key] = null;
    return row;
  }, {});
}

function parseCellsIntoRows(cells: Array<GSCell>): Array<Row> {
  const cellsData = cells.map(getCellData);
  const headerCells = cellsData.filter(d => d.row === 1);
  const headers = headerCells.map(d => `${d.value}`);
  const headersByCol = headerCells.reduce((byCol, d) => {
    byCol[d.col] = d.value;
    return byCol;
  }, {});
  const bodyCells = cellsData.filter(function(d) { return d.row !== 1; });
  const bodyByRow = bodyCells.reduce(function(byRow, d) {
    const row = byRow[d.row] || createRowFromHeaders(headers);
    const key = headersByCol[d.col];
    row[key] = d.value;
    byRow[d.row] = row;
    return byRow;
  }, {});

  return Object.keys(bodyByRow)
    .sort((a, b) => +a - +b)
    .map(row => bodyByRow[row]);
}

// Public API

export const getWorksheet = fetchWorksheetByTitle;
export const getWorksheetById = fetchWorksheetById;
export const getSpreadsheet = fetchSpreadsheet;
