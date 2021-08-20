# gsheets

Get public Google Sheets as plain JavaScript/JSON.

:point_right: [Try gsheets in your browser](https://runkit.com/npm/gsheets)

## Usage

### Node.js

Node.js >= 4 is required.

```
npm install gsheets
```

```js
require('isomorphic-fetch');
const gsheets = require('gsheets');

gheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE')
  .then(res => console.log(res), err => console.error(err));
```

### In the browser

```html
<script src="https://unpkg.com/gsheets@next/gsheets.polyfill.min.js"></script>
<script>
  gheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE')
    .then(res => console.log(res), err => console.error(err));

</script>
```

### On the Command Line

```
npm install gsheets -g
```

```sh
gsheets --key=1iOqNjB-mI15ZLly_9lqn1hCa6MinqPc_71RoKVyCFZs --title=foobar
```

### Compatibility Note

gsheets uses the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) and [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise). Depending on your environment, you'll need to polyfill those. Recommendations:

- [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
- [es6-promise](https://github.com/stefanpenner/es6-promise)

For direct usage in the browser, there's a pre-built version of gsheets which the polyfills at [gsheets.polyfill.js](https://unpkg.com/gsheets@next/gsheets.polyfill.js) and [gsheets.polyfill.min.js](https://unpkg.com/gsheets@next/gsheets.polyfill.min.js).

## Features

* Plain JS/JSON data. No 'models'. Just use `.map`, `.filter` etc.
* Correct handling of numeric cells (no formatted strings for numbers!)
* Empty cells are converted to `null`
* A bit of metadata (i.e. when a spreadsheet was updated)
* Empty rows are omitted
* Correct handling of empty worksheets

## Non-features

* Authorization (only works with [published spreadsheets](https://support.google.com/docs/answer/37579?hl=en&ref_topic=2818999))
* Querying, ordering, updating
* Caching. Use a reverse proxy or implement your own caching strategy. I recommend this strongly since Google's API isn't the fastest and you don't want to hit rate limits.

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

#### getWorksheet(<i>spreadsheetKey</i>: string, <i>worksheetTitle</i>: string): Promise

Returns the contents of a worksheet, specified by its title.

For empty worksheets `data` is `[]`.

```js
gsheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE')
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

## Command Line

Write spreadsheet contents to a file as JSON or DSV.

```
gsheets --id --title [--out] [--pretty] [--dsv]
  --key      Spreadsheet Key, required
  --title   Worksheet ID, required

  --out     Output file; defaults to /dev/stdout
  --title   Worksheet title; use either this or --id to get worksheet contents
  --pretty  Pretty-print JSON
  --dsv     Format as delimiter-separated values
  --csv     Shortcut for --dsv=,
  --tsv     Shortcut for --dsv=$'\t'
```

## Development

Run the tests with

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
