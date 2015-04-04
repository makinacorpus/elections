var options = {
  // Map options
  fullscreenControl: true,
  mapDivId: 'map',
  minZoom: 8,
  maxZoom: 11,
  startZoom: 9,
  // Data options
  resultFile: 'data/resultats/cantons/1/001.json',
  resultFileTour2: 'data/resultats/cantons/2/001.json',
  entityFile: 'data/cantons/cantons_01_2015.geojson',
  neutralColor: '#FFFFFF',
  // Legend options
  legendTitle: '<h3>Résultats par canton</h3><p><a href="http://cartes-elections.makina-corpus.net/departementales-2015/resultats-departements.html">Tous les départements</a></p>',
  legendHelp: 'Survolez un canton pour plus de détails. Les cantons en blanc indiquent un candidat élu au premier tour.',
  // Additionnal layer ?
  // additionalLayer:
};

function getParamOptions(departement) {
  var tempOpt = options;
  tempOpt.entityFile = 'data/cantons/cantons_' + departement + '_2015.geojson';
  if (departement.length == 2) {
    tempOpt.resultFile = 'data/resultats/cantons/1/0' + departement + '.json';
    tempOpt.resultFileTour2 = 'data/resultats/cantons/2/0' + departement + '.json';
  } else {
    tempOpt.resultFile = 'data/resultats/cantons/1/' + departement + '.json';
    tempOpt.resultFileTour2 = 'data/resultats/cantons/2/' + departement + '.json';
  }
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
  var entityId, parti, score, currentData;
  var results = {};
  var cantons =  data.Cantons;
  // Start with i = 1 because of headers row
  for (var i = 0; i < cantons.length; i++) {
    currentData = cantons[i];
    entityId    = ""+parseInt(currentData.CodCan);
    entityName  = 'Canton : ' + currentData.LibCan;
    resultId    = entityId;
    // Init.
    results[resultId] = {
      name: entityName,
      scores: {},
      elus: {},
      winner: {
        parti: 'NUL',
        score: 0
      }
    }
    // Not partis.
    results[resultId].scores['ABSTENTION'] = parseInt(currentData.Mentions.Abstentions.Nombre);
    results[resultId].scores['BLANC'] = parseInt(currentData.Mentions.Blancs.Nombre);
    results[resultId].scores['NUL'] = parseInt(currentData.Mentions.Nuls.Nombre);
    var resultats = currentData.Resultats;
    if (!(resultats instanceof Array)) {
      resultats = [resultats];
    }
    var currentPartis = [];
    for (var j = 0; j < resultats.length; j++) {
      var temp = resultats[j];
      parti       = temp.CodNuaBin;
      parti = parti.split('-')[1];
      if (currentPartis.indexOf(parti) > -1) {
        parti = parti + "2";
      }
      currentPartis.push(parti);
      score = parseInt(temp.NbVoix);
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
      if (temp.Elu === 'oui') {
        results[resultId].elus[parti] = 2;
      }
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
