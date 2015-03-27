var options = {
  // Map options
  fullscreenControl: false,
  mapDivId: 'map',
  minZoom: 14,
  maxZoom: 16,
  startZoom: 14,
  center: [48.355, -1.20],
  // Data options
  resultFile: 'data/res_35115_fougeres.json',
  entityFile: 'data/bv_35115_fougeres.geojson',
  neutralColor: '#AAAAAA',
  // Legend options
  legendTitle: 'Résultats de Fougères',
  entityName: 'Bureau de vote :',
  legendHelp: 'Survolez une zone pour plus de détails.',
  // Additionnal layer ?
  // additionalLayer:
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
    entityId    = currentData.FIELD5;
    entityName  = currentData.FIELD5;
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
    results[resultId].scores['ABSTENTION'] = parseInt(currentData.FIELD6) - parseInt(currentData.FIELD7);
    results[resultId].scores['BLANC'] = parseInt(currentData.FIELD7) - parseInt(currentData.FIELD8);
    results[resultId].scores['NUL'] = parseInt(currentData.FIELD7) - parseInt(currentData.FIELD8);
    var j = 10;
    while (j < 25) {
      parti       = currentData['FIELD'+j];
      if (parti === "") {
        break;
      } else {
        parti = parti.split('-')[1];
        score = parseInt(currentData['FIELD'+(j+2)]);
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
  return parseInt(layer.feature.properties.BV2015);
}

/**
 * This function retrieve the TEXT version of the id
 * of the geometrical layer.
 */
function getResultId(feature) {
  return ""+parseInt(feature.properties.BV2015);
}
