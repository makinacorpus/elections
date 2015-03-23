var jf = require('jsonfile');
var util = require('util');
var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');

var bureaux = {};
var listes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
var file = './departementales-2015/data/resultats/tour1/elections-departementales-2015-1er-tour.json'
jf.readFile(file, function(err, obj) {
    var len = obj.length;
    for(var i=0;i<len;i++) {
        numero = obj[i].fields.numero_du_bureau_de_vote_assn;
        bureaux[numero] = obj[i].fields;
    }

    function convertData(data) {
        var result = [["Code du canton", "Code bureau", "Binome", "Code Parti", "Voix" ]],
            data = data.slice(1);
        data.forEach(function(item) {
            var bureau = item[2];
            if(bureau && bureaux[bureau]) {
                var voix;
                if(item[4]=='NUL') {
                    voix = bureaux[bureau]['nombre_de_bulletins_nuls'];
                } else if(item[4]=='BLANC') {
                    voix = bureaux[bureau]['nombre_de_bulletins_blancs'];
                } else if(item[4]=='ABSTENTION') {
                    voix = bureaux[bureau]['nombre_d_inscrits'] - bureaux[bureau]['nombre_de_votants_d_apres_les_feuilles_d_emargement'];
                } else {
                    var id_liste = item[3];
                    voix = bureaux[bureau]['nbr_voixliste'+listes[id_liste]];
                }
                result.push([item[0], bureau, item[4], item[5], voix]);
            } else {
                if(typeof item[0] !='undefined' && typeof item[2] !='undefined' && typeof item[4] !='undefined' && typeof item[5] !='undefined' && typeof item[6] !='undefined' && typeof item[0] !='undefined') {
                    result.push([item[0], bureau, item[4], item[5], item[6]]);
                }
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
});
