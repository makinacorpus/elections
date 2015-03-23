var App = function() {

    var colors = {
        "ANAR":"#000000",
        "EXG":"#BB0000",
        "LO":"#BB0000",
        "NPA":"#BB0000",
        "FG":"#DD0000",
        "PCF":"#DD0000",
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
        "COM":"#CCC",
        "DLF":"#CCC",
        "UC":"#74C2C3",
        "UD":"#ADC1FD",
        "UG":"#FFC0C0"
        };
    var self = this;
    var departement = location.search.slice(location.search.indexOf("dep=")+4, location.search.indexOf("dep=")+6);
    var options = {
        tileUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        contour: {
            url: '../../../resources/bureaux/'+departement+'.geojson',
            type: 'geojson',
        },
        containerId: 'map',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }

    var canvas = L.canvas();

    self.init = function(){
        // init map
        self.map = L.map(options.containerId);

        // add an OpenStreetMap tile layer
        self.tileLayer =L.tileLayer(options.tileUrl, {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
                if(parti && score > results[bureau].winner.score) {
                    results[bureau].winner = {
                        parti: parti,
                        score: score
                    };
                }
            }
            // draw bureaux
            var customLayer = L.geoJson(null, {
                onEachFeature: onEachFeature,
                renderer: canvas
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
            html += 'Survolez un bureau de vote pour plus de détails'
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);
    }
}
