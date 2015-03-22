var App = function(dataset) {

    var departement, pymChild;

    if (dataset && dataset.dpt) {
        departement = dataset.dpt;
    } else if (mkcMapFrame) {
        departement = mkcMapFrame.dptFromQS() || '31';
    } else {
        departement = '31';
    }

    var colors = {
        // TO BE COMPLETED
        'PS': '#BF47A1',
        'UMP-UDI': '#0C8FFA',
        'UMP': '#0C8FFA',
        'FN': 'black',
        'NUL': 'white',
        'ABS': 'grey',
    };
    var self = this;

    var options = {
        tileUrl: 'http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png',
        contour: {
            url: '../../../resources/carte_elec/carte_elec_dept_'+departement+'.geojson',
            type: 'geojson',
        },
        containerId: 'map',
        attribution: 'Tuiles par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }

    self.setPym = function (pC) {
        pymChild = pC;
    }

    self.init = function(){
        if (mkcMapFrame && dataset) {
            if (pymChild) {
                mkcMapFrame.init(dataset, pymChild);
            }
        }

        // init map
        self.map = L.map(options.containerId, {fullscreenControl: true, minZoom: 6, maxZoom: 14, attributionControl: false}).setActiveArea('activeArea');
        // add an OpenStreetMap tile layer
        self.tileLayer =L.tileLayer(options.tileUrl, {
            attribution: options.attribution
        });
        self.tileLayer.addTo(self.map);

        // read result from csv
        var results = {};
        $.getJSON('../../data/resultats/tour1/'+departement+'.json', function(data) {
            for(var i=1;i<data.length;i++) {
                var bureau = data[i][1];
                var parti = data[i][3];
                var score = data[i][4];
                if(!results[bureau]) {
                    results[bureau] = {
                        scores: {},
                        winner: {
                            parti: 'NUL',
                            score: 0
                        }
                    };
                }
                results[bureau].scores[parti] = score;
                if(parti != 'ABS' && parti != 'NUL' && score > results[bureau].winner.score) {
                    results[bureau].winner = {
                        parti: parti,
                        score: score
                    };
                }
            }
            // draw bureaux
            var customLayer = L.geoJson(null, {
                onEachFeature: onEachFeature
            });
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({weight: 4});
                legend.update(layer.feature.properties.BUREAU);
            }
            function resetHighlight(e) {
                var layer = e.target;
                layer.setStyle({weight: 1});
            }

            function onEachFeature(feature, layer) {
                var data = results[feature.properties.BUREAU];
                var color = 'grey';
                var opacity = 0;
                if(data) {
                    color = colors[data.winner.parti];
                    opacity = 0.5
                }
                layer.setStyle({ color: color, weight: 1, fillOpacity: opacity});
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });
            }

            var contourLayer = omnivore.geojson(options.contour.url, null, customLayer)
            .on('ready', function() {
                self.map.fitBounds(customLayer.getBounds());
            });
            // small fix
            contourLayer.on("dblclick", function(event){
                self.map.fire("dblclick", event);
            });

            contourLayer.addTo(self.map);
        });

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
                html+='<ul>';
                for(var parti in results[bureau].scores) {
                    html += '<li>'+parti+' '+ results[bureau].scores[parti]+'</li>';
                }
                html+='</ul>';
            }

            html += 'Survolez un bureau de vote pour plus de détails';
            html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
            (dataset && dataset.logo) && (html += '<img id="vendor-logo" src="' + dataset.logo + '" />');
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);
        L.control.attribution({position: 'topright'}).addTo(self.map);
    }
}
