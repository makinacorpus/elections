module.exports = (function () {

  var GoogleSpreadsheet = require("google-spreadsheet");
  var async             = require('async');
  var cb;

  function _parseCells (err, cells_data) {
    var output = [], row;
    cells_data.forEach(function (cell) {
      var row = cell.row - 1;
      var col = cell.col - 1;

      if (!(output[row] instanceof Array)) {
        output[row] = [];
      }
      output[row][col] = cell.value;
    });

    cb(output);
  }

  function _get (docKey, callback) {
    var my_sheet = new GoogleSpreadsheet(docKey);

    cb = callback;
    my_sheet.getCells(1, _parseCells);

  }

  return {
    get: _get
  }
}());