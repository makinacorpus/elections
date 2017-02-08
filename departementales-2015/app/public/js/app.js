var App = function(){

  var self = this;
  
  self.tileLayer;
  self.cantLayer;
  self.map;
  self.data;
  self.colors;
  self.depLayer;

  /** options **/

  var options = {
    tileUrl: 'http://{s}.tilestream.makina-corpus.net/v2/osmlight-france/{z}/{x}/{y}.png',
    minZoom: 5,
    maxZoom: 14,
    candidats: {
    },
    contour: {
        url: './data/canton_2015-ms.json',
        type: 'topojson',
    },
    containerId: 'map',
    attribution: 'Cartes par <a href="http://makina-corpus.com/expertise/cartographie">Makina Corpus</a> & données &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }

  /** **/

  var customLayer = L.geoJson(null, {
      onEachFeature: onEachFeature
  });
  var regex = new RegExp(/[A-Za-z]+/);

  /** Related to feature **/

  function onEachFeature(feature, layer) {
    layer.setStyle({ color: '#CCC', weight: 1, fillColor: 'darkgrey', fillOpacity: 0.7});
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
        var parti = this.parti.substr(3);
        var color = colors[parti] || '#CCC';
        var nom = this.nom;
        rows.push('<li><div style="display:inline-block;margin-right: 5px;height:20px;width:40px;border:1px solid '+ color + '; background-color:'+color+';opacity:0.6;"></div><div style="display:inline-block;">' + parti + '<br>' + nom + '</div></li>')
      })
      html = '<b>Département ' + dep + '</b><br><b> canton : ' + data.libelle + '</b> (canton n°<b>' + canton + '</b>)<ul>' + rows.join("") + '</ul>';
    }
    else{
      html = '<b> Candidats par canton </b><p>Survolez un canton pour plus de détails</p>';
    }
    html += '<a href="http://www.makina-corpus.com" target="_blank"><img id="logo" src="http://makina-corpus.com/++theme++plonetheme.makinacorpuscom/images/logo.png"></a>';
    this._div.innerHTML = html;

  };

  /** Init **/

  self.init = function(){
    // init map
    self.map = L.map(options.containerId, {minZoom: options.minZoom, maxZoom: options.maxZoom, attributionControl: false}).setActiveArea('activeArea');
    self.legend.addTo(self.map);
    L.control.attribution({position: 'topright'}).setPrefix('').addTo(self.map);

    $.getJSON("./data/candidatures.json", function(data){
      self.data = data;
    });
    $.getJSON("../../../resources/departements.geojson", function(data) {
      var style = {
        color: 'black',
        opacity: 1,
        weight: 3,
        clickable: false,
      }
      self.depLayer = L.geoJson(data, {style: style});
      self.depLayer.addTo(self.map);
      self.map.fitBounds(self.depLayer.getBounds());
    });
    $.getJSON("../../../resources/nuances.json", function(data) {
      self.colors = data;
    });

    // center on France
    if (!self.depLayer) {
      self.map.setView(new L.LatLng(44,0), 6);
    }
      
    // add an OpenStreetMap tile layer
    self.tileLayer = L.tileLayer(options.tileUrl, {
      attribution: options.attribution
    });

    self.cantLayer = omnivore.topojson(options.contour.url, null, customLayer);
    // small fix
    self.cantLayer.on("dblclick", function(event){
      self.map.fire("dblclick", event);
    });
    self.cantLayer.on("mouseout", function(event){
      self.legend.update();
    })

    self.cantLayer.addTo(self.map);
    self.tileLayer.addTo(self.map);

    // Remove department Layer on zoom.
    self.map.on('zoomend', function (e) {
      if (self.map.getZoom() >= 10) {
        self.map.removeLayer(self.depLayer);
      } else {
        self.map.addLayer(self.depLayer);
      }
    });
  }
}
