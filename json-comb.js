(function () {
    var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');
    var fs        = require('fs');

    function _writeCallback (err) {
        if (err) throw err;
        console.log('File saved');
    }

    function _convertData(data) {
        var result = [];

        data.forEach(function(row) {
            var cols = {
                canton:       row[0],
                commune:      row[1],
                bureau:       row[2],
                codeCandidat: row[3],
                nomCandidat:  row[4],
                parti:        row[5],
                votes:        row[6]
            };
            result.push([
                cols.canton,
                cols.bureau,
                cols.nomCandidat,
                cols.parti,
                cols.votes,
                cols.commune
            ]);
        });
        var d = new Date();
        var filename = d.toISOString().split('T')[0] + '-' + d.getTime() + '.json';
        fs.writeFile(filename, JSON.stringify(result), _writeCallback);
    };

    var spreadsheets_uuids = [
        '1SNG7NRLkBZoGMGcvd1LQxpdgyYvZJQtB1qVMzOaIoxc',
        // '1-txT_1hVHYdOAnEQpnH_w4PlhCVzyr3pEgoV_IYldFI',
    ];

    spreadsheets_uuids.forEach(function(uuid){
        gdoc2json.get(uuid, _convertData);
    });

}());
