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

        // Add bounds.
        $.getJSON('data/bv_32_lectoure_2014.json', function(data) {
          var style = {
            color: '#293133',
            weight: 1,
            opacity: 1,
            clickable: false
          };
          var boundsLayer = L.geoJson(data, {
            style: style
          });
          boundsLayer.addTo(self.map);
          self.map.fitBounds(boundsLayer.getBounds());
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
        updateLegend = function() {
          var html = '';
          html += '<h3>Municipales 2014</h3>';
          html += '<p>Survolez un bureau de vote pour plus de détails.</p>';
          this._div.innerHTML = html;
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

        var legend = L.control({position: 'topright'});
        legend.onAdd = addLegend;
        legend.update = updateLegend;
        legend.addTo(self.map);
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
