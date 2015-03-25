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

    self.init = function () {
        // init map
        self.map = L.map('municipales2014', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);
        self.map2 = L.map('europeennes2014', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);
        self.map3 = L.map('departementales2015', {
            minZoom: 10,
            attributionControl: false,
        }).setView([43.94, 0.65], 13);

        // Add base layers to the 3 maps.
        var tileLayer = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            maxZoom: 14
        });
        tileLayer.addTo(self.map);
        var tileLayer2 = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            maxZoom: 14
        });
        tileLayer2.addTo(self.map2);
        var tileLayer3 = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
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
          var total;
          for (var r in results) {
            total = 0;
            for (var part in results[r].scores) {
              total += results[r].scores[part];
            }
            results[r].total = total;
          }

          // Now add layer.
          $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
            function highlightFeature(e) {
              var layer = e.target;
              layer.setStyle({weight: 15});
              legend.update(layer.feature.properties.BV2015);
            }
            function resetHighlight(e) {
              var layer = e.target;
              layer.setStyle({weight: 10});
            }
            function onEachFeature(feature, layer) {
              var bureau  = results[""+parseInt(feature.properties.BV2015)];
              var color   = '#aaaaaa';
              var opacity = 0.5;
              if (bureau) color   = colors[bureau.winner.parti.split('-')[1]];
              layer.setStyle({
                fillColor: color,
                weight: 10,
                fillOpacity: opacity,
                color: color,
                opacity: 1
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

              var legend = L.control({position: 'topright'});
              legend.onAdd = addLegend;
              legend.update = updateLegend;
              legend.addTo(self.map);

              boundsLayer.addTo(self.map);
              self.map.fitBounds(boundsLayer.getBounds());
            });
        });

        // Add bounds.
        $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
          var style = {
            color: '#293133',
            weight: 1,
            opacity: 1,
            clickable: false
          };
          var boundsLayer2 = L.geoJson(data, {
            style: style
          });
          boundsLayer2.addTo(self.map2);
          self.map2.fitBounds(boundsLayer2.getBounds());
          var boundsLayer3 = L.geoJson(data, {
            style: style
          });
          boundsLayer3.addTo(self.map3);
          self.map3.fitBounds(boundsLayer3.getBounds());
        });

        // Legend
        addLegend = function(map) {
          this._div = L.DomUtil.create('div', 'legend info');
          this.update();
          return this._div;
        };
        updateLegend2 = function() {
          var html = '';
          html += '<h3>Européennes 2014</h3>';
          html += '<p>Survolez un bureau de vote pour plus de détails.</p>';
          this._div.innerHTML = html;
        };
        updateLegend3 = function() {
          var html = '';
          html += '<h3>Départementales 2015</h3>';
          html += '<p>Survolez un bureau de vote pour plus de détails.</p>';
          this._div.innerHTML = html;
        };

        var legend2 = L.control({position: 'topright'});
        legend2.onAdd = addLegend;
        legend2.update = updateLegend2;
        legend2.addTo(self.map2);
        var legend3 = L.control({position: 'topright'});
        legend3.onAdd = addLegend;
        legend3.update = updateLegend3;
        legend3.addTo(self.map3);
    };
};
