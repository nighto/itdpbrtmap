require([
  "basemap/brt/transoeste",
  "basemap/brt/transcarioca",
  "basemap/brt/transolimpica",
  "basemap/brt/transbrasil",
  "basemap/ome/metrorio",
  "basemap/ome/supervia",
  "basemap/ome/vltcarioca",
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
        popupText += ' (' + feature.properties.Type + ')';
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

  // defining geojson's objects
  geoJsonBairros = L.geoJson(BAIRROS, {onEachFeature: bairrosPopupFn, style: pathStyle.Bairros}).addTo(map); // this had to be visible to popupfn.js context.

  var defaultOptsMetroRio   = {onEachFeature: linePopupFn, style: pathStyle.OME.MetroRio},
      defaultOptsSuperVia   = {onEachFeature: linePopupFn, style: pathStyle.OME.SuperVia},
      defaultOptsVLTCarioca = {onEachFeature: linePopupFn, style: pathStyle.OME.VLTCarioca};
  var geoJsonLineMetroRioLinha1      = L.geoJson(LINE_METRORIO_LINHA1, defaultOptsMetroRio).addTo(map);
  var geoJsonLineMetroRioLinha2      = L.geoJson(LINE_METRORIO_LINHA2, defaultOptsMetroRio).addTo(map);
  var geoJsonLineSuperViaSantaCruz   = L.geoJson(LINE_SUPERVIA_SCZ,    defaultOptsSuperVia).addTo(map);
  var geoJsonLineSuperViaSaracuruna  = L.geoJson(LINE_SUPERVIA_SRC,    defaultOptsSuperVia).addTo(map);
  var geoJsonLineSuperViaJaperi      = L.geoJson(LINE_SUPERVIA_JPI,    defaultOptsSuperVia).addTo(map);
  var geoJsonLineSuperViaGuapimirim  = L.geoJson(LINE_SUPERVIA_GPI,    defaultOptsSuperVia).addTo(map);
  var geoJsonLineSuperViaBelfordRoxo = L.geoJson(LINE_SUPERVIA_BRX,    defaultOptsSuperVia).addTo(map);
  var geoJsonLineVltCarioca          = L.geoJson(LINE_VLT_CARIOCA,     defaultOptsVLTCarioca).addTo(map);

  var geoJsonLineTransOeste          = L.geoJson(LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA, {onEachFeature: linePopupFn, style: pathStyle.BRT.TW}).addTo(map);
  var geoJsonLineTransOesteLote0     = L.geoJson(LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA,     {onEachFeature: linePopupFn, style: pathStyle.BRT.TW}).addTo(map);
  var geoJsonLineTransOestePlanejada = L.geoJson(LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA,  {onEachFeature: linePopupFn, style: pathStyle.BRT.TW}).addTo(map);
  var geoJsonLineTransCarioca        = L.geoJson(LINE_TRANSCARIOCA_GEOJSON_DATA,          {onEachFeature: linePopupFn, style: pathStyle.BRT.TC}).addTo(map);
  var geoJsonLineTransOlimpica       = L.geoJson(LINE_TRANSOLIMPICA_GEOJSON_DATA,         {onEachFeature: linePopupFn, style: pathStyle.BRT.TO}).addTo(map);
  var geoJsonLineTO_TC               = L.geoJson(LINE_TO_TC_GEOJSON_DATA,                 {onEachFeature: linePopupFn, style: pathStyle.BRT.TO}).addTo(map);
  var geoJsonLineTransBrasil         = L.geoJson(LINE_TRANSBRASIL_GEOJSON_DATA,           {onEachFeature: linePopupFn, style: pathStyle.BRT.TB}).addTo(map);

  //var geoJsonStationTransOeste       = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  //var geoJsonStationTransCarioca     = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransOlimpica    = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransBrasil      = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn, pointToLayer: pathStyle.fnMarkerOptionsBrtStation}).addTo(map);

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
  var arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada], // geoJsonStationTransOeste
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca], // geoJsonStationTransCarioca
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpica],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasil],
      arrayLayerOutrosModos   = [geoJsonLineMetroRioLinha1, geoJsonLineMetroRioLinha2, geoJsonLineSuperViaSantaCruz, geoJsonLineSuperViaSaracuruna,
                                 geoJsonLineSuperViaJaperi, geoJsonLineSuperViaGuapimirim, geoJsonLineSuperViaBelfordRoxo, geoJsonLineVltCarioca],
      arrayLayerBairros       = [geoJsonBairros];

  // adding layer control to map
  var MyControl = L.Control.extend({
    options: {
      position: 'topright'
    },

    _createTitle: popupfn.createTitle,
    _createCheckboxInput: popupfn.createCheckboxInput,
    _createRadioInput: popupfn.createRadioInput,

    _handleLayerEstudoAddRemove: function(){
      for(b in brts){
        for(c in caracteristicas){
          for(n in niveis){
            // se tudo está marcado e eu ainda não adicionei, adiciono.
            if(
              document.getElementById(brts[b]).checked &&
              document.getElementById(caracteristicas[c]).checked &&
              document.getElementById(niveis[n]).checked &&
              !study[brts[b]][caracteristicas[c]][niveis[n]].status
            ){
              study[brts[b]][caracteristicas[c]][niveis[n]].geojson.addTo(map);
              study[brts[b]][caracteristicas[c]][niveis[n]].status = true;
            }

            // se algum não está marcado e eu já adicionei, removo.
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
    },

    onAdd: function(map){
      var container = L.DomUtil.create('div', 'my-custom-control');
      this.form = L.DomUtil.create('form', '', container);

      this._createTitle('Sistemas BRT', this.form);
      this._createCheckboxInput('TransOeste',    'TW', true, this.form, arrayLayerTransOeste,    ['icon-TW']);
      this._createCheckboxInput('TransCarioca',  'TC', true, this.form, arrayLayerTransCarioca,  ['icon-TC']);
      this._createCheckboxInput('TransOlímpica', 'TO', true, this.form, arrayLayerTransOlimpica, ['icon-TO']);
      this._createCheckboxInput('TransBrasil',   'TB', true, this.form, arrayLayerTransBrasil,   ['icon-TB']);

      this._createTitle('Categorias', this.form);
      this._createCheckboxInput('Segurança viária',     'SV', true, this.form);
      this._createCheckboxInput('Integração modal',     'IN', true, this.form);
      this._createCheckboxInput('Operação',             'OP', true, this.form);
      this._createCheckboxInput('TOD',                  'TD', true, this.form);
      this._createCheckboxInput('Bicicleta e pedestre', 'TA', true, this.form);

      this._createTitle('Níveis de Atenção', this.form);
      this._createCheckboxInput('Crítico',  'CR', true, this.form);
      this._createCheckboxInput('Atenção',  'AT', true, this.form);
      this._createCheckboxInput('Sugestão', 'SU', true, this.form);

      //this._createTitle('Extras', this.form);
      //this._createCheckboxInput('Trens, Metrô e VLT', 'OME', true, this.form, arrayLayerOutrosModos);
      //this._createCheckboxInput('Bairros e dados socioeconômicos', 'BDE', true, this.form, arrayLayerBairros);

      this.divMapasDeCalor = L.DomUtil.create('div', 'mapasDeCalorInputs', this.form);

      this._createTitle('Extras', this.divMapasDeCalor);
      this._createRadioInput('Desativado',                 'DES', 'mapaCalor', true,  this.divMapasDeCalor, undefined);
      this._createRadioInput('Densidade populacional',     'DEN', 'mapaCalor', false, this.divMapasDeCalor, undefined);
      this._createRadioInput('Empregos formais/habitante', 'EMP', 'mapaCalor', false, this.divMapasDeCalor, undefined);

      return container;
    }
  });
  map.addControl(new MyControl());
});