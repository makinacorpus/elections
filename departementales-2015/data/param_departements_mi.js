var options = {
  // Map options
  fullscreenControl: true,
  mapDivId: 'map',
  minZoom: 6,
  maxZoom: 7,
  startZoom: 6,
  center: [46.50, 1.45],
  // Data options
  resultFile: 'data/resultats/departements/1/france.json',
  resultFileTour2: 'data/resultats/departements/2/france.json',
  entityFile: '../resources/departements.geojson',
  neutralColor: '#FFFFFF',
  // Legend options
  legendTitle: '<h3>Partis arrivés en tête (en nombre de voix)</h3><p><small>La couleur du département montre la nuance ayant recueilli le plus grand nombre de voix, pas celle qui a le plus grand nombre d\'élus.</small></p>',
  entityName: 'Département : ',
  legendHelp: 'Survolez un département pour plus de détails.',
  // Additionnal layer ?
  additionalLayer: 'data/regions_2015.geojson',
  link: 'http://cartes-elections.makina-corpus.net/departementales-2015/resultats-cantons.html?dep=feature'
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
  for (var i = 0; i < data.length; i++) {
    currentData = data[i];
    entityId    = currentData.CodMinDpt;
    entityName  = currentData.LibDpt;
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
    var resultats = currentData.Resultats.NuancesBin.NuanceBin;
    for (var j = 0; j < resultats.length; j++) {
      var temp = resultats[j];
      parti = temp.CodNuaBin;
      parti = parti.split('-')[1];
      score = parseInt(temp.NbVoix);
      elus  = parseInt(temp.NbElus);
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
      results[resultId].elus[parti] = elus;
    }
  }
  return results;
}

/**
 * This function retrieve the id of the geometrical layer.
 */
function getBorderId(layer) {
  return layer.feature.properties.code;
}

/**
 * This function retrieve the TEXT version of the id
 * of the geometrical layer.
 */
function getResultId(feature) {
  return feature.properties.code;
}
