var vows = require('vows'),
    assert = require('assert'),
    spreadsheetService = require('../index');

// var TEST_SPREADSHEET_KEY = '0Ah1wZzkSewdkdFljWjJUWm14TmkxTGZIaHdDTUEyeVE'; // old
var TEST_SPREADSHEET_KEY = '1dmAQO0zCQz5SNUKalw9NNXwTM6TgDBZ820Ftw-cz5gU'; // new

vows.describe('google-spreadsheet-service').addBatch({
  'Spreadsheet': {
    topic: function() {
      spreadsheetService.sheets(TEST_SPREADSHEET_KEY, this.callback);
    },
    'can be fetched': function(err, spreadsheet) {
      assert.isNull(err);
      assert.isObject(spreadsheet);
    },
    '"updated" is string': function(spreadsheet) {
      assert.isString(spreadsheet.updated);
    },
    '"updated" can be parsed into a valid date': function(spreadsheet) {
      // See http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
      assert.isNumber((new Date(spreadsheet.updated)).getTime());
    },
    'contains 2 worksheets': function(spreadsheet) {
      assert.isArray(spreadsheet.worksheets);
      assert.strictEqual(spreadsheet.worksheets.length, 2);
    },
    'worksheets have "id" and "title" properties': function(spreadsheet) {
      assert.isString(spreadsheet.worksheets[0].id);
      assert.isString(spreadsheet.worksheets[0].title);
    },
    'worksheets are named "nothing" and "something"': function(spreadsheet) {
      assert.strictEqual(spreadsheet.worksheets[0].title, 'nothing');
      assert.strictEqual(spreadsheet.worksheets[1].title, 'something');
    },
  },
  'Non-existent Spreadsheet': {
    topic: function() {
      spreadsheetService.sheets('xyz', this.callback);
    },
    'provides an error': function(err, spreadsheet) {
      assert.instanceOf(err, Error);
      assert.isUndefined(spreadsheet);
    }
  },
  'Worksheet': {
    topic: function() {
      spreadsheetService.sheet(TEST_SPREADSHEET_KEY, 'something', this.callback);
    },
    'can be fetched': function(err, worksheet) {
      assert.isNull(err);
      assert.isObject(worksheet);
    },
    '"updated" is string': function(worksheet) {
      assert.isString(worksheet.updated);
    },
    '"updated" can be parsed into a valid date': function(worksheet) {
      // See http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
      assert.isNumber((new Date(worksheet.updated)).getTime());
    },
    '"data" is array with 4 rows': function(worksheet) {
      assert.isArray(worksheet.data);
      assert.strictEqual(worksheet.data.length, 4);
    },
    'rows have "id", "name", "väl-ue", "should" columns': function(worksheet) {
      worksheet.data.forEach(function(row) {
        ['id', 'name', 'väl-ue', 'should'].forEach(function(key) {
          assert.include(row, key);
        });
      });
    },
    'cells are parsed correctly': function(worksheet) {
      assert.strictEqual(worksheet.data[0].id, 1);
      assert.strictEqual(worksheet.data[0].name, 'foo');
      assert.strictEqual(worksheet.data[0]['väl-ue'], null);

      assert.strictEqual(worksheet.data[1].id, 2);
      assert.strictEqual(worksheet.data[1].name, ' ');
      assert.strictEqual(worksheet.data[1]['väl-ue'], 123456.789);

      assert.strictEqual(worksheet.data[2].id, 3);
      assert.strictEqual(worksheet.data[2].name, 'baz');
      assert.strictEqual(worksheet.data[2]['väl-ue'], 1e-6);

      assert.strictEqual(worksheet.data[3].id, 0);
      assert.strictEqual(worksheet.data[3].name, 'null');
      assert.strictEqual(worksheet.data[3]['väl-ue'], '1+2');
    },
  },
  'Empty Worksheet': {
    topic: function() {
      spreadsheetService.sheet(TEST_SPREADSHEET_KEY, 'nothing', this.callback);
    },
    'can be fetched': function(err, worksheet) {
      assert.isNull(err);
      assert.isObject(worksheet);
    },
    '"updated" is string': function(worksheet) {
      assert.isString(worksheet.updated);
    },
    '"updated" can be parsed into a valid date': function(worksheet) {
      // See http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
      assert.isNumber((new Date(worksheet.updated)).getTime());
    },
    '"data" is null': function(worksheet) {
      assert.isNull(worksheet.data);
    }
  },
  'Non-existent Worksheet': {
    topic: function() {
      spreadsheetService.sheet(TEST_SPREADSHEET_KEY, 'abc', this.callback);
    },
    'provides an error': function(err, worksheet) {
      assert.instanceOf(err, Error);
      assert.isUndefined(worksheet);
    }
  },
}).export(module);