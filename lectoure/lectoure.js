var App = function () {

    var colors = {
        "ANAR":"#000000",
        "EXG":"#BB0000",
        "LO":"#BB0000",
        "NPA":"#BB0000",
        "FG":"#DD0000",
        "PCF":"#DD0000",
        "COM":"#DD0000",
        "PG":"#DD0000",
        "MRC":"#CC6666",
        "ND":"#CC6666",
        "VEC":"#00C000",
        "EELV":"#00C000",
        "CAP":"#77FF77",
        "DVE":"#77FF77",
        "PS":"#FF8080",
        "SOC":"#FF8080",
        "PRG":"#FFD1DC",
        "RDG":"#FFD1DC",
        "DVG":"#FFC0C0",
        "MDM":"#FF9900",
        "UC":"#74C2C3",
        "NC":"#00FFFF",
        "UDI":"#00FFFF",
        "DVD":"#ADC1FD",
        "UMP":"#0066CC",
        "PR":"#0066CC",
        "DLR":"#8040C0",
        "MPF":"#8040C0",
        "PP":"#8040C0",
        "FN":"#C0C0C0",
        "SP":"#C0C0C0",
        "EXD":"#404040",
        "DIV":"#F0F0F0",
        "DLF":"#CCC",
        "UC":"#74C2C3",
        "UD":"#ADC1FD",
        "UG":"#FFC0C0",
        "egal":"#fff",
        "BLANC":"#fff"
        };

    var self = this;
    var legend, legend2, legend3;

    // Legend
    addLegend = function(map) {
      this._div = L.DomUtil.create('div', 'legend info');
      this.update();
      return this._div;
    };

    self.init = function () {
        // init map
        self.map = L.map('municipales2014', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);
        self.map2 = L.map('presidentielle2012', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);
        self.map3 = L.map('departementales2015', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);
        
        // sync maps
        self.map.on('move', follow).on('zoomend', follow);
        self.map2.on('move', follow).on('zoomend', follow);
        self.map3.on('move', follow).on('zoomend', follow);
        var quiet = false;
        function follow(e) {
          if (quiet) return;
          quiet = true;
          if (e.target === self.map) {
            sync(self.map2, e);
            sync(self.map3, e);
          }
          if (e.target === self.map2) {
            sync(self.map, e);
            sync(self.map3, e);
          }
          if (e.target === self.map3) {
            sync(self.map, e);
            sync(self.map2, e);
          }
          quiet = false;
        }
        function sync(map, e) {
          map.setView(e.target.getCenter(), e.target.getZoom(), {
              animate: false,
              reset: true
          });
        }
        
        // Add base layers to the 3 maps.
        var tileLayer = L.tileLayer('http://{s}.tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            maxZoom: 14
        });
        tileLayer.addTo(self.map);
        var tileLayer2 = L.tileLayer('http://{s}.tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            maxZoom: 14
        });
        tileLayer2.addTo(self.map2);
        var tileLayer3 = L.tileLayer('http://{s}.tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            maxZoom: 14
        });
        tileLayer3.addTo(self.map3);
        // OpenStreetMap tile layer for high zoom level
        var tile2Layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            minZoom: 15
        });
        tile2Layer.addTo(self.map);
        var tile2Layer2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            minZoom: 15
        });
        tile2Layer2.addTo(self.map2);
        var tile2Layer3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            minZoom: 15
        });
        tile2Layer3.addTo(self.map3);

        // Build results.
        $.getJSON('data/res_32_Lectoure_departementales2015.json', function(data) {
          var line;
          var results = {};
          var bureau, parti, score, total;
          for (var i = 0; i < data.length; i++) {
            currentData = data[i];
            bureau = currentData.BV2015;
            parti = currentData.Nuance;
            score = parseInt(currentData.Voix);
            if (!results[bureau]) {
              results[bureau] = {
                scores: {},
                total: 0,
                winner: {
                  parti: 'NUL',
                  score: 0
                }
              };
            }
            // Add "special" results.
            // We may add them there since they are the same each time
            // the bureau comes up, so they will be rewritten each time
            // but with the same value.
            results[bureau].scores['ABSTENTION'] = parseInt(currentData.Abstentions);
            results[bureau].scores['BLANC'] = parseInt(currentData.Blancs);
            results[bureau].scores['NUL'] = parseInt(currentData.Nuls);
            // Normal results.
            if (score > results[bureau].winner.score) {
              results[bureau].winner = {
                parti: parti,
                score: score
              };
            } else if (score === results[bureau].winner.score) {
              results[bureau].winner = {
                parti: "BC-egal",
                score: score
              };
            }
            results[bureau].scores[parti] = score;
          }

          // Now add layer.
          $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
            function highlightFeature(e) {
              var layer = e.target;
              layer.setStyle({weight: 4});
              legend3.update(layer.feature.properties.BV2015);
              legend2.update(layer.feature.properties.BV2015);
              legend.update(layer.feature.properties.BV2015);
            }
            function resetHighlight(e) {
              var layer = e.target;
              layer.setStyle({weight: 1});
            }
            function onEachFeature(feature, layer) {
              var bureau  = results[""+parseInt(feature.properties.BV2015)];
              var color   = '#aaaaaa';
              var opacity = 0.5;
              if (bureau) color   = colors[bureau.winner.parti.split('-')[1]];
              layer.setStyle({
                fillColor: color,
                weight: 1,
                fillOpacity: opacity,
                color: '#293133',
                opacity: 1,
              });

              // Event bindings
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
              });
            };
            var boundsLayer3 = L.geoJson(data, {
              style: null,
              onEachFeature: onEachFeature
            });
            boundsLayer3.addTo(self.map3);

            updateLegend3 = function(bureau) {
              var html = '';
              html += '<h3>Départementales 2015</h3>';
              if (bureau && results[bureau]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = results[bureau].scores;
                for (var parti in scores) {
                  if (parti != "ABSTENTION" && parti != "NUL" && parti != "BLANC") {
                    var score = scores[parti] || 0;
                    total_exprimes += scores[parti];
                    votes_exprimes.push({ parti: parti, score: score})
                  }
                  total += scores[parti];
                }
                votes_exprimes = votes_exprimes.map(function(d){
                  d.ratio = (100 * d.score / total_exprimes).toFixed(1);
                  return d;
                }).sort(function(a, b){
                  return b.score - a.score;
                });

                // Build overall bar-graph
                var sortedScores = [];
                for (var parti in scores) {
                  sortedScores.push({ value: scores[parti], name: parti });
                }
                sortedScores.sort(function (a, b) {
                  return b.value - a.value;
                });
                html += '<p>Bureau n°' + bureau + '</p>';
                var overall       = document.createElement('ul');
                overall.className = 'overall';
                sortedScores.forEach(function (element) {
                  var li = document.createElement('li');
                  li.className = element.name.toLowerCase();
                  li.style.width = (element.value * 100 / total) + '%';
                  overall.appendChild(li);
                });

                html += overall.outerHTML;

                html += '<ul>';
                for (var parti in scores) {
                  if(parti == "ABSTENTION" || parti == "NUL" || parti == "BLANC") {
                    html += '<li>' + parti.charAt(0) + parti.slice(1).toLowerCase() + 's (' + scores[parti] + ' voix)</li>';
                  }
                }

                var abstention = scores["ABSTENTION"];
                if (!!abstention) {
                  var ratio = 100 - Math.round(100 * abstention / total);
                  html += '<li style="margin-top:10px; margin-bottom:10px;"> Participation (' + ratio + ' %)</li>';
                }

                votes_exprimes.forEach(function(vote){
                  var label_parti = (vote.parti.indexOf('-') > 0 ? vote.parti.split('-')[1] : vote.parti);
                  var isWinner    = (vote.score === results[bureau].winner.score);
                  html += '<li>';
                  html += isWinner ? '<strong>' : '';
                  html += label_parti + ' ' + vote.ratio + '% (' + vote.score + ' voix)</li>';
                  html += isWinner ? '</strong>' : '';
                  html += '<div style="display:inline-block;width:' + (2 * vote.ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';                                                                                                                                    
                });

                html += '</ul>';
              } else {
                html += '<p><big><strong>Survolez un bureau de vote pour plus de détails.</strong></big></p>';
              }
              this._div.innerHTML = html;
            };

              legend3 = L.control({position: 'topright'});
              legend3.onAdd = addLegend;
              legend3.update = updateLegend3;
              legend3.addTo(self.map3);

              self.map3.fitBounds(boundsLayer3.getBounds());
            });
        });
        $.getJSON('data/res_32_Lectoure_presidentielles2012.json', function(data) {
          var line;
          var results = {};
          var bureau, parti, score, total;
          // 1 because headher line
          for (var i = 1; i < data.length; i++) {
            currentData = data[i];
            bureau = currentData.FIELD1;
            results[bureau] = {
              scores: {},
              total: 0,
              winner: {
                parti: 'NUL',
                score: 0
              }
            };
            // Not partis.
            results[bureau].scores['ABSTENTION'] = parseInt(currentData.FIELD3);
            results[bureau].scores['NUL'] = parseInt(currentData.FIELD5);
            results[bureau].scores['BLANC'] = (parseInt(currentData.FIELD4) - parseInt(currentData.FIELD5) - parseInt(currentData.FIELD6));
            var j = 7;
            while (j < 27) {
              parti = currentData['FIELD'+j];
              // Transform parti.
              switch(parti) {
                case 'HOLLANDE':
                  parti = 'PS';
                  break;
                case 'SARKOZY':
                  parti = 'UMP';
                  break;
                case 'LE PEN':
                  parti = 'FN';
                  break;
                case 'MÉLENCHON':
                  parti = 'FG';
                  break;
                case 'BAYROU':
                  parti = 'MDM';
                  break;
                case 'JOLY':
                  parti = 'EELV';
                  break;
                case 'DUPONT-AIGNAN':
                  parti = 'DLR';
                  break;
                case 'POUTOU':
                  parti = 'NPA';
                  break;
                case 'ARTHAUD':
                  parti = 'L0';
                  break;
                case 'CHEMINADE':
                  parti = 'SP';
                  break;
              }
              score = parseInt(currentData['FIELD'+(j+1)]);
              if (score > results[bureau].winner.score) {
                results[bureau].winner = {
                  parti: parti,
                  score: score
                };
              } else if (score === results[bureau].winner.score) {
                results[bureau].winner = {
                  parti: "BC-egal",
                  score: score
                };
              }
              results[bureau].scores[parti] = score;
              // Iterate.
              j += 2;
            }
          }
          var total;
          for (var r in results) {
            total = 0;
            for (var part in results[r].scores) {
              if (part != "ABSTENTION" && part != "NUL" && part != "BLANC") {
                total += results[r].scores[part];
              }
            }
            results[r].total = total;
          }

          // Now add layer.
          $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
            function highlightFeature(e) {
              var layer = e.target;
              layer.setStyle({weight: 4});
              legend.update(layer.feature.properties.BV2015);
              legend2.update(layer.feature.properties.BV2015);
              legend3.update(layer.feature.properties.BV2015);
            }
            function resetHighlight(e) {
              var layer = e.target;
              layer.setStyle({weight: 1});
            }
            function onEachFeature(feature, layer) {
              var bureau  = results[""+parseInt(feature.properties.BV2015)];
              var color   = '#aaaaaa';
              var opacity = 0.5;
              if (bureau) color   = colors[bureau.winner.parti];
              layer.setStyle({
                fillColor: color,
                weight: 1,
                fillOpacity: opacity,
                color: '#293133',
                opacity: 1,
              });

              // Event bindings
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
              });
            };
            var boundsLayer2 = L.geoJson(data, {
              style: null,
              onEachFeature: onEachFeature
            });
            boundsLayer2.addTo(self.map2);

            updateLegend2 = function(bureau) {
              var html = '';
              html += '<h3>Présidentielle 2012<br />1<sup>er</sup> tour</h3>';
              if (bureau && results[bureau]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = results[bureau].scores;
                for (var parti in scores) {
                  if (parti != "ABSTENTION" && parti != "NUL" && parti != "BLANC") {
                    var score = scores[parti] || 0;
                    total_exprimes += scores[parti];
                    votes_exprimes.push({ parti: parti, score: score})
                  }
                  total += scores[parti];
                }
                votes_exprimes = votes_exprimes.map(function(d){
                  d.ratio = (100 * d.score / total_exprimes).toFixed(1);
                  return d;
                }).sort(function(a, b){
                  return b.score - a.score;
                });

                // Build overall bar-graph
                var sortedScores = [];
                for (var parti in scores) {
                  sortedScores.push({ value: scores[parti], name: parti });
                }
                sortedScores.sort(function (a, b) {
                  return b.value - a.value;
                });
                html += '<p>Bureau n°' + bureau + '</p>';
                var overall       = document.createElement('ul');
                overall.className = 'overall';
                sortedScores.forEach(function (element) {
                  var li = document.createElement('li');
                  li.className = element.name.toLowerCase();
                  li.style.width = (element.value * 100 / total) + '%';
                  overall.appendChild(li);
                });

                html += overall.outerHTML;

                html += '<ul>';
                for (var parti in scores) {
                  if(parti == "ABSTENTION" || parti == "NUL" || parti == "BLANC") {
                    html += '<li>' + parti.charAt(0) + parti.slice(1).toLowerCase() + 's (' + scores[parti] + ' voix)</li>';
                  }
                }

                var abstention = scores["ABSTENTION"];
                if (!!abstention) {
                  var ratio = 100 - Math.round(100 * abstention / total);
                  html += '<li style="margin-top:10px; margin-bottom:10px;"> Participation (' + ratio + ' %)</li>';
                }

                votes_exprimes.forEach(function(vote){
                  var label_parti = (vote.parti.indexOf('-') > 0 ? vote.parti.split('-')[1] : vote.parti);
                  var isWinner    = (vote.score === results[bureau].winner.score);
                  html += '<li>';
                  html += isWinner ? '<strong>' : '';
                  html += label_parti + ' ' + vote.ratio + '% (' + vote.score + ' voix)</li>';
                  html += isWinner ? '</strong>' : '';
                  html += '<div style="display:inline-block;width:' + (2 * vote.ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';                                                                                                                                    
                });

                html += '</ul>';
              } else {
                html += '<p><big><strong>Survolez un bureau de vote pour plus de détails.</strong></big></p>';
              }
              this._div.innerHTML = html;
            };

              legend2 = L.control({position: 'topright'});
              legend2.onAdd = addLegend;
              legend2.update = updateLegend2;
              legend2.addTo(self.map2);

              self.map2.fitBounds(boundsLayer2.getBounds());
            });
        });
        $.getJSON('data/res_32_Lectoure_municipales2014.json', function(data) {
          var line;
          var results = {};
          var bureau, parti, score, total;
          // 1 because headher line
          for (var i = 1; i < data.length; i++) {
            currentData = data[i];
            bureau = currentData.FIELD1;
            results[bureau] = {
              scores: {},
              total: 0,
              winner: {
                parti: 'NUL',
                score: 0
              }
            };
            // Not partis.
            results[bureau].scores['ABSTENTION'] = parseInt(currentData.FIELD3);
            results[bureau].scores['NUL'] = parseInt(currentData.FIELD5);
            results[bureau].scores['BLANC'] = (parseInt(currentData.FIELD4) - parseInt(currentData.FIELD5) - parseInt(currentData.FIELD6));
            var j = 7;
            while (j < 11) {
              parti = currentData['FIELD'+j];
              score = parseInt(currentData['FIELD'+(j+1)]);
              if (score > results[bureau].winner.score) {
                results[bureau].winner = {
                  parti: parti,
                  score: score
                };
              } else if (score === results[bureau].winner.score) {
                results[bureau].winner = {
                  parti: "BC-egal",
                  score: score
                };
              }
              results[bureau].scores[parti] = score;
              // Iterate.
              j += 2;
            }
          }
          var total;
          for (var r in results) {
            total = 0;
            for (var part in results[r].scores) {
              if (part != "ABSTENTION" && part != "NUL" && part != "BLANC") {
                total += results[r].scores[part];
              }
            }
            results[r].total = total;
          }

          // Now add layer.
          $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
            function highlightFeature(e) {
              var layer = e.target;
              layer.setStyle({weight: 4});
              legend.update(layer.feature.properties.BV2015);
              legend2.update(layer.feature.properties.BV2015);
              legend3.update(layer.feature.properties.BV2015);
            }
            function resetHighlight(e) {
              var layer = e.target;
              layer.setStyle({weight: 1});
            }
            function onEachFeature(feature, layer) {
              var bureau  = results[""+parseInt(feature.properties.BV2015)];
              var color   = '#aaaaaa';
              var opacity = 0.5;
              if (bureau) color   = colors[bureau.winner.parti];
              layer.setStyle({
                fillColor: color,
                weight: 1,
                fillOpacity: opacity,
                color: '#293133',
                opacity: 1,
              });

              // Event bindings
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
              });
            };
            var boundsLayer = L.geoJson(data, {
              style: null,
              onEachFeature: onEachFeature
            });
            boundsLayer.addTo(self.map);

            updateLegend = function(bureau) {
              var html = '';
              html += '<h3>Municipales 2014</h3>';
              if (bureau && results[bureau]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = results[bureau].scores;
                for (var parti in scores) {
                  if (parti != "ABSTENTION" && parti != "NUL" && parti != "BLANC") {
                    var score = scores[parti] || 0;
                    total_exprimes += scores[parti];
                    votes_exprimes.push({ parti: parti, score: score})
                  }
                  total += scores[parti];
                }
                votes_exprimes = votes_exprimes.map(function(d){
                  d.ratio = (100 * d.score / total_exprimes).toFixed(1);
                  return d;
                }).sort(function(a, b){
                  return b.score - a.score;
                });

                // Build overall bar-graph
                var sortedScores = [];
                for (var parti in scores) {
                  sortedScores.push({ value: scores[parti], name: parti });
                }
                sortedScores.sort(function (a, b) {
                  return b.value - a.value;
                });
                html += '<p>Bureau n°' + bureau + '</p>';
                var overall       = document.createElement('ul');
                overall.className = 'overall';
                sortedScores.forEach(function (element) {
                  var li = document.createElement('li');
                  li.className = element.name.toLowerCase();
                  li.style.width = (element.value * 100 / total) + '%';
                  overall.appendChild(li);
                });

                html += overall.outerHTML;

                html += '<ul>';
                for (var parti in scores) {
                  if(parti == "ABSTENTION" || parti == "NUL" || parti == "BLANC") {
                    html += '<li>' + parti.charAt(0) + parti.slice(1).toLowerCase() + 's (' + scores[parti] + ' voix)</li>';
                  }
                }

                var abstention = scores["ABSTENTION"];
                if (!!abstention) {
                  var ratio = 100 - Math.round(100 * abstention / total);
                  html += '<li style="margin-top:10px; margin-bottom:10px;"> Participation (' + ratio + ' %)</li>';
                }

                votes_exprimes.forEach(function(vote){
                  var label_parti = (vote.parti.indexOf('-') > 0 ? vote.parti.split('-')[1] : vote.parti);
                  var isWinner    = (vote.score === results[bureau].winner.score);
                  html += '<li>';
                  html += isWinner ? '<strong>' : '';
                  html += label_parti + ' ' + vote.ratio + '% (' + vote.score + ' voix)</li>';
                  html += isWinner ? '</strong>' : '';
                  html += '<div style="display:inline-block;width:' + (2 * vote.ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';                                                                                                                                    
                });

                html += '</ul>';
              } else {
                html += '<p><big><strong>Survolez un bureau de vote pour plus de détails.</strong></big></p>';
              }
              this._div.innerHTML = html;
            };

              legend = L.control({position: 'topright'});
              legend.onAdd = addLegend;
              legend.update = updateLegend;
              legend.addTo(self.map);

              self.map.fitBounds(boundsLayer.getBounds());
            });
        });
    };
};
