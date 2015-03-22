var App = function(){

  var self = this;
  
  self.tileLayer;
  self.contourLayer;
  self.map;
  self.data;
  self.colors = {
    "BC-COM":"#CCC",
    "BC-DIV":"#CCC",
    "BC-DLF":"#CCC",
    "BC-DVD":"#ADC1FD",
    "BC-DVG":"#FFC0C0",
    "BC-EXD":"#404040",
    "BC-EXG":"#BB0000",
    "BC-FG":"#DD0000",
    "BC-FN":"#C0C0C0",
    "BC-MDM":"#FF9900",
    "BC-PG":"#DD0000",
    "BC-RDG":"#FFD1DC",
    "BC-SOC":"#FF8080",
    "BC-UC":"#74C2C3",
    "BC-UD":"#CCC",
    "BC-UDI":"#00FFFF",
    "BC-UG":"#CCC",
    "BC-UMP":"#0066CC",
    "BC-VEC":"#00C000"
  };

  /** options **/

  var options = {
    tileUrl: 'http://tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png',
    candidats: {

    },
    contour: {
        url: './data/canton_2015-ms.json',
        type: 'topojson',
    },
    containerId: 'map',
    attribution: 'Tiles by <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }

  /** **/

  var canvas = L.canvas();

  var customLayer = L.geoJson(null, {
      onEachFeature: onEachFeature,
      renderer: canvas
  });
  var regex = new RegExp(/[A-Za-z]+/);

  /** Related to feature **/

  function onEachFeature(feature, layer) {
    layer.setStyle({ color: '#CCC', weight: 0.5, fillColor: 'darkgrey', fillOpacity: 0.7});
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
  }

  function highlightFeature(event){
    this.setStyle({weight: 3, fillOpacity: 0});
    var dep = this.feature.properties.DEP;
    var canton = this.feature.properties.CT;
    if( !regex.exec(dep) ){
      dep = parseInt(dep);
    }
    if( !regex.exec(canton) ){
      canton = parseInt(canton);
    }
    self.legend.update(self.data[dep].cantons[canton], dep, canton, self.colors);
  }

  function resetHighlight(feature, layer){
    this.setStyle({weight: 0.5, fillColor: 'darkgrey', fillOpacity: 0.7})
  }
  
  /** Legends **/

  self.legend = L.control({position: 'topright'});
  
  self.legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'legend info');
    this.update();
    return this._div;
  };

  self.legend.update = function (data, dep, canton, colors) {
    var html = "";
    if(!!data){
      var rows = [];
      $.each(data.binomes, function() {
        var parti = this.parti;
        var color = colors[parti] || '#CCC';
        var parti = this.parti.substr(3);
        var nom = this.nom;
        rows.push('<li><div style="display:inline-block;margin-right: 5px;height:20px;width:40px;border:1px solid '+ color + '; background-color:'+color+';opacity:0.6;"></div><div style="display:inline-block;">' + parti + '<br>' + nom + '</div></li>')
      })
      html = '<b>Département ' + dep + '</b><br><b> canton : ' + data.libelle + '</b> (canton n°<b>' + canton + '</b>)<ul>' + rows.join("") + '</ul>';
    }
    else{
      html = '<b> Candidats par canton </b><p>Survolez un bureau de vote pour plus de détails</p>';
    }
    this._div.innerHTML = html;

  };

  /** Init **/

  self.init = function(){
    // init map
    self.map = L.map(options.containerId);
    self.legend.addTo(self.map)

    $.getJSON("./data/candidatures.json", function(data){
      self.data = data;
    });

    // center on France
    self.map.setView(new L.LatLng(46.603354,1.8883335), 6);
      
    // add an OpenStreetMap tile layer
    self.tileLayer =L.tileLayer(options.tileUrl, {
        attribution: options.attribution
    })

    if(options.contour.type === "topojson"){
      var contourLayer = omnivore.topojson(options.contour.url, null, customLayer);
      // small fix
      contourLayer.on("dblclick", function(event){
        self.map.fire("dblclick", event);
      })
    }

    contourLayer.addTo(self.map);
    self.tileLayer.addTo(self.map);
  }
}
