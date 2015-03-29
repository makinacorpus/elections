var App = function (dataset) {

    var departement, pymChild, zoomOnScroll = true;

    if (dataset && dataset.zoomonscroll && dataset.zoomonscroll === "false") {
        zoomOnScroll = false;
    }

    /**
     * These colors come from http://fr.wikipedia.org/wiki/Mod%C3%A8le:Infobox_Parti_politique/couleurs,
     * some of them have been adapted to follow naming conventions from Ministère de l'intérieur.
     */
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
        "DVG2":"#FFC0C0",
        "MDM":"#FF9900",
        "UC":"#74C2C3",
        "NC":"#00FFFF",
        "UDI":"#00FFFF",
        "DVD":"#ADC1FD",
        "DVD2":"#ADC1FD",
        "UMP":"#0066CC",
        "PR":"#0066CC",
        "DLR":"#8040C0",
        "MPF":"#8040C0",
        "PP":"#8040C0",
        "FN":"#C0C0C0",
        "SP":"#C0C0C0",
        "EXD":"#404040",
        "DIV":"#F0F0F0",
        "DIV2":"#F0F0F0",
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
        var _map;
        var _tileLayers = {};
        var currentOptions = options;
        if (mkcMapFrame && dataset) {
            if (pymChild) {
                mkcMapFrame.init(dataset, pymChild);
            }
        }

        if (typeof getParamOptions !== 'undefined' && typeof getParamOptions === 'function') {
          if (dataset && dataset.dpt) {
            departement = dataset.dpt;
          } else if (mkcMapFrame) {
            departement = mkcMapFrame.dptFromQS() || '31';
          } else {
            departement = '31';
          }
          currentOptions = getParamOptions(departement);
        }

        // Provide sensible defaults
        currentOptions.fullscreenControl = (typeof currentOptions.fullscreenControl === 'undefined') ? true : currentOptions.fullscreenControl;
        currentOptions.minZoom = (typeof currentOptions.minZoom === 'undefined') ? 6 : currentOptions.minZoom;
        currentOptions.maxZoom = (typeof currentOptions.maxZoom === 'undefined') ? 18 : currentOptions.maxZoom;
        currentOptions.startZoom = (typeof currentOptions.startZoom === 'undefined') ? 6 : currentOptions.startZoom;
        currentOptions.center = (typeof currentOptions.center === 'undefined') ? [46.50, 1.45] : currentOptions.center;
        currentOptions.neutralColor = (typeof currentOptions.neutralColor === 'undefined') ? '#AAA' : currentOptions.neutralColor;

        // init map
        _map = L.map('map', {
            fullscreenControl: currentOptions.fullscreenControl,
            minZoom: currentOptions.minZoom,
            maxZoom: currentOptions.maxZoom,
            zoomControl: (currentOptions.minZoom != currentOptions.maxZoom),
            attributionControl: false,
            scrollWheelZoom: zoomOnScroll
        }).setActiveArea('activeArea').setView(currentOptions.center, currentOptions.startZoom);

        // Default tile layer
        _tileLayers.makina = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
            attribution: 'Cartes par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 14
        });

        // OpenStreetMap tile layer for high zoom level
        _tileLayers.osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            minZoom: 15
        });

        for (var i in _tileLayers) {
            _tileLayers[i].addTo(_map);
        }

        // So layers can be accessed from one another.
        var tour1Layer, tour2Layer;

        // Read result from json
        var results         = {};
        var results2        = {};
        $.getJSON(currentOptions.resultFile, function (data) {
            results = computeResults(data);
            // Add additionnal data.
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
            $.getJSON(currentOptions.entityFile, function(geojson) {
              tour1Layer = L.geoJson(geojson, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng);
                }
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                layer.setStyle({fillOpacity: 1});
                if (layer.feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({weight: 8});
                }
                legend.update(getBorderId(layer), results);
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
                layer.setStyle({fillOpacity: 0.8});
                if (layer.feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({weight: 4});
                }
            }

            function onEachFeature(feature, layer) {
                // Make two type coercions to remove leading zero
                var entity  = results[getResultId(feature)];
                var color   = currentOptions.neutralColor;
                var opacity = 0.8;

                if (entity) {
                  color   = colors[entity.winner.parti];
                }

                // Set shape styles
                layer.setStyle({
                    fillColor: color,
                    weight: 1,
                    fillOpacity: opacity,
                    color: '#291333',
                });
                if (feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({color: color, weight: 4, opacity: 1});
                }

                // Event bindings
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });
                if (currentOptions.link) {
                  layer.on('click', function(event) {
                    var id = getResultId(event.target.feature);
                    var target = currentOptions.link.replace('feature', id);
                    window.open(target, "_blank");
                  });
                }
            }

            // Attach geojson layer to map
            tour1Layer.addTo(_map);
            if (typeof departement !== 'undefined') {
              _map.fitBounds(tour1Layer.getBounds());
            }

            // Eventually add additional layer.
            if (currentOptions.additionalLayer) {
              $.getJSON(currentOptions.additionalLayer, function (additionalData) {
                var style = {
                  clickable: false,
                  color: '#291333',
                  opacity: 1,
                  fillOpacity: 0,
                  weight: 2
                };
                var additionalLayer = L.geoJson(additionalData, {style: style});
                additionalLayer.addTo(_map);
                _map.on('baselayerchange', function(e) {
                  additionalLayer.bringToFront();
                });
              });
            }
          });
        $.getJSON(currentOptions.resultFileTour2, function (data) {
            results2 = computeResults(data);
            // Add additionnal data.
            var total;
            for (var r in results2) {
                total = 0;
                for (var part in results2[r].scores) {
                    if (part != "ABSTENTION" && part != "NUL" && part != "BLANC") {
                        total += results2[r].scores[part];
                    }
                }
                results2[r].total = total;
            }

            /**
             * Draw entitys
             */
            $.getJSON(currentOptions.entityFile, function(geojson) {
              tour2Layer = L.geoJson(geojson, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng);
                }
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                layer.setStyle({fillOpacity: 1});
                if (layer.feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({weight: 8});
                }
                legend.update(getBorderId(layer), results2);
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
                layer.setStyle({fillOpacity: 0.8});
                if (layer.feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({weight: 4});
                }
            }

            function onEachFeature(feature, layer) {
                // Make two type coercions to remove leading zero
                var entity  = results2[getResultId(feature)];
                var color   = currentOptions.neutralColor;
                var opacity = 0.8;

                if (entity) {
                  color   = colors[entity.winner.parti];
                }

                // Set shape styles
                layer.setStyle({
                    fillColor: color,
                    weight: 1,
                    fillOpacity: opacity,
                    color: '#291333',
                });
                if (feature.geometry.type == 'MultiLineString') {
                  layer.setStyle({color: color, weight: 4, opacity: 1});
                }

                // Event bindings
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });
                if (currentOptions.link) {
                  layer.on('click', function(event) {
                    var id = getResultId(event.target.feature);
                    var target = currentOptions.link.replace('feature', id);
                    window.open(target, "_blank");
                  });
                }
            }

            // Attach geojson layer to map
            tour2Layer.addTo(_map);
            // Handle layers.
            var layers = L.control.layers(null, null, {collapsed: false, position: 'topleft'});
            // Add the first layer to the layerSwitcher.
            layers.addBaseLayer(tour1Layer, '1er tour');
            // Remove tour1 so tour2 is automatically selected.
            _map.removeLayer(tour1Layer);
            // Add the layer to the layerSwitcher.
            layers.addBaseLayer(tour2Layer, '2ème tour');
            layers.addTo(_map);
          });
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
            vendorLogo.addTo(map);
        }

        // Legend
        var legend = L.control({position: 'topright'});

        legend.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'legend info');
            this.update();

            // Prevent zooming when over legend
            $(legend._div).on('click dblclick mousewheel DOMMouseScroll', function (e) {
                e.stopPropagation();
            });

            return this._div;
        };

        legend.update = function (entity, currentResults) {
            var html = '<h3>' + currentOptions.legendTitle + '</h3>';
            if (entity && currentResults[entity]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = currentResults[entity].scores;
                var elus           = [];
                if (currentResults[entity].elus) {
                  elus           = currentResults[entity].elus;
                }
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
                html += '<p>' + currentOptions.entityName + ' ' + currentResults[entity].name + '</p>';
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
                    var label_parti = vote.parti;
                    var isWinner    = (vote.score === currentResults[entity].winner.score);
                    html += '<li>';
                    html += isWinner ? '<strong>' : '';
                    var nbElus = '';
                    if (elus[label_parti] > 0) {
                      nbElus = ' (' + elus[label_parti] + ' élu';
                      if (elus[label_parti] > 1) {
                        nbElus += 's';
                      }
                      nbElus += ')';
                    }
                    html += label_parti + ' ' + vote.ratio + '% (' + vote.score + ' voix)' + nbElus + '</li>';
                    html += isWinner ? '</strong>' : '';
                    html += '<div style="display:inline-block;width:' + (2 * vote.ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';
                });

                html += '</ul>';
            } else {
              html += '<p><big><strong>' + currentOptions.legendHelp + '</strong></big></p>';
            }

            html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
            this._div.innerHTML = html;
        };
        legend.addTo(_map);
        L.control.attribution({position: 'topright'}).setPrefix('').addTo(_map);
    };
};

jQuery(document).ready(function($) {
  var dataset, pymChild, app;

  /**
   * Only if inside an iframe
   */
  if (self !== top && pym) {
    document.querySelector('#main').classList.add('iframe');
    pymChild = new pym.Child({ polling: 1000 });

    /**
     * Inform parent we are ready
     */
    pymChild.sendMessage('event', 'ready');

    /**
     * Manage data sent by parent
     */
    pymChild.onMessage('data', function (data) {
      try {
        dataset = JSON.parse(data);
        app = new App(dataset);
        app.setPym(pymChild);
        app.init();
      } catch (e) {
        console.error("Parsing error:", e);
        app = new App();
        app.init();
      }
    });
  } else {
    app = new App();
    app.init();
  }
});
