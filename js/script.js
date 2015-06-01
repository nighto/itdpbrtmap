require([
  "basemap/brt/transoeste",
  "basemap/brt/transcarioca",
  "basemap/brt/transolimpica",
  "basemap/brt/transbrasil",
  "basemap/bairros",
  "dummy",
  "mapstyles",
  "popupfn"
], function(util){

  // coordenadas do mapa
  var INITIAL_COORDINATES = [-22.871658, -43.3371976], // Madureira
      INITIAL_ZOOM = 11,
      OSM_TILE_LAYER_URL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      MAPBOX_TILE_LAYER_URL = 'http://{s}.tiles.mapbox.com/v3/nighto.02109f37/{z}/{x}/{y}.png';

  // create a map in the "map" div, set the view to a given place and zoom
  map = L.map('map').setView(INITIAL_COORDINATES, INITIAL_ZOOM);

  // add an OpenStreetMap tile layer
  L.tileLayer(MAPBOX_TILE_LAYER_URL, {
      attribution: '&copy; Mapa base: <a href="http://osm.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  selectedMapaDeCalorRef = 'DES';

  // defining popups
  var lineStatusText = function(status){
    if(status == 'Open')
      return 'Em funcionamento';
    if(status == 'U.C.')
      return 'Em construção';
    if(status == 'Planned')
      return 'Planejado';
    return '';
  };

  var stationStatusText = function(status){
    if(status == 'Operational')
      return 'Em operação';
    if(status == 'Planned')
      return 'Planejada';
    if(status == 'In Study')
      return 'Em estudo';
    if(status == 'U.C.')
      return 'Em construção';
    return '';
  };

  var linePopupFn = function(feature, layer){
    // does this feature have a property named "Name"?
    if(feature.properties && feature.properties.Name){
      var popupText = feature.properties.Name;

      if(feature.properties.Status){
        popupText += '<br>Status: ' + lineStatusText(feature.properties.Status);
      }

      layer.bindPopup(popupText);
    }
  };

  var stationPopupFn = function(feature, layer){
    // "properties":{"Name":"Terminal Alvorada","Corredor":"TransCarioca","Type":"Expresso\/Parador","Status":"Operational"}
    if(feature.properties && feature.properties.Name){
      var popupText = 'Estação ' + feature.properties.Name;

      if(feature.properties.Type){
        popupText += '<br>Serviço';
        if(feature.properties.Type !== 'Parador'){ // if is not only "Parador", add plural
          popupText += 's';
        }
        popupText += ': ' + feature.properties.Type;
      }

      if(feature.properties.Corredor){
        popupText += '<br>Corredor: ' + feature.properties.Corredor;
      }

      if(feature.properties.Status){
        popupText += '<br>Status: ' + stationStatusText(feature.properties.Status);
      }

      layer.bindPopup(popupText);
    }
  };

  var bairrosPopupFn = function(feature, layer){
    // "properties": { "BAIRRO_BDA": "Santa Teresa", "AREA": "Centro", "AREA_KM2": 5.1571268999999997, "POPULACAO": 40926, "EMPRG": 2297, "DENS_POP_K": 7.9358140285400003, "RAZAO_EMPR": 0.0561256902702 }
    var popupText = '<b>' + feature.properties.BAIRRO_BDA + '</b><br>'
                  + 'Área: ' + feature.properties.AREA_KM2.toFixed(2).toString().replace('.',',') + ' km²<br>'
                  + 'População: ' + feature.properties.POPULACAO.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' hab.<br>'
                  + 'Densidade populacional: ' + feature.properties.DENS_POP_K.toFixed(3).toString().replace('.',',') + ' hab./km²<br>'
                  + 'Empregos formais: ' + feature.properties.EMPRG.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '<br>'
                  + 'Empregos formais/habitante: ' + feature.properties.RAZAO_EMPR.toFixed(3).toString().replace('.',',');
    layer.bindPopup(popupText);
  };

  var estudoPopupFn = function(feature, layer){
    // "properties": { "Name": "Uma coisa muito crítica", "Description": "Muito crítica mesmo" }
    var popupText = '<b>' + feature.properties.Name + '</b><br>' + feature.properties.Description;
    layer.bindPopup(popupText);
  };

  // defining geojson's objects, starting with the bairros (suburbs)
  geoJsonBairros = L.geoJson(BAIRROS, {onEachFeature: bairrosPopupFn, style: pathStyle.Bairros}).addTo(map); // this had to be visible to popupfn.js context.

  // BRT Lines
  var geoJsonLineTransOeste          = L.geoJson(LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA, {onEachFeature: linePopupFn, style: pathStyle.BRT.TW}).addTo(map);
  var geoJsonLineTransOesteLote0     = L.geoJson(LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA,     {onEachFeature: linePopupFn, style: pathStyle.BRT.TW}).addTo(map);
  var geoJsonLineTransOestePlanejada = L.geoJson(LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA,  {onEachFeature: linePopupFn, style: pathStyle.BRT.TWplanejada}).addTo(map);
  var geoJsonLineTransCarioca        = L.geoJson(LINE_TRANSCARIOCA_GEOJSON_DATA,          {onEachFeature: linePopupFn, style: pathStyle.BRT.TC}).addTo(map);
  var geoJsonLineTransOlimpica       = L.geoJson(LINE_TRANSOLIMPICA_GEOJSON_DATA,         {onEachFeature: linePopupFn, style: pathStyle.BRT.TO}).addTo(map);
  var geoJsonLineTO_TC               = L.geoJson(LINE_TO_TC_GEOJSON_DATA,                 {onEachFeature: linePopupFn, style: pathStyle.BRT.TO}).addTo(map);
  var geoJsonLineTransBrasil         = L.geoJson(LINE_TRANSBRASIL_GEOJSON_DATA,           {onEachFeature: linePopupFn, style: pathStyle.BRT.TB}).addTo(map);

  // BRT Stations
  var geoJsonStationTransOesteLZ     = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransCariocaLZ   = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransOlimpicaLZ  = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransBrasilLZ    = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);

  var currentZoomLevel = 'LZ';

  // bigger circles for higher zoom levels
  var geoJsonStationTransOesteHZ     = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationHighZoom});
  var geoJsonStationTransCariocaHZ   = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationHighZoom});
  var geoJsonStationTransOlimpicaHZ  = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationHighZoom});
  var geoJsonStationTransBrasilHZ    = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationHighZoom});

  // even bigger circles for even higher zoom levels
  var geoJsonStationTransOesteSHZ     = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationSuperHighZoom});
  var geoJsonStationTransCariocaSHZ   = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationSuperHighZoom});
  var geoJsonStationTransOlimpicaSHZ  = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationSuperHighZoom});
  var geoJsonStationTransBrasilSHZ    = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStationSuperHighZoom});

  // auxiliary functions for different markers on different zoom levels
  var zoomfns = {
    deactivateCheckboxes: function(){
      var _checkboxes = document.getElementsByClassName('brtcheckboxes')[0];
      _checkboxes.parentNode.removeChild(_checkboxes);
    },
    activateCheckboxes: function(){
      var _checkboxes = document.createElement('div');
      _checkboxes.className = 'brtcheckboxes';

      var _fcc = document.getElementsByClassName('form-custom-control')[0];
      _fcc.insertBefore(_checkboxes, _fcc.firstChild);

      popupfn.createTitle('Sistemas BRT', _checkboxes);
      popupfn.createCheckboxInput('TransOeste',    'TW', true, _checkboxes, arrayLayerTransOeste,    ['icon-TW']);
      popupfn.createCheckboxInput('TransCarioca',  'TC', true, _checkboxes, arrayLayerTransCarioca,  ['icon-TC']);
      popupfn.createCheckboxInput('TransOlímpica', 'TO', true, _checkboxes, arrayLayerTransOlimpica, ['icon-TO']);
      popupfn.createCheckboxInput('TransBrasil',   'TB', true, _checkboxes, arrayLayerTransBrasil,   ['icon-TB']);
    },
    deactivateLZ: function(){
      map.removeLayer(geoJsonStationTransOesteLZ);
      map.removeLayer(geoJsonStationTransCariocaLZ);
      map.removeLayer(geoJsonStationTransOlimpicaLZ);
      map.removeLayer(geoJsonStationTransBrasilLZ);
      zoomfns.deactivateCheckboxes();
    },
    deactivateHZ: function(){
      map.removeLayer(geoJsonStationTransOesteHZ);
      map.removeLayer(geoJsonStationTransCariocaHZ);
      map.removeLayer(geoJsonStationTransOlimpicaHZ);
      map.removeLayer(geoJsonStationTransBrasilHZ);
      zoomfns.deactivateCheckboxes();
    },
    deactivateSHZ: function(){
      map.removeLayer(geoJsonStationTransOesteSHZ);
      map.removeLayer(geoJsonStationTransCariocaSHZ);
      map.removeLayer(geoJsonStationTransOlimpicaSHZ);
      map.removeLayer(geoJsonStationTransBrasilSHZ);
      zoomfns.deactivateCheckboxes();
    },
    activateLZ: function(){
      geoJsonStationTransOeste    = geoJsonStationTransOesteLZ;
      geoJsonStationTransCarioca  = geoJsonStationTransCariocaLZ;
      geoJsonStationTransOlimpica = geoJsonStationTransOlimpicaLZ;
      geoJsonStationTransBrasil   = geoJsonStationTransBrasilLZ;

      arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOesteLZ],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCariocaLZ],
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpicaLZ],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasilLZ];

      geoJsonStationTransOesteLZ.addTo(map);
      geoJsonStationTransCariocaLZ.addTo(map);
      geoJsonStationTransOlimpicaLZ.addTo(map);
      geoJsonStationTransBrasilLZ.addTo(map);

      zoomfns.activateCheckboxes();
    },
    activateHZ: function(){
      geoJsonStationTransOeste    = geoJsonStationTransOesteHZ;
      geoJsonStationTransCarioca  = geoJsonStationTransCariocaHZ;
      geoJsonStationTransOlimpica = geoJsonStationTransOlimpicaHZ;
      geoJsonStationTransBrasil   = geoJsonStationTransBrasilHZ;

      arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOesteHZ],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCariocaHZ],
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpicaHZ],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasilHZ];

      geoJsonStationTransOesteHZ.addTo(map);
      geoJsonStationTransCariocaHZ.addTo(map);
      geoJsonStationTransOlimpicaHZ.addTo(map);
      geoJsonStationTransBrasilHZ.addTo(map);

      zoomfns.activateCheckboxes();
    },
    activateSHZ: function(){
      geoJsonStationTransOeste    = geoJsonStationTransOesteSHZ;
      geoJsonStationTransCarioca  = geoJsonStationTransCariocaSHZ;
      geoJsonStationTransOlimpica = geoJsonStationTransOlimpicaSHZ;
      geoJsonStationTransBrasil   = geoJsonStationTransBrasilSHZ;

      arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOesteSHZ],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCariocaSHZ],
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpicaSHZ],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasilSHZ];

      geoJsonStationTransOesteSHZ.addTo(map);
      geoJsonStationTransCariocaSHZ.addTo(map);
      geoJsonStationTransOlimpicaSHZ.addTo(map);
      geoJsonStationTransBrasilSHZ.addTo(map);

      zoomfns.activateCheckboxes();
    }
  };

  // registering the event for every zoom level change
  map.on('zoomend', function(e){
    var _zoomLevel = map.getZoom();
    if(_zoomLevel >= 13 && _zoomLevel < 16){ // HZ
      if(currentZoomLevel == 'LZ'){
        zoomfns.deactivateLZ();
        zoomfns.activateHZ();
      }
      if(currentZoomLevel == 'SHZ'){
        zoomfns.deactivateSHZ();
        zoomfns.activateHZ();
      }
      currentZoomLevel = 'HZ';
    }else if(_zoomLevel >= 16){ // SHZ
      if(currentZoomLevel == 'HZ'){
        zoomfns.deactivateHZ();
        zoomfns.activateSHZ();
      }
      currentZoomLevel = 'SHZ';
    }else{ // LZ
      if(currentZoomLevel == 'HZ'){
        zoomfns.deactivateHZ();
        zoomfns.activateLZ();
      }
      currentZoomLevel = 'LZ';
    }
  });

  // initializing estudo object
  var study = {},
      brts = ['TW'],
      caracteristicas = ['SV'],
      niveis = ['CR', 'AT', 'SU'];

  var initializeStudy = function(study){
    for(b in brts){
      study[brts[b]] = {};
        for(c in caracteristicas){
          study[brts[b]][caracteristicas[c]] = {};
          for(n in niveis){
            study[brts[b]][caracteristicas[c]][niveis[n]] = {};
            study[brts[b]][caracteristicas[c]][niveis[n]].status = true;
            // L.geoJson(TW_SV_CR, {...})
            study[brts[b]][caracteristicas[c]][niveis[n]].geojson = L.geoJson(window[brts[b] + '_' + caracteristicas[c] + '_' + niveis[n]], {onEachFeature: estudoPopupFn}).addTo(map);
          }
        }
    }
  };
  initializeStudy(study);

  // defining base layers
  var arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOesteLZ],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCariocaLZ],
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpicaLZ],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasilLZ],
      arrayLayerBairros       = [geoJsonBairros];

  fnHandleLayerEstudoAddRemove = function(){
    for(b in brts){
      for(c in caracteristicas){
        for(n in niveis){
          // checks if everything is checked and I didn't add, do add.
          if(
            document.getElementById(brts[b]).checked &&
            document.getElementById(caracteristicas[c]).checked &&
            document.getElementById(niveis[n]).checked &&
            !study[brts[b]][caracteristicas[c]][niveis[n]].status
          ){
            study[brts[b]][caracteristicas[c]][niveis[n]].geojson.addTo(map);
            study[brts[b]][caracteristicas[c]][niveis[n]].status = true;
          }

          // if something is not checked and I already added, do remove.
          if(
            (
              !document.getElementById(brts[b]).checked ||
              !document.getElementById(caracteristicas[c]).checked ||
              !document.getElementById(niveis[n]).checked
            ) && study[brts[b]][caracteristicas[c]][niveis[n]].status
          ){
            map.removeLayer(study[brts[b]][caracteristicas[c]][niveis[n]].geojson);
            study[brts[b]][caracteristicas[c]][niveis[n]].status = false;
          }
        }
      }
    }
  };

  // adding layer control to map
  var MyControl = L.Control.extend({
    options: {
      position: 'topright'
    },

    _createTitle: popupfn.createTitle,
    _createCheckboxInput: popupfn.createCheckboxInput,
    _createRadioInput: popupfn.createRadioInput,
    _handleLayerEstudoAddRemove: fnHandleLayerEstudoAddRemove,

    onAdd: function(map){
      var container = L.DomUtil.create('div', 'my-custom-control');
      this.form = L.DomUtil.create('form', 'form-custom-control', container);

      this.containerBRT = L.DomUtil.create('div', 'brtcheckboxes', this.form);
      this._createTitle('Sistemas BRT', this.containerBRT);
      this._createCheckboxInput('TransOeste',    'TW', true, this.containerBRT, arrayLayerTransOeste,    ['icon-TW']);
      this._createCheckboxInput('TransCarioca',  'TC', true, this.containerBRT, arrayLayerTransCarioca,  ['icon-TC']);
      this._createCheckboxInput('TransOlímpica', 'TO', true, this.containerBRT, arrayLayerTransOlimpica, ['icon-TO']);
      this._createCheckboxInput('TransBrasil',   'TB', true, this.containerBRT, arrayLayerTransBrasil,   ['icon-TB']);

      this.containerCategorias = L.DomUtil.create('div', 'categoriascheckboxes', this.form);
      this._createTitle('Categorias', this.containerCategorias);
      this._createCheckboxInput('Segurança viária',     'SV', true, this.containerCategorias);
      this._createCheckboxInput('Integração modal',     'IN', true, this.containerCategorias);
      this._createCheckboxInput('Operação',             'OP', true, this.containerCategorias);
      this._createCheckboxInput('TOD',                  'TD', true, this.containerCategorias);
      this._createCheckboxInput('Bicicleta e pedestre', 'TA', true, this.containerCategorias);

      this.containerNiveisDeAtencao = L.DomUtil.create('div', 'niveisdeatencaocheckboxes', this.form);
      this._createTitle('Níveis de Atenção', this.containerNiveisDeAtencao);
      this._createCheckboxInput('Crítico',  'CR', true, this.containerNiveisDeAtencao);
      this._createCheckboxInput('Atenção',  'AT', true, this.containerNiveisDeAtencao);
      this._createCheckboxInput('Sugestão', 'SU', true, this.containerNiveisDeAtencao);

      this.containerMapasDeCalor = L.DomUtil.create('div', 'mapasDeCalorInputs', this.form);
      this._createTitle('Extras', this.containerMapasDeCalor);
      this._createRadioInput('Desativado',                 'DES', 'mapaCalor', true,  this.containerMapasDeCalor, undefined);
      this._createRadioInput('Densidade populacional',     'DEN', 'mapaCalor', false, this.containerMapasDeCalor, undefined);
      this._createRadioInput('Empregos formais/habitante', 'EMP', 'mapaCalor', false, this.containerMapasDeCalor, undefined);

      return container;
    }
  });
  map.addControl(new MyControl());
});