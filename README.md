# gsheets

Get public Google Sheets as plain JavaScript/JSON.

```sh
npm install gsheets -g
```

Works in Node.js

```js
var gsheets = require('gsheets');

gsheets.getWorksheet('1iOqNjB-mI15ZLly_9lqn1hCa6MinqPc_71RoKVyCFZs', 'foobar', function(err, res) {
  console.log(res);
});
```

the browser (use the pre-built `gsheets.js` or `gsheets.min.js`)

```html
<script src="../gsheets.js"></script>
<script>
  gsheets.getWorksheet('1iOqNjB-mI15ZLly_9lqn1hCa6MinqPc_71RoKVyCFZs', 'foobar', function(err, res) {
    console.log(res);
  });
</script>
```

and on the Command Line.

```sh
gsheets --key=1iOqNjB-mI15ZLly_9lqn1hCa6MinqPc_71RoKVyCFZs --title=foobar --pretty
```

### Features

* Plain JS/JSON data. No 'models'. Just use `.map`, `.filter` etc.
* Correct handling of numeric cells (no formatted strings for numbers!)
* Empty cells are converted to `null`
* A bit of metadata (i.e. when a spreadsheet was updated)
* Empty rows are omitted
* Correct handling of empty worksheets

### Non-features

* Authorization (only works with [published spreadsheets](https://support.google.com/docs/answer/37579?hl=en&ref_topic=2818999))
* Querying, ordering, updating
* Caching. Use a reverse proxy or implement your own caching strategy. I recommend this strongly since Google's API isn't the fastest and you don't want to hit rate limits.

### Caveats

* Beware of cells formatted as dates! Their values will be returned as Excel-style [DATEVALUE](http://office.microsoft.com/en-001/excel-help/datevalue-function-HP010062284.aspx) numbers (i.e. based on the number of *days* since January 1, 1900)

### Why not use another library?

There are a few libraries around which allow you to access Google Spreadsheets, most notably [Tabletop](https://github.com/jsoma/tabletop). However, they all have one or several drawbacks:

* They wrap the output in classes or models with a custom API, whereas all we really need is an array of JS objects
* Tabletop just logs errors to the console which makes proper error handling impossible
* Incorrect handling of numeric cell values (you only get a *formatted* string instead of the actual number, e.g. `"123'456.79"` instead of `123456.789`)

## Node API

```js
var gsheets = require('gsheets');
```

#### getSpreadsheet(<i>spreadsheetKey</i>, <i>callback</i>)

Returns information about a spreadsheet including a list of worksheets.

```js
gsheets.getSpreadsheet('MY_KEY', function(err, res) {
  // ...
});
```

Example Response:

```js
{
  "updated": "2014-11-19T10:20:18.068Z",
  "title": "My Awesome Spreadsheet",
  "worksheets": [
    {
      "id": "od6",
      "title": "foobar"
    },
    // more worksheets ...
  ]
}
```

#### getWorksheet(<i>spreadsheetKey</i>, <i>worksheetTitle</i>, <i>callback</i>)

Returns the contents of a worksheet, specified by its title. *Note* that this generates two requests (to resolve a worksheet's title). If you know a worksheet's ID (e.g. via a previous call to `listWorksheets`), use `getWorksheetById`

For empty worksheets `data` is `null`.

```js
gsheets.getWorksheet('MY_KEY', 'foobar' function(err, res) {
  // ...
});
```

Example Response:

```js
{
  "updated": "2014-11-19T10:20:18.068Z",
  "title": "foobar",
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

#### getWorksheetById(<i>spreadsheetKey</i>, <i>worksheetId</i>, <i>callback</i>)

Returns the contents of a worksheet, specified by its ID.

For empty worksheets `data` is `null`.

```js
gsheets.getWorksheetById('MY_KEY', 'od6' function(err, res) {
  // ...
});
```

Example Response:

```js
{
  "updated": "2014-11-19T10:20:18.068Z",
  "title": "foobar",
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
gsheets --key [--id] [--title] [--out] [--pretty] [--dsv]
  --key     Spreadsheet key; Outputs spreadsheet info if no other option is provided
  --out     Output file; defaults to /dev/stdout
  --id      Worksheet ID; use either this or --title to get worksheet contents
  --title   Worksheet title; use either this or --id to get worksheet contents
  --pretty  Pretty-print JSON
  --dsv     Format as delimiter-separated values
  --csv     Shortcut for --dsv=,
  --tsv     Shortcut for --dsv=$'\t'
```

## Development

Run the tests with

```sh
npm test
```

Have a look at the [test spreadsheet](https://docs.google.com/spreadsheets/d/1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU/edit#gid=257911996)

## Author

Jeremy Stucki, [Interactive Things](http://www.interactivethings.com)

## License

BSD, see LICENSE