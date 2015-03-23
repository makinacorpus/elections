var App = function (dataset) {

    var departement, pymChild, zoomOnScroll = true;

    if (dataset && dataset.dpt) {
        departement = dataset.dpt;
    } else if (mkcMapFrame) {
        departement = mkcMapFrame.dptFromQS() || '31';
    } else {
        departement = '31';
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
        "egal":"white"
        };
    var self = this;

    var options = {
        tileUrl: 'http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png',
        contour: {
            url: '../../../resources/bureaux/'+departement+'.geojson',
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
        self.map = L.map(options.containerId, {fullscreenControl: true, minZoom: 6, maxZoom: 14, attributionControl: false, scrollWheelZoom: options.scrollWheelZoom}).setActiveArea('activeArea');
        // add an OpenStreetMap tile layer
        self.tileLayer = L.tileLayer(options.tileUrl, {
            attribution: options.attribution
        });
        self.tileLayer.addTo(self.map);

        // read result from csv
        var results = {};
        $.getJSON('../../data/resultats/tour1/' + departement + '.json', function (data) {
            var i = 0;
            for (i = 1; i < data.length; i++) {
                var bureau = data[i][1];
                var parti = data[i][3];
                var score = data[i][4];
                if (!results[bureau]) {
                    results[bureau] = {
                        scores: {},
                        winner: {
                            parti: 'NUL',
                            score: 0
                        }
                    };
                }
                if(parti && parti != 'ABSTENTION' && parti != 'NUL') {
                  if (score > results[bureau].winner.score) {
                    results[bureau].winner = {
                      parti: parti,
                      score: score
                    };
                  } else if (score == results[bureau].winner.score) {
                    results[bureau].winner = {
                      parti: "BC-egal",
                      score: score
                    };
                  }
                }
                if(!parti) {
                    parti = data[i][2];
                }
                results[bureau].scores[parti] = score;
            }
            // draw bureaux
            var customLayer = L.geoJson(null, {
                onEachFeature: onEachFeature
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                legend.update(""+parseInt(layer.feature.properties.BV2015));
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
            }

            function onEachFeature(feature, layer) {
                var data = results[""+parseInt(feature.properties.BV2015)];
                var color = 'grey';
                var opacity = 0;
                if(data) {
                    color = colors[data.winner.parti.split('-')[1]];
                    opacity = 0.6
                }
                layer.setStyle({ color: color, weight: 1, fillOpacity: opacity});
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });
            }

            var contourLayer = omnivore.geojson(options.contour.url, null, customLayer)
            .on('ready', function () {
                self.map.fitBounds(customLayer.getBounds());
            });
            // small fix
            contourLayer.on("dblclick", function (event){
                self.map.fire("dblclick", event);
            });

            contourLayer.addTo(self.map);

            // button hidden in css because it's causing fllickering
            //  !!!!!!!!!!
            //  !!!!!!!!!!
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
        });

        //optionnal logo
        if (dataset && dataset.logo) {
            var vendorLogo = L.control({position: 'bottomleft'});
            vendorLogo.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'vendors-logo');
                this._div.innerHTML = '<img id="vendor-logo" src="' + dataset.logo + '" />';
                return this._div;
            };
            vendorLogo.addTo(self.map);
        }

        // legend
        var legend = L.control({position: 'topright'});
        legend.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'legend info');
            this.update();
            return this._div;
        };
        legend.update = function (bureau) {
            var html = '<h3>Résultats à Toulouse</h3>';
            if(bureau && results[bureau]) {
                html += '<ul>';
                var total = 0;
                for(var parti in results[bureau].scores) {
                    if(parti != "ABSTENTION" && parti != "NUL") {
                      total += results[bureau].scores[parti];
                    }
                }
                for(var parti in results[bureau].scores) {
                    var score = results[bureau].scores[parti];
                    if(!score) {
                        score = 0;
                    }
                    if(parti == "ABSTENTION" || parti == "NUL") {
                        html += '<li>' + parti + ' (' + score + ' voix)</li>';
                    } else {
                        var label_parti = (parti.indexOf('-') > 0 ? parti.split('-')[1] : parti);
                        var ratio = Math.round(100 * score / total);
                        html += '<li>' + label_parti + ' '+ratio+'% (' + score + ' voix)</li><div style="display:inline-block;width:' + (2 * ratio) + 'px;height:10px;background-color:' + colors[label_parti] +';"></div></li>';
                    }
                }
                html += '</ul>';
            }

            html += 'Survolez un bureau de vote pour plus de détails';
            html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);
        L.control.attribution({position: 'topright'}).addTo(self.map);
    };
};
