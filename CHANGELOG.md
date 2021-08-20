# Change Log

## 3.0.0

### Breaking

Due to google shutting down the previous spreadsheet API, gsheets 3.0.0 now uses the [official sheets API v4](https://developers.google.com/sheets/api/reference/rest), which requires an **GOOGLE_SHEETS_API_KEY**. You may provide it via the environment or a `.env` file when using the CLI.

The new API does not return any meaningful metadata of the spreadsheets and allows for direct query of a worksheet by it's title. Thus the methods gsheets.getWorksheetById and gsheets.getSpreadsheets have been removed.

Now:

```js
gheets.getWorksheet('SPREADSHEET_KEY', 'WORKSHEET_TITLE')
```


## 2.0.0

### Breaking

gsheets now uses Promises instead of callbacks. Everything else stays the same.

Before:

```js
gheets.getWorksheet('ABC', 'xyz', (error, result) => {/*...*/});
```

Now:

```js
gheets.getWorksheet('ABC', 'xyz')
  .then(result => {}, error => {});
```

Also, empty worksheets now contain an empty array as `data` instead of `null`.

### Internal changes

- Type checking with [Flow](https://flowtype.org/)
- Testing with [Jest](http://facebook.github.io/jest/)
- Use `fetch` instead of axios
- Build with [rollup](http://rollupjs.org/) instead of webpack
