var App = function (dataset) {

    var departement, pymChild, zoomOnScroll = true;

    if (dataset && dataset.zoomonscroll && dataset.zoomonscroll === "false") {
        zoomOnScroll = false;
    }

    if (dataset && dataset.dpt) {
        departement = dataset.dpt;
    } else if (mkcMapFrame) {
        departement = mkcMapFrame.dptFromQS() || '31';
    } else {
        departement = '31';
    }

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

    self.setPym = function (pC) {
        pymChild = pC;
    };

    self.init = function () {
        if (mkcMapFrame && dataset) {
            if (pymChild) {
                mkcMapFrame.init(dataset, pymChild);
            }
        }

        // init map
        self.map = L.map('map', {
            fullscreenControl: true,
            minZoom: 6,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: zoomOnScroll
        }).setActiveArea('activeArea').setView([46.50, 1.45], 6);

        // Default tile layer
        self.tileLayer = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            attribution: 'Tuiles par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        });
        self.tileLayer.addTo(self.map);

        // Read result from json
        var results         = {};
        var existing_partis = {};
        $.getJSON('data/resultats/tour1/cantons.json', function (data) {
            /**
             * Sort results by entity
             * identify winner of each one.
             */
            var entityId, parti, score, currentData, depId;
            // Start with i = 1 because of headers row
            for (var i = 1; i < data.length; i++) {
                currentData = data[i];
                console.log(currentData);
                if (currentData.FIELD1 != departement) {
                  continue;
                }
                entityId    = currentData.FIELD3;
                entityName  = currentData.FIELD4;
                resultId    = entityId;
                depId = currentData.FIELD1;
                if(depId !== departement){
                    continue;
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
                var j = 11;
                while (j < 102) {
                  parti       = currentData['FIELD'+j];
                  if (parti === "") {
                    break;
                  } else {
                    score       = parseInt(currentData['FIELD'+(j+1)]);
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

            /**
             * Draw entitys
             */
            // Initialize empty geojson layer
            $.getJSON('data/cantons/contours cantons ' + departement + '.geojson', function(geojson) {
            var customLayer = L.geoJson(geojson, {
                onEachFeature: onEachFeature,
                style: {color: '#293133'}
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                layer.setStyle({fillOpacity: 1});
                entityCode = layer.feature.properties.canton;
                if (entityCode === '2A' || entityCode === '2B') {
                  legend.update(entityCode);
                } else {
                  legend.update(""+parseInt(entityCode));
                }
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
                layer.setStyle({fillOpacity: 0.8});
            }

            function onEachFeature(feature, layer) {
                entityCode = feature.properties.canton;
                var entity;
                if (entityCode === '2A' || entityCode === '2B') {
                  entity  = results[entityCode];
                } else {
                  entity  = results[""+parseInt(entityCode)];
                }
                var color   = '#FFF';
                var opacity = 0.8;

                if (entity) {
                  color   = colors[entity.winner.parti.split('-')[1]];
                }

                // Set shape styles
                layer.setStyle({
                    fillColor: color,
                    weight: 1,
                    color: '#333333',
                    fillOpacity: opacity
                });

                // Event bindings
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });
            }

            // Attach geojson layer to map
            customLayer.addTo(self.map);
            self.map.fitBounds(customLayer.getBounds());
          });
        });

        // Optionnal logo
        if (dataset && dataset.logo) {
            var vendorLogo = L.control({position: 'bottomleft'});
            vendorLogo.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'vendors-logo');
                this._div.innerHTML = '<img id="vendor-logo" src="' + dataset.logo + '" />';
                return this._div;
            };
            vendorLogo.addTo(self.map);
        }

        // Legend
        var legend = L.control({position: 'topright'});

        legend.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'legend info');
            this.update();
            return this._div;
        };

        legend.update = function (entity) {
            var html = '<h3>Résultats par canton</h3>';
            if (entity && results[entity]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = results[entity].scores;
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
                html += '<p>Canton : ' + results[entity].name + '</p>';
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
                    var isWinner    = (vote.score === results[entity].winner.score);
                    html += '<li>';
                    html += isWinner ? '<strong>' : '';
                    html += label_parti + ' ' + vote.ratio + '% (' + vote.score + ' voix)</li>';
                    html += isWinner ? '</strong>' : '';
                    html += '<div style="display:inline-block;width:' + (2 * vote.ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';
                });

                html += '</ul>';
            } else {
              html += '<p><big><strong>Survolez un canton pour plus de détails.</strong></big></p>';
            }

            html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);
        L.control.attribution({position: 'topright'}).addTo(self.map);
    };
};
