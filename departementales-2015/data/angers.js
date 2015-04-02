var options = {
  // Map options
  fullscreenControl: true,
  mapDivId: 'map',
  minZoom: 8,
  maxZoom: 18,
  startZoom: 9,
  // Data options
  resultFile: 'data/resultats/cantons_par_bv/1/49007_201_1er15ccanto_ANG1to7 avec canton.json',
  resultFileTour2: 'data/resultats/cantons_par_bv/2/49007_201_2nd15ccanto_ANG1to7 avec canton.json',
  entityFile: 'data/bv/ALM_201_ADM_SECTEUR_BUREAU_VOTE.geojson',
  neutralColor: '#FFFFFF',
  // Legend options
  legendTitle: '<h3>Résultats par bureau de vote</h3><p>',
  entityName: 'Bureau de vote :',
  legendHelp: 'Survolez un bureau de vote pour plus de détails. Les bureaux de votes en blanc indiquent un candidat élu au premier tour.',
  // Additionnal layer ?
  additionalLayer: 'data/cantons/cantons_49_angers_1_a7.geojson'
};


/* This function computes the results from the data and
   should return something like:
{ entityId (text): {
  name: entityName (text),
  scores: { {parti: text, score: int}, {parti: text, score: int} },
  winner: {
    parti: 'parti name' (Text),
    score: parti score (Int)
  }
}}
*/
function computeResults(data) {
  var entityId, parti, score, currentData;
  var results = {};
  // Start with i = 1 because of headers row
  for (var i = 1; i < data.length; i++) {
    currentData = data[i];
    entityId    = currentData.FIELD3;
    if(entityId === ''){
      continue;
    }
    entityName  = currentData.FIELD4;
    resultId    = entityId;
    // Init.
    results[resultId] = {
      name: entityName,
      scores: {},
      winner: {
        parti: 'NUL',
        score: 0
      }
    }
    // Not partis.
    results[resultId].scores['ABSTENTION'] = parseInt(currentData.FIELD5) - parseInt(currentData.FIELD6);
    results[resultId].scores['BLANC'] = parseInt(currentData.FIELD8);
    results[resultId].scores['NUL'] = parseInt(currentData.FIELD7);
    var j = 11;
    while (j < 34) {
      parti       = currentData['FIELD'+(j+1)];
      if (parti === "") {
        break;
      } else {
        parti = parti.split('-')[1];
        score = parseInt(currentData['FIELD'+(j+3)]);
        if (score > results[resultId].winner.score) {
          results[resultId].winner = {
            parti: parti,
            score: score
          };
        } else if (score === results[resultId].winner.score) {
          results[resultId].winner = {
            parti: "BC-egal",
            score: score
          };
        }
        results[resultId].scores[parti] = score;
      }
      // Iterate.
      j += 4;
    }
  }
  return results;
}

/**
 * This function retrieve the id of the geometrical layer.
 */
function getBorderId(layer) {
  return parseInt(layer.feature.properties.NUM_BUREAU);
}

/**
 * This function retrieve the TEXT version of the id
 * of the geometrical layer.
 */
function getResultId(feature) {
  return ""+parseInt(feature.properties.NUM_BUREAU);
}
