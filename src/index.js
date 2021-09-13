const fetch = require("node-fetch");
const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const defaultApiKey = process.env.GSHEETS_API_KEY;

// Fetching

function fetchFeed(key, title, apiKey) {
  const url = `${BASE_URL}/${key}/values/${title}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return new Promise((resolve, reject) => {
        if (data.error) {
          reject(
            new Error(
              `Error: ${data.error.code} ${data.error.status}: ${data.error.message}`
            )
          );
        } else if (data) {
          resolve(data);
        } else {
          reject(new Error("No spreadsheet was returned"));
        }
      });
    });
}

function getWorksheet(key, title, apiKey = defaultApiKey) {
  return new Promise((resolve, reject) => {
    if (apiKey) {
      const data = fetchFeed(key, title, apiKey).then(parseWorksheet);
      resolve(data);
    } else {
      reject(
        new Error(
          "No api key provided. Provide it via the apiKey argument or with a GSHEETS_API_KEY var via your environment."
        )
      );
    }
  });
}

// Parsing

function parseWorksheet(data) {
  const worksheetArrayOfRows = data.values;
  // return empty if worksheet is empty
  if (!worksheetArrayOfRows) {
    return {
      data: [],
    };
  }
  const keys = worksheetArrayOfRows[0];
  // BACKCOMPAT: get indexes of empty columns
  const emptyColumnIndexes = keys.reduce(function (a, e, i) {
    if (e === "") a.push(i);
    return a;
  }, []);
  const filteredKeys = keys.filter((v, i) => !emptyColumnIndexes.includes(i));
  const filteredWorksheetArray = worksheetArrayOfRows
    // remove empty Rows
    .filter((rowArray) => rowArray.length !== 0)
    .map((rowArray) =>
      rowArray
        // BACKCOMPAT: remove empty Columns
        .filter((cell, i) => !emptyColumnIndexes.includes(i))
        // BACKCOMPAT: return empty cells as NULL instead of empty strings
        .map((cell) =>
          cell === undefined || cell === null || cell.length === 0 ? null : cell
        )
    );
  filteredWorksheetArray.shift();
  const worksheetArrayofObjects = filteredWorksheetArray.map((arr) =>
    Object.fromEntries(arr.map((v, i) => [filteredKeys[i], v]))
  );
  return {
    data: worksheetArrayofObjects || [],
  };
}

module.exports = { getWorksheet };
