var App = function(){

  var self = this;
  
  self.tileLayer;
  self.contourLayer;
  self.map;

  var options = {
    tileUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    candidats: {

    },
    contour: {
        url: './data/canton_2015-ms.json',
        type: 'topojson',
    },
    containerId: 'map',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }

  var canvas = L.canvas();

  var customLayer = L.geoJson(null, {
      onEachFeature: onEachFeature,
      renderer: canvas
  });


  function onEachFeature(feature, layer) {
    layer.setStyle({ color: '#f00', weight: 0.4, fillOpacity: 0});
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
  }
  function highlightFeature(feature, layer){
    this.setStyle({'weight': 2, fillOpacity: 0.4});
  }
  function resetHighlight(feature, layer){
    this.setStyle({'weight': 0.4, fillOpacity: 0})
  }


  self.init = function(){
    // init map
    self.map = L.map(options.containerId);

    // center on France
    self.map.setView(new L.LatLng(46.603354,1.8883335), 6);
    
    // add an OpenStreetMap tile layer
    self.tileLayer =L.tileLayer(options.tileUrl, {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
