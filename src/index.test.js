require('isomorphic-fetch');
const {getWorksheet, getWorksheetById, getSpreadsheet} = require('./index');

const TEST_SPREADSHEET_KEY = '1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU'; // new

test('Spreadsheet', () => getSpreadsheet(TEST_SPREADSHEET_KEY).then((spreadsheet) => {
  expect(spreadsheet).toBeDefined();
  // expect(spreadsheet.updated).toBeInstanceOf(String);
  expect(spreadsheet.worksheets.length).toBe(2);
  expect(spreadsheet.worksheets[0].title).toBe('nothing');
  expect(spreadsheet.worksheets[1].title).toBe('something');
}));

test('Non-existent spreadsheet', () => getSpreadsheet('xyz').catch((err) => expect(err).toBeInstanceOf(Error)));

test('Worksheet', () => getWorksheet(TEST_SPREADSHEET_KEY, 'something').then((worksheet) => {
  expect(worksheet).toMatchSnapshot();
}));
