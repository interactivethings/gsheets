# gsheets

Get public Google Spreadsheets as plain JavaScript/JSON.

### Features

* Plain JS/JSON data. No 'models'. Just use `.map`, `.filter` etc.
* Correct handling of numeric cells
* Empty cells are converted to `null`
* A bit of metadata (i.e. when a spreadsheet was updated)
* Empty rows are omitted

### Non-features

* Authorization
* Querying, ordering, updating
* Caching. Use a reverse proxy or implement your own caching strategy.

### Caveats

* Beware of cells formatted as dates! Their values will be returned as Excel-style [DATEVALUE](http://office.microsoft.com/en-001/excel-help/datevalue-function-HP010062284.aspx) numbers (i.e. based on the number of *days* since 01-01-1900)

### Why not use Tabletop?

There are a few libraries around which allow you to access Google Spreadsheets, most notably Tabletop.js. They all have a few drawbacks:

* They wrap the output in classes or models with a custom API, whereas all we really need is an array of JS objects
* Tabletop just logs errors to the console which makes proper error handling impossible
* Incorrect parsing of cell values (when using the row-based lists feed, you only get the *formatted* value for numbers, e.g. `123,456.79` instead of `123456.789`)

## Node API

```js
var gs = require('gsheets');
```

#### listWorksheets(<i>spreadsheetKey</i>, <i>callback</i>)

Returns a list of worksheets contained in a spreadsheet.

```js
gs.listWorksheets('MY_KEY', function(err, res) {
  // ...
});
```

Example Response:

```js
{
  "updated": "2014-11-19T10:20:18.068Z",
  "worksheets": [
    {
      "id": "od6",
      "title": "foobar"
    },
    // more worksheets ...
  ]
}
```

#### getWorksheet(<i>spreadsheetKey</i>, <i>worksheetId</i>, <i>callback</i>)

Returns the contents of a worksheet.

```js
gs.getWorksheet('MY_KEY', 'od6' function(err, res) {
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

#### getWorksheetByTitle(<i>worksheetTitle</i>, <i>callback</i>)

Returns the contents of a worksheet, specified by its title. Note that this generates two requests (to resolve a worksheet's title).

```js
gs.getWorksheetByTitle('MY_KEY', 'foobar' function(err, res) {
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

Write spreadsheet contents to a file as JSON.

```
gsheets --key [--id] [--title] [--out] [--pretty]
  --key     Spreadsheet key
  --out     Output file; default /dev/stdout
  --id      Worksheet ID (use either this or --title)
  --title   Worksheet title (use either this or --id)
  --pretty  Pretty-print JSON
```

## Author

Jeremy Stucki, [Interactive Things](http://www.interactivethings.com)

## License

BSD, see LICENSE