# Change Log

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
  .then(result => {})
  .catch(error => {});
```

### Internal changes

- Type checking with [Flow](https://flowtype.org/)
- Testing with [Jest](http://facebook.github.io/jest/)
- Use `fetch` instead of axios
- Build with [rollup](http://rollupjs.org/) instead of webpack
