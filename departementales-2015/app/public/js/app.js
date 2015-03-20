var App = function(){

  var self = this;
  
  self.tileLayer;
  self.contourLayer;
  self.map;

  /** options **/

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

  /** **/

  var canvas = L.canvas();

  var customLayer = L.geoJson(null, {
      onEachFeature: onEachFeature,
      renderer: canvas
  });

  /** Related to feature **/

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

  /** Init **/

  self.init = function(){
    // init map
    self.map = L.map(options.containerId);

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

        // legend
        var legend = L.control({position: 'topright'});
        legend.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'legend info');
            this.update();
            return this._div;
        };
        legend.update = function (bureau) {
            var html = '<h3>Résultats 1<sup>er</sup> tour</h3>';
            //~ if(bureau && results[bureau]) {
                //~ html+='<ul>';
                //~ for(var parti in results[bureau].scores) {
                    //~ html += '<li>'+parti+' '+ results[bureau].scores[parti]+'</li>';
                //~ }
                //~ html+='</ul>';
            //~ }
            //~ html += 'Survolez un bureau de vote pour plus de détails'
            this._div.innerHTML = html;
        };
        legend.addTo(self.map);

  }
}
