(function () {
    var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');
    var fs        = require('fs');

    function _writeCallback (err) {
        if (err) throw err;
        console.log('File saved');
    }

    function _convertData(data) {
        var result = {};

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
            var id = [cols.canton, cols.bureau, cols.codeCandidat].join('-');
            result[id] = [
                cols.canton,
                cols.bureau,
                cols.nomCandidat,
                cols.parti,
                cols.votes,
                cols.commune
            ];
        });
        var d = new Date();
        var filename = d.toISOString().split('T')[0] + '-' + d.getTime() + '.json';

        fs.readFile('resources/31-elections-departementales-2015-1er-tour.json', { encoding: 'utf8' }, function (err, json) {
            var data   = JSON.parse(json);
            var output = [];

            data.forEach(function (r) {
                for (var i = 1; i <= r.fields.nombre_de_listes_pour_le_canton; i++) {
                    var resultLine = [r.fields.code_canton, r.fields.numero_du_bureau_de_vote_assn, i].join('-');
                    var fieldName  = 'nbr_voixliste' + ('abcdefghijkl'[i-1]);
                    if (result[resultLine]) {
                        result[resultLine][4] = r.fields[fieldName];
                    }
                }
            });
            var j;
            for (j in result) {
                output.push(result[j]);
            }
            console.log(output);
            // fs.writeFile(filename, JSON.stringify(result), _writeCallback);
        });

    };

    var spreadsheets_uuids = [
        '1SNG7NRLkBZoGMGcvd1LQxpdgyYvZJQtB1qVMzOaIoxc', // real spreadsheet for dpt 31
        // '1-txT_1hVHYdOAnEQpnH_w4PlhCVzyr3pEgoV_IYldFI', // test spreadsheet
    ];

    spreadsheets_uuids.forEach(function(uuid){
        gdoc2json.get(uuid, _convertData);
    });

}());
