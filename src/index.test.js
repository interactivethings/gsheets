require("isomorphic-fetch");
require("dotenv").config();
const getWorksheet = require("./index");

const TEST_SPREADSHEET_KEY = "1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU"; // new

test("Worksheet", () =>
  getWorksheet(TEST_SPREADSHEET_KEY, "something").then((worksheet) => {
    expect(worksheet).toMatchSnapshot();
  }));

test("Empty worksheet", () =>
  getWorksheet(TEST_SPREADSHEET_KEY, "nothing").then((worksheet) => {
    expect(worksheet).toMatchSnapshot();
  }));
