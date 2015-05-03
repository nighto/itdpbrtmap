require(["data"], function(util){
    // coordenadas do mapa
  var INITIAL_COORDINATES = [-22.871658, -43.3371976], // Madureira
      INITIAL_ZOOM = 11,
      OSM_TILE_LAYER_URL = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      MAPBOX_TILE_LAYER_URL = 'http://{s}.tiles.mapbox.com/v3/nighto.02109f37/{z}/{x}/{y}.png';

  // create a map in the "map" div, set the view to a given place and zoom
  var map = L.map('map').setView(INITIAL_COORDINATES, INITIAL_ZOOM);

  // add an OpenStreetMap tile layer
  L.tileLayer(MAPBOX_TILE_LAYER_URL, {
      attribution: '&copy; Mapa base: <a href="http://osm.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // defining styles
  var pathStyleConstructedBRT           = {"color": "#ff7800","weight": 5,"opacity": 1},
      pathStyleUnderConstructionBRT     = {"color": "#666666","weight": 5,"opacity": 1},
      pathStylePlannedBRT               = {"color": "#CCCCCC","weight": 5,"opacity": 1},
      pathStyleOutrosModosEstruturantes = {"color": "#000000","weight": 3,"opacity": 1},
      pathStyleBairros                  = {"color": "#A8E6FF","weight": 2};

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
                  + 'Área: ' + feature.properties.AREA_KM2.toFixed(2).toString().replace('.',',') + 'km²<br>'
                  + 'População: ' + feature.properties.POPULACAO + '<br>'
                  + 'Empregos: ' + feature.properties.EMPRG + '<br>'
                  + 'Densidade populacional: ' + feature.properties.DENS_POP_K.toFixed(3).toString().replace('.',',') + '<br>'
                  + 'Razão de Empregos: ' + feature.properties.RAZAO_EMPR.toFixed(3).toString().replace('.',',');
    layer.bindPopup(popupText);
  };

  // defining geojson's objects
  var geoJsonLineTransOeste          = L.geoJson(LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA, {onEachFeature: linePopupFn, style: pathStyleConstructedBRT}),
      geoJsonLineTransOesteLote0     = L.geoJson(LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA,     {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}),
      geoJsonLineTransOestePlanejada = L.geoJson(LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA,  {onEachFeature: linePopupFn, style: pathStylePlannedBRT}),
      geoJsonLineTransCarioca        = L.geoJson(LINE_TRANSCARIOCA_GEOJSON_DATA,          {onEachFeature: linePopupFn, style: pathStyleConstructedBRT}),
      geoJsonLineTransOlimpica       = L.geoJson(LINE_TRANSOLIMPICA_GEOJSON_DATA,         {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}),
      geoJsonLineTO_TC               = L.geoJson(LINE_TO_TC_GEOJSON_DATA,                 {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}),
      geoJsonLineTransBrasil         = L.geoJson(LINE_TRANSBRASIL_GEOJSON_DATA,           {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}),
      geoJsonLineMetroRioLinha1      = L.geoJson(LINE_METRORIO_LINHA1,                    {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineMetroRioLinha2      = L.geoJson(LINE_METRORIO_LINHA2,                    {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaSantaCruz   = L.geoJson(LINE_SUPERVIA_SCZ,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaSaracuruna  = L.geoJson(LINE_SUPERVIA_SRC,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaJaperi      = L.geoJson(LINE_SUPERVIA_JPI,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaGuapimirim  = L.geoJson(LINE_SUPERVIA_GPI,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaBelfordRoxo = L.geoJson(LINE_SUPERVIA_BRX,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}),
      geoJsonLineVltCarioca          = L.geoJson(LINE_VLT_CARIOCA,                        {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes});

  var geoJsonStationTransOeste       = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn}),
      geoJsonStationTransCarioca     = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn}),
      geoJsonStationTransOlimpica    = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn}),
      geoJsonStationTransBrasil      = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn});

  var geoJsonBairros                 = L.geoJson(BAIRROS, {onEachFeature: bairrosPopupFn, style: pathStyleBairros});

  // defining layers
  var layerTransOeste    = L.layerGroup([geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOeste]),
      layerTransCarioca  = L.layerGroup([geoJsonLineTransCarioca, geoJsonStationTransCarioca]),
      layerTransOlimpica = L.layerGroup([geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpica]),
      layerTransBrasil   = L.layerGroup([geoJsonLineTransBrasil, geoJsonStationTransBrasil]),
      layerOutrosModos   = L.layerGroup([geoJsonLineMetroRioLinha1, geoJsonLineMetroRioLinha2, geoJsonLineSuperViaSantaCruz, geoJsonLineSuperViaSaracuruna, geoJsonLineSuperViaJaperi, geoJsonLineSuperViaJaperi, geoJsonLineSuperViaBelfordRoxo, geoJsonLineVltCarioca]),
      layerBairros       = L.layerGroup([geoJsonBairros]);

  var overlayMaps = {
    "BRT TransOeste":    layerTransOeste,
    "BRT TransCarioca":  layerTransCarioca,
    "BRT TransOlímpica": layerTransOlimpica,
    "BRT TransBrasil":   layerTransBrasil,
    "Outros Modos Estruturantes": layerOutrosModos,
    "Bairros": layerBairros
  };

  // adding layer control to map
  L.control.layers(null, overlayMaps).addTo(map);

  // initiating pre-opened layers
  layerBairros.addTo(map);
  layerTransOeste.addTo(map);
  layerTransCarioca.addTo(map);
  layerTransOlimpica.addTo(map);
  layerTransBrasil.addTo(map);
  layerOutrosModos.addTo(map);
});