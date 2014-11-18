# Spreadsheet API

A tiny API server for retrieving Google Spreadsheets as JSON.

### Features:

* Simply get contents of Google Spreadsheet as JSON
* Numbers are parsed where possible (currently it's not possible to disable this)
* Empty cells are converted to `null`
* A bit of metadata (i.e. when a spreadsheet was updated)

### Intentionally left out:

* Querying, ordering or any of the fancy stuff.
* Writing to spreadsheets.
* Accessing the cells feed. We just care about worksheet contents in rows.
* Caching. Use a reverse proxy or implement your own caching strategy.

### Why?

There are a few libraries around which allow you to access Google Spreadsheets, most notably Tabletop.js. They all have a few drawbacks:

- They wrap the output in classes or models with a custom API, whereas all we really need is JSON
- Tabletop just logs errors to the console which makes proper error handling impossible
- Incorrect parsing of cell values

## API

GET **/KEY.json**

List the worksheets of a spreadsheet. Example response:

```json
{
  "updated" : "2014-02-11T10:23:58.718Z",
  "worksheets" : [
    {
      "id" : "od6",
      "title" : "worksheet-title"
    }
  ]
}
```

GET **/KEY/SHEETNAME.json**

Get contents of a worksheet. Note that `data` is `null` when the worksheet is empty. Example response:

```json
{
  "updated" : "2014-02-11T10:23:58.718Z",
  "title" : "worksheet-title",
  "data" : [
    {
      "a_column" : null,
      "some_column" : 1,
      "another_column" : "foo"
    }
  ]
}
```

GET **/purge/KEY.json**

Purge cache for all worksheets in the specified spreadsheet. Will respond with an error if Fastly isn't configured.

GET **/purge/KEY/SHEETNAME.json**

Purge cache for an individual worksheet. Will respond with an error if Fastly isn't configured.

## Author

Jeremy Stucki, [Interactive Things](http://www.interactivethings.com)

## License

BSD, see LICENSE.txt