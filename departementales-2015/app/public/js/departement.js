var App = function (dataset) {

    var departement, analyse_parti, pymChild, zoomOnScroll = true;

    if (dataset && dataset.dpt) {
        departement = dataset.dpt;
    } else if (mkcMapFrame) {
        departement = mkcMapFrame.dptFromQS() || '31';
    } else {
        departement = '31';
    }

    if (dataset && dataset.parti) {
        analyse_parti = dataset.parti;
    } else if (mkcMapFrame) {
        analyse_parti = mkcMapFrame.partiFromQS();
    }
    if(analyse_parti) {
        analyse_parti = analyse_parti.split('|')
    }

    if (dataset && dataset.zoomonscroll && dataset.zoomonscroll === "false") {
        zoomOnScroll = false;
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

    function ColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    }

    var self = this;

    var options = {
        tileUrl: 'http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png',
        contour: {
            url: '../../../resources/bureaux/' + departement + '.geojson',
            type: 'geojson',
        },
        scrollWheelZoom: zoomOnScroll,
        containerId: 'map',
        attribution: 'Tuiles par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    };

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
        self.map = L.map(options.containerId, {
            fullscreenControl: true,
            minZoom: 6,
            attributionControl: false,
            scrollWheelZoom: options.scrollWheelZoom
        }).setActiveArea('activeArea').setView([43.55, 1.45], 12);

        // Default tile layer
        self.tileLayer = L.tileLayer(options.tileUrl, {
            attribution: options.attribution,
            maxZoom: 14
        });
        self.tileLayer.addTo(self.map);

        // OpenStreetMap tile layer for high zoom level
        self.tile2Layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            minZoom: 15
        });

        self.tile2Layer.addTo(self.map);

        // Read result from json
        var results = {};
        var existing_partis = {};
        $.getJSON('../../data/resultats/tour1/' + departement + '.json', function (data) {

            /**
             * Sort results by bureau
             * identify winner of each one.
             */

            var bureauId, parti, score, currentData;
            // Start with i = 1 because of headers row
            for (var i = 1; i < data.length; i++) {
                currentData = data[i];
                cantonId    = currentData[0];
                bureauId    = currentData[1];
                parti       = currentData[3];
                score       = currentData[4];
                resultId = cantonId + '-' + bureauId;

                // Create bureau only if not already existing
                if (!results[resultId]) {
                    results[resultId] = {
                        scores: {},
                        winner: {
                            parti: 'NUL',
                            score: 0
                        }
                    };
                }

                // If current score is higher than previous winner, store it as winner
                if (parti && parti !== 'ABSTENTION' && parti !== 'NUL' && parti !== 'BLANC') {
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
                }
                if (!parti) {
                    parti = currentData[2];
                }
                results[resultId].scores[parti] = score;
            }

            for(bureau in results) {
              // bureau is not a bureau.
                var total = 0;
                for(parti in results[bureau].scores) {
                    if (parti != "ABSTENTION" && parti != "NUL" && parti != "BLANC") {
                        total += results[bureau].scores[parti];
                    }
                    existing_partis[(parti.indexOf('BC-') > -1 ? parti.split('BC-')[1] : parti)] = true;
                }
                results[bureau].total = total;
            }

            /**
             * Draw bureaux
             */

            // Initialize empty geojson layer
            var customLayer = L.geoJson(null, {
                onEachFeature: onEachFeature,
                style: {color: '#293133'}
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                layer.setStyle({color: layer.options.fillColor});
                layer.setStyle({fillOpacity: 0.7 + (analyse_parti ? 0.3 : 0.0)});
                legend.update(layer.feature.properties.CODECANT + "-"+ parseInt(layer.feature.properties.BV2015));
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
                layer.setStyle({color: '#333333'});
                layer.setStyle({fillOpacity: 0.4 + (analyse_parti ? 0.3 : 0.0)});
            }

            function onEachFeature(feature, layer) {
                // Make two type coercions to remove leading zero
                var bureau  = results[feature.properties.CODECANT + "-" + parseInt(feature.properties.BV2015)];
                var color   = '#aaaaaa';
                var opacity = 0.4 + (analyse_parti ? 0.3 : 0.0);

                if(!analyse_parti) {
                    // if no analyse, select color from winner
                    if (bureau) {
                        color   = colors[bureau.winner.parti.split('-')[1]];
                    }
                } else {
                    // else we just darken/enlight the analysed parti color
                    if (bureau) {
                        var rate, light;
                        var score = 0;
                        analyse_parti.forEach(function(p) {
                            if (p != "ABSTENTION" && p != "NUL" && p != "BLANC") {
                                p = "BC-"+p;
                            }
                            score += bureau.scores[p] || 0;
                        });
                        rate = score/bureau.total;
                        light = 1 - rate * 2;
                        color   = ColorLuminance('#999', light);
                    }
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

            // Populate geojson layer with omnivore plugin and rturn it;
            var contourLayer = omnivore.geojson(options.contour.url, null, customLayer);

            contourLayer.on('ready', function () {
                //self.map.fitBounds(customLayer.getBounds());
                // Add Canton border
                $.getJSON('./data/canton_toulouse.geojson', function (data) {
                  var style = {
                    color: '#FFF',
                    weight: 2,
                    opacity: 1,
                    clickable: false,
                  };
                  var toulouseLayer = L.geoJson(data, {style: style});
                  toulouseLayer.addTo(self.map);
                  // self.map.fitBounds(toulouseLayer.getBounds());
                });
                $.getJSON('./fougeres.geojson', function (data) {
                  var style = function (feature) {
                    var color = 'black';
                    if (feature.properties.BV2015 == '6') {
                      color = 'red';
                    }
                    return { color: color, weight: 3, clickable: true }
                  };
                  var fougeresLayer = L.geoJson(data, {style: style});
                  fougeresLayer.addTo(self.map);
                  // self.map.fitBounds(toulouseLayer.getBounds());
                });
            });

            // small fix
            contourLayer.on("dblclick", function (event){
                self.map.fire("dblclick", event);
            });

            // Attach geojson layer to map
            contourLayer.addTo(self.map);

            // button hidden in css because it's causing fllickering
            //  !!!!!!!!!!
            //  !!!!!!!!!!
            /*
            var resetView = L.control({position: 'topleft'});
            resetView.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'leaflet-control-resetview leaflet-bar');
                this._div.innerHTML = '<a class="leaflet-control-resetview-button leaflet-bar-part" href title="Reset View"></a>';
                jQuery(this).on('click', function (e) {
                    e.preventDefault();
                    self.map.fitBounds(customLayer.getBounds());
                });
                return this._div;
            }
            resetView.addTo(self.map);
            */
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

        legend.update = function (bureau) {
            var html = '<h3>Résultats à Toulouse</h3>';
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
                    d.ratio = Math.round(100 * d.score / total_exprimes);
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
                html += '<p>Canton n°' + bureau.split('-')[0] +' - Bureau n°' + bureau.split('-')[1] + '</p>';
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
                        html += '<li>' + parti + ' (' + scores[parti] + ' voix)</li>';
                    }
                }

                var abstention = scores["ABSTENTION"];
                if (!!abstention) {
                    var ratio = 100 - Math.round(100 * abstention / total);
                    html += '<li style="margin-top:10px; margin-bottom:10px;"> PARTICIPATION (' + ratio + ' %)</li>';
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

            html += '<p>Les contours blancs correspondent aux cantons.</p>';
            html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
            html += '<br/>Analyser les scores d\'un parti: <br/>';
            var current = location.href.split('?')[0];
            for(parti in existing_partis) {
                html += '<input type="checkbox" value="'+parti+'"';
                if(analyse_parti && analyse_parti.indexOf(parti) > -1) {
                    html += ' checked';
                }
                html += '>'+parti+'<br/>';
            }
            html += '<button onclick="location.href=\''+current+'?dep='+departement+'&parti=\'+$(\'input:checkbox:checked\').map(function() {return this.value;}).get().join(\'|\');">Analyser</button>';
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);
        L.control.attribution({position: 'topright'}).addTo(self.map);
    };
};
