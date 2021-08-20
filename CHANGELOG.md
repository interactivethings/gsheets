# Change Log

## 3.0.0

### Breaking

Due to google sunsetting the previous docs API, gsheets 3.0.0 now uses the official sheets API v4, which requires an **API Key**.

The new API does not return any meaningful metadata of the spreadsheets and allows for direct query of a worksheet by it's title. Thus the methods gsheets.getWorksheetById and gsheets.getSpreadsheets have been removed.

Now:

```js
gheets.getWorksheet('spreadsheetId', 'apiKey', 'worksheetTitle')
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
