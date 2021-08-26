const { getWorksheet } = require("./index");

const TEST_SPREADSHEET_KEY = "1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU";
const TEST_GSHEETS_API_KEY = "YOUR API KEY"

test("Worksheet", () =>
  getWorksheet(TEST_SPREADSHEET_KEY, "something", TEST_GSHEETS_API_KEY).then((worksheet) => {
    expect(worksheet).toMatchSnapshot();
  }));

test("Empty worksheet", () =>
  getWorksheet(TEST_SPREADSHEET_KEY, "nothing", TEST_GSHEETS_API_KEY).then((worksheet) => {
    expect(worksheet).toMatchSnapshot();
  }));
