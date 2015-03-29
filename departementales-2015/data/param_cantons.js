var options = {
  // Map options
  fullscreenControl: true,
  mapDivId: 'map',
  minZoom: 8,
  maxZoom: 11,
  startZoom: 9,
  // Data options
  resultFile: 'data/resultats/tour1/cantons.json',
  entityFile: 'data/cantons/cantons_01_2015.geojson',
  neutralColor: '#AAAAAA',
  // Legend options
  legendTitle: 'Résultats par canton',
  entityName: 'Canton :',
  legendHelp: 'Survolez un canton pour plus de détails.',
  // Additionnal layer ?
  // additionalLayer:
};

var currentDept;

function getParamOptions(dep) {
  currentDept = dep;
  var tempOpt = options;
  tempOpt.entityFile = 'data/cantons/cantons_' + dep + '_2015.geojson';
  return tempOpt;
}

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
  var entityId, parti, score, currentData, depId;
  var results = {};
  // Start with i = 1 because of headers row
  for (var i = 0; i < data.length; i++) {
    currentData = data[i];
    entityId    = currentData.FIELD3;
    entityName  = currentData.FIELD4;
    resultId    = entityId;
    depId       = currentData.FIELD1;
    if (depId !== currentDept) {
      if ("0"+depId !== currentDept) {
        continue;
      }
    }
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
    results[resultId].scores['ABSTENTION'] = parseInt(currentData.FIELD6);
    results[resultId].scores['BLANC'] = parseInt(currentData.FIELD8);
    results[resultId].scores['NUL'] = parseInt(currentData.FIELD9);
    currentPartis = [];
    var j = 11;
    while (j < 102) {
      parti       = currentData['FIELD'+j];
      if (parti === "") {
        break;
      } else {
        parti = parti.split('-')[1];
        if (currentPartis.indexOf(parti) > -1) {
          parti = parti + "2";
        }
        currentPartis.push(parti);
        score = parseInt(currentData['FIELD'+(j+1)]);
        if (score > results[resultId].winner.score) {
          results[resultId].winner = {
            parti: parti,
            score: score
          };
        } else if (score === results[resultId].winner.score) {
          results[resultId].winner = {
            parti: "egal",
            score: score
          };
        }
        results[resultId].scores[parti] = score;
      }
      // Iterate.
      j +=2;
    }
  }
  return results;
}

/**
 * This function retrieve the id of the geometrical layer.
 */
function getBorderId(layer) {
  return parseInt(layer.feature.properties.CT);
}

/**
 * This function retrieve the TEXT version of the id
 * of the geometrical layer.
 */
function getResultId(feature) {
  return ""+parseInt(feature.properties.CT);
}
