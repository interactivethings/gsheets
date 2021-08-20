const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

// Fetching

function fetchFeed(id, apiKey, title) {
  const url = `${BASE_URL}/${id}/values/${title}?key=${apiKey}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(
          new Error("The spreadsheet doesn´t exist or isn´t public.")
        );
      }
      return response.json();
    })
    .then((data) => {
      return new Promise((resolve, reject) => {
        if (data.values) {
          resolve(data.values);
        } else {
          reject(new Error("No feed was returned"));
        }
      });
    });
}

function fetchWorksheetByTitle(id, apiKey, title) {
  return fetchFeed(id, apiKey, title).then(parseWorksheet);
}

// Parsing

function parseWorksheet(values) {
  const keys = values[0]
  const filteredValues = values.filter(value => value.length !== 0)
  filteredValues.shift()
  const valueArrayofObjects = filteredValues.map(
    arr => Object.fromEntries(arr.map((v, i) => [keys[i], v]))
  );
  return {
    data: valueArrayofObjects || [],
  };
}

// Public API

export const getWorksheet = fetchWorksheetByTitle;
