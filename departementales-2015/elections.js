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

        if (typeof getParamOptions === 'function') {
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

        // Create tiles layers
        _tileLayers = {
            // Default tile layer
            makina: L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
                attribution: 'Cartes par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 14
            }),
            // OpenStreetMap tile layer for high zoom level
            osm: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                minZoom: 15
            })
        };

        for (var i in _tileLayers) {
            _tileLayers[i].addTo(_map);
        }


        /**
         * Factorized methods
         */

        function _resetHighlight (e) {
            // Dependencies: none

            var layer = e.target;
            var w     = (layer.feature.geometry.type === 'MultiLineString') ? 4 : 1;

            layer.setStyle({
                weight: w,
                fillOpacity: 0.8
            });
        }

        function _layerFromGeojson (geojson, onEach) {
            // Dependencies: L

            return L.geoJson(geojson, {
                onEachFeature: onEach,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng);
                }
            });
        }

        function _layerClick (e) {
            // Dependencies: getReulstId(), currentOptions, window

            var id     = getResultId(e.target.feature);
            var target = currentOptions.link.replace('feature', id);
            window.open(target, "_blank");
        }

        function _highlightFeature (legend, resultsSet) {
            // Dependencies: none
            var ret = function (e) {
                var layer = e.target;
                var w     = (layer.feature.geometry.type === 'MultiLineString') ? 8 : 4;
                layer.setStyle({
                    weight: w,
                    fillOpacity: 1
                });
                legend.update(getBorderId(layer), resultsSet);
            };
            return ret;
        }

        function _featureStyle (resultsSet, feature) {
            // Dependencies: colors, currentOptions

            var entity  = resultsSet[getResultId(feature)];
            var color   = entity ? colors[entity.winner.parti] : currentOptions.neutralColor;
            var opacity = 0.8;
            var style;
            if (feature.geometry.type === 'MultiLineString') {
                style = {
                    color: color,
                    weight: 4,
                    opacity: 1
                };
            } else {
                style = {
                    fillColor: color,
                    weight: 1,
                    fillOpacity: opacity,
                    color: '#291333',
                };
            }
            return style;
        }

        function _onEachFeature (legend, resultsSet) {
            // Dependencies: _featureStyle

            var ret = function (feature, layer) {

                // Set shape styles
                var style = _featureStyle(resultsSet, feature);
                layer.setStyle(style);

                // Event bindings
                layer.on({
                    mouseover: _highlightFeature(legend, resultsSet),
                    mouseout: _resetHighlight,
                });
                if (currentOptions.link) {
                    layer.on('click', _layerClick);
                }
            };
            return ret;
        }

        /**
         * Return matching target/name dataSource or first if target is undefined
         */
        function _getTargetedEntities (sources, target) {
            // Dependencies: none

            if (!sources) return;
            var source;

            // Select entities matching target name
            for (var s in sources) {
                source = sources[s];
                if (source.type === 'entities' && (source.id === target || !target)) {
                    return source.geojson;
                }
            }
        }

        function _buildOverall (scores) {
            // Build overall bar-graph
            var overall, sortedScores = [], total = 0;
            for (var parti in scores) {
                total += scores[parti];
                sortedScores.push({ value: scores[parti], name: parti });
            }
            sortedScores.sort(function (a, b) {
                return b.value - a.value;
            });
            overall           = document.createElement('ul');
            overall.className = 'overall';
            sortedScores.forEach(function (element) {
                var li         = document.createElement('li');
                li.className   = element.name.toLowerCase();
                li.style.width = (element.value * 100 / total) + '%';
                overall.appendChild(li);
            });
            return overall.outerHTML;
        }

        /**
         * Main data sources references
         * TODO: Use an external datasource for each usecase
         */
        var dataSources = [
            {
                url:    currentOptions.entityFile,
                type:   'entities',
                id:     'dpt'
            },
            {
                url:    currentOptions.resultFile,
                type:   'data',
                name:   '1er tour',
                target: 'dpt',
                fit:    true,
            },
            {
                url:    currentOptions.resultFileTour2,
                type:   'data',
                name:   '2ème tour',
                target: 'dpt',
                fit:    true,
            }
        ];
        if (currentOptions.additionalLayer) {
            dataSources.push({
                url: currentOptions.additionalLayer,
                type: 'additional',
                name: 'regions',
                inControls : false
            });
        }

        /**
         * Layers visibility controler
         * (initialized without any base layer or overlay)
         */
        var layersControl = L.control.layers(null, null, {
            position: 'topleft',
            collapsed: false,
            autoZIndex: false
        }).addTo(_map);

        /**
         * Make each needed XHR query & store deferred object as array
         */
        var dataSourcesDeferred = [];
        dataSources.forEach(function (dataSource, index, array) {
            if (dataSource.url) {
                dataSourcesDeferred.push($.getJSON(dataSource.url));
            }
        });

        /**
         * Ajax queries achievement control
         * Wait for every 'getJSON' to be done, then...
         * (Use "apply" call to be able to provide an array as multiple parameters)
         */
        $.when.apply(null, dataSourcesDeferred).done(_jsonReceived);

        /**
         * When every getJSON are done...
         */
        function _jsonReceived () {
            // Dependencies: dataSources, _parseResults(), _eachParsedSource()

            /**
             * 'arguments' consists of an array of arrays.
             * Each one contains [data, status, jqxhr] for one ajax reply
             */
            dataSources = _parseResults(dataSources, arguments);

            /**
             * Build displays
             */
            dataSources.forEach(_eachParsedSource);
        }

        /**
         * Store any received data into main dataSources objects
         */
        function _parseResults (sources, args) {
            // Dependencies: computeResults()

            // arguments do not implement forEAch method, so calling it from Array prototype
            [].forEach.call(args, function (reply, index) {
                var data     = reply[0];
                var status   = reply[1];
                var jqxhr    = reply[2];

                // According to each dataType, make suitable transforms
                var jsonType = sources[index].type;
                switch (jsonType) {
                    case 'entities':
                    case 'additional':
                        sources[index].geojson = data;
                        break;
                    case 'data':
                        sources[index].results = computeResults(data);
                        sources[index].results = _addEachTotals(sources[index].results);
                        break;
                    default:
                        null;
                }
            });
            return sources;
        }

        /**
         * Create each layer
         * and add it to map object
         */
        function _eachParsedSource (dataSource) {
            // Dependencies: _getTargetedEntities(), _layerFromGeojson(), _onEachFeature(), dataSources, legend, layersControl, _map

            var layer, geojson;
            if (dataSource.type === 'data') {

                geojson = _getTargetedEntities(dataSources, dataSource.target);
                layer   = _layerFromGeojson(geojson, _onEachFeature(legend, dataSource.results))

                layersControl.addBaseLayer(layer, dataSource.name);

            } else if (dataSource.type === 'additional') {

                layer = L.geoJson(dataSource.geojson, {
                    style: {
                        clickable: false,
                        color: '#291333',
                        opacity: 1,
                        fillOpacity: 0,
                        weight: 2
                    }
                });

                if (dataSource.inControls) {
                    layersControl.addOverlay(layer, dataSource.name);
                }

                _map.on('baselayerchange', function (e) {
                    layer._map && layer.bringToFront();
                });
            }

            layer && layer.addTo(_map);
            /**
             * TODO :
             *     Fitbound on current selected data
             */
             // Set the map view to fit layer
             if (!!layer && dataSource.fit === true) {
                 _map.fitBounds(layer.getBounds());
             }
        }

        function _isParti (parti) {
            return (parti !== "ABSTENTION" && parti !== "NUL" && parti !== "BLANC");
        }

        function _addTotals (result) {

            var electeurs = 0;
            var exprimes  = {
                total: {
                    voix: 0,
                    '%': null
                }
            };

            var value;
            for (var parti in result.scores) {
                value               = parseInt(result.scores[parti], 10) || 0;
                electeurs           += value;
                exprimes.total.voix += _isParti(parti) ? value : 0;
            }
            exprimes.total['%'] = 100 * exprimes.total.voix / electeurs;

            for (var parti in result.scores) {
                value               = parseInt(result.scores[parti], 10) || 0;
                if (_isParti(parti)) {
                    exprimes[parti] = {
                        voix: value,
                        '%': 100 * value / exprimes.total.voix
                    };
                }
            }

            result.exprimes  = exprimes;
            result.electeurs = electeurs;
            return result;
        }

        function _addEachTotals (resultsSet) {

            for (var entityId in resultsSet) {
                resultsSet[entityId] = _addTotals(resultsSet[entityId]);
            }
            console.log(resultsSet['01']);
            return resultsSet;
        }


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
            $(this._div).on('click dblclick mousewheel DOMMouseScroll', function (e) {
                e.stopPropagation();
            });

            return this._div;
        };

        legend.update = function (entityId, resultsSet) {
            var html = currentOptions.legendTitle;
            if (entityId && resultsSet[entityId]) {
                var total          = 0;
                var total_exprimes = 0;
                var votes_exprimes = [];
                var scores         = resultsSet[entityId].scores;
                var elus           = [];
                if (resultsSet[entityId].elus) {
                  elus           = resultsSet[entityId].elus;
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

                html += '<p>' + currentOptions.entityName + ' ' + resultsSet[entityId].name + '</p>';

                html += _buildOverall(scores);

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
                    var isWinner    = (vote.score === resultsSet[entityId].winner.score);
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
