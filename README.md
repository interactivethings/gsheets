# gsheets

Get public Google Sheets as plain JavaScript/JSON.

:point_right: [Try gsheets in your browser](https://runkit.com/npm/gsheets)

## Usage

### Google Sheets Api Key

Starting with version 3.0.0, gsheets uses the official Google Sheets API v4, which requires an API key. To get an API key [follow these instructions](https://developers.google.com/sheets/api/guides/authorizing#APIKey).

### Node.js

Node.js >= 12 is required.

```
npm install gsheets
```

```js
const gsheets = require('gsheets');

gsheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE', 'GSHEETS_API_KEY')
  .then(res => console.log(res), err => console.error(err));
```

### In the Command Line

```
gsheets --key --title [--apiKey] [--out] [--pretty] [--dsv]
  --key     Spreadsheet Key (ID), required
  --title   Worksheet title, required

  --apiKey  Google Sheets v4 API key, 
  --out     Output file; defaults to /dev/stdout
  --dsv     Format as delimiter-separated values
  --csv     Shortcut for --dsv=,
  --tsv     Shortcut for --dsv=$'\t'
```

Supports providing the apiKey via arg:

```sh
npx gsheets --key=SPREADSHEETID --title=foobar --apiKey=GSHEETS_API_KEY --pretty
```

or via env:

```sh
npx GSHEETS_API_KEY=xyz gsheets --key=SPREADSHEETID --title=foobar --pretty
```

if you are using dotenv in your project, you can specify GSHEETS_API_KEY as a var in your .env file and run:

```sh
NODE_OPTIONS='-r dotenv/config' gsheets --key=SPREADSHEETID--title=foobar --pretty
```

## Features

* Plain JS/JSON data. No 'models'. Just use `.map`, `.filter` etc.
* Correct handling of numeric cells (no formatted strings for numbers!)
* Empty cells are converted to `null`
* Empty rows and empty columns are omitted
* Empty worksheets returns an object with an empty data array: `{data: []}`

## Caveats

* Beware of cells formatted as dates! Their values will be returned as Excel-style [DATEVALUE](http://office.microsoft.com/en-001/excel-help/datevalue-function-HP010062284.aspx) numbers (i.e. based on the number of *days* since January 1, 1900)

## Why not use another library?

There are a few libraries around which allow you to access Google Spreadsheets, most notably [Tabletop](https://github.com/jsoma/tabletop). However, they all have one or several drawbacks:

* They wrap the output in classes or models with a custom API, whereas all we really need is an array of JS objects
* Tabletop just logs errors to the console which makes proper error handling impossible
* Incorrect handling of numeric cell values (you only get a *formatted* string instead of the actual number, e.g. `"123'456.79"` instead of `123456.789`)

## API

```js
var gsheets = require('gsheets');
```

#### getWorksheet(<i>spreadsheetKey</i>: string, <i>worksheetTitle</i>: string, , <i>gsheetsApiKey</i>: string): Promise

Returns the contents of a worksheet, specified by its title.

For empty worksheets `data` is `[]`.

```js
gsheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE', 'GSHEETS_API_KEY')
  .then(res => console.log(res));
```

Example Response:

```js
{
  "data": [
    {
      "foo": "bar",
      "baz": 42,
      "boing": null
    },
    // more rows ...
  ]
}
```

## Development

Replace "YOUR_GSHEETS_API_KEY" in index.tests.js with your key, then run the tests with:

```sh
npm run test:watch
```

Have a look at the [test spreadsheet](https://docs.google.com/spreadsheets/d/1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU/edit#gid=257911996)

Publish a new version with
```
npm run shipit
```

## Author

Jeremy Stucki, [Interactive Things](http://www.interactivethings.com)

## License

BSD, see LICENSE
