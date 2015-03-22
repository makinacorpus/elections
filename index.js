(function () {
    var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');

    function handleNonExpressed(item) {
        var code = item[1];
        if (code === "NUL" || code === "BLANC" || code === "ABSTENTION") {
            item[4] = code;
            if (code === "NUL") {
                item[3] = "Nul";
            } else if (code === "BLANC") {
                item[3] = "Blanc";
            } else {
                item[3] = "Abstention";
            }
        }
    }

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

    function computePercent(canton) {
        var total = canton.reduce(function(acc, item) {
            return acc += item.votes;
        }, 0);
        canton.forEach(function(candidat) {
            candidat.pourcentage = (candidat.votes / total) * 100;
        });
    }

    function formatCandidat(cantonCode, candidat) {
        /* FIXME: ajouter les bureaux de vote */
        var pourcentage = isNaN(candidat.pourcentage) ? undefined : candidat.pourcentage;
        return [cantonCode, undefined, candidat.nomCandidat, candidat.parti, pourcentage];
    }

    function convertData(data) {
        var cantonCode, canton,
            result = [["Code du canton", "Code bureau", "Binome", "Code Parti", "Pourcentage" ]],
            data = data.slice(1),
            cantonMap = groupByCanton(data);
        for (cantonCode in cantonMap) {
            canton = cantonMap[cantonCode];
            computePercent(canton);
            canton.forEach(function(candidat) {
                var resultCandidat = formatCandidat(cantonCode, candidat);
                result.push(resultCandidat);
            });
        }
        console.log(result);
    };

    var spreadsheets_uuids = [
        '1G8ArsOjOeJsvKoaHxPVoWS5mTbSMaoVGqgURWzLrZNA',
    ];

    spreadsheets_uuids.forEach(function(uuid){
        var data = gdoc2json.get(uuid, convertData);
    });

}());
