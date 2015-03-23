(function () {
    var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');

    function groupByCanton(data) {
        var cantonMap = {};
        data.forEach(function(item) {
            handleNonExpressed(item);
            var canton = item[0],
                codeCandidat = item[1],
                nomCandidat = item[3],
                parti = item[4],
                votes = item[5];
            if (!(canton in cantonMap)) {
                cantonMap[canton] = [];
            }
            cantonMap[canton].push({
                nomCandidat: nomCandidat,
                parti: parti,
                votes: parseInt(votes, 10)
            });
        });
        return cantonMap;
    }

    function convertData(data) {
        var result = [["Code du canton", "Code bureau", "Binome", "Code Parti", "Voix" ]],
            data = data.slice(1);
        data.forEach(function(item) {
            if(typeof item[0] !='undefined' && typeof item[2] !='undefined' && typeof item[4] !='undefined' && typeof item[5] !='undefined' && typeof item[6] !='undefined' && typeof item[0] !='undefined') {
                result.push([item[0], item[2], item[4], item[5], item[6]]);
            }
        });
        console.log(JSON.stringify(result));
    };

    var spreadsheets_uuids = [
	'1SNG7NRLkBZoGMGcvd1LQxpdgyYvZJQtB1qVMzOaIoxc',
    ];

    spreadsheets_uuids.forEach(function(uuid){
        var data = gdoc2json.get(uuid, convertData);
    });

}());
