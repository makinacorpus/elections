var App = function (dataset) {

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
    // Init map.
    self.map = L.map('map', {
      fullscreenControl: true,
      minZoom: 6,
    }).setActiveArea('activeArea').setView(options.view, 12);

    // Default (Makina) tile layer.
    self.tileLayer = L.tileLayer('http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png', {
      attribution: 'Tuiles par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 14
    });
    self.tileLayer.addTo(self.map);

    // OpenStreetMap tile layer for high zoom level
    self.tile2Layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      minZoom: 15
    });
    self.tile2Layer.addTo(self.map);

    // Add BV layer.
    $.getJSON(options.bv, function (data) {
      function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({weight: 4});
      }
      function resetHighlight(e) {
        var layer = e.target;
        layer.setStyle({weight: 1});
      }
      var style = {
        color: '#293133',
        weight: 1
      };
      onEachFeature = function(feature, layer) {
        // Event bindings
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
        });
      };
      var bvLayer = L.geoJson(data, {style: style, onEachFeature: onEachFeature});
      bvLayer.addTo(self.map);
    });

    // Add Canton layer.
    $.getJSON(options.cantons, function (data) {
      var style = {
        clickable: false,
        color: '#FFF',
        opacity: 1,
        weight: 2
      };
      var cantonLayer = L.geoJson(data, {style: style});
      cantonLayer.addTo(self.map);
    });

    // Optionnal logo.
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
    legend.update = function () {
      var html = '<h3>Résultats à ' + options.ville + '</h3>';
      html += '<p><big><strong>Survolez un bureau de vote pour plus de détails.</strong></big></p>';
      html += '<p>Les contours blancs correspondent aux cantons.</p>';
      html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
      this._div.innerHTML = html;
    }
    legend.addTo(self.map);
  };
};
