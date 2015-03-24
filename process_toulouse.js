var jf = require('jsonfile');
var util = require('util');
var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');
var mapping = {
  "42":2,
  "93":3,
  "20":1,
  "37":3,
  "117":4,
  "38":1,
  "23":1,
  "3":4,
  "135":3,
  "52":4,
  "77":1,
  "137":2,
  "99":2,
  "133":5,
  "132":3,
  "85":5,
  "45":1,
  "33":4,
  "98":5,
  "62":4,
  "107":5,
  "75":4,
  "125":3,
  "122":4,
  "18":4,
  "43":1,
  "112":2,
  "13":4,
  "121":2,
  "136":1,
  "32":2,
  "68":5,
  "92":1,
  "87":3,
  "17":4,
  "36":6,
  "130":2,
  "63":5,
  "27":2,
  "40":3,
  "89":3,
  "39":1,
  "15":3,
  "51":4,
  "34":1,
  "124":5,
  "6":6,
  "76":3,
  "48":3,
  "88":1,
  "79":5,
  "11":2,
  "58":2,
  "80":2
};
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
                    var id_liste = item[3]; //Spreadsheet 1,2,3,4,5
                    var i = 0;
                    while(i < 12) {
                      var key = "id_liste" + listes[i];
                      var list_id = bureaux[bureau][key];
                      var list_num = mapping[list_id];
                      if (list_num == id_liste) {
                        break;
                      }
                      i++;
                    }
                    voix = bureaux[bureau]['nbr_voixliste'+listes[i]];
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
