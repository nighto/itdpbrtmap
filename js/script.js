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
  var lineStyleConstructedBRT           = {"color": "#ff7800","weight": 5,"opacity": 1},
      lineStyleUnderConstructionBRT     = {"color": "#666666","weight": 5,"opacity": 1},
      lineStylePlannedBRT               = {"color": "#CCCCCC","weight": 5,"opacity": 1},
      lineStyleOutrosModosEstruturantes = {"color": "#000000","weight": 3,"opacity": 1};

  // defining popups
  var linePopupFn = function(feature, layer){
    // does this feature have a property named "Name"?
    if(feature.properties && feature.properties.Name){
      var popupText = feature.properties.Name;

      if(feature.properties.Status){
        var statusText;
        switch(feature.properties.Status){
          case 'Open':
            statusText = 'Em funcionamento';
            break;
          case 'U.C.':
            statusText = 'Em construção';
            break;
          case 'Planned':
            statusText = 'Planejado';
            break;
        }
        popupText += '<br>' + statusText;
      }

      layer.bindPopup(popupText);
    }
  };

  // defining geojson's objects
  var geoJsonLineTransOeste          = L.geoJson(LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA, {onEachFeature: linePopupFn, style: lineStyleConstructedBRT}),
      geoJsonLineTransOesteLote0     = L.geoJson(LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA,     {onEachFeature: linePopupFn, style: lineStyleUnderConstructionBRT}),
      geoJsonLineTransOestePlanejada = L.geoJson(LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA,  {onEachFeature: linePopupFn, style: lineStylePlannedBRT}),
      geoJsonLineTransCarioca        = L.geoJson(LINE_TRANSCARIOCA_GEOJSON_DATA,          {onEachFeature: linePopupFn, style: lineStyleConstructedBRT}),
      geoJsonLineTransOlimpica       = L.geoJson(LINE_TRANSOLIMPICA_GEOJSON_DATA,         {onEachFeature: linePopupFn, style: lineStyleUnderConstructionBRT}),
      geoJsonLineTO_TC               = L.geoJson(LINE_TO_TC_GEOJSON_DATA,                 {onEachFeature: linePopupFn, style: lineStyleUnderConstructionBRT}),
      geoJsonLineTransBrasil         = L.geoJson(LINE_TRANSBRASIL_GEOJSON_DATA,           {onEachFeature: linePopupFn, style: lineStyleUnderConstructionBRT}),
      geoJsonLineMetroRioLinha1      = L.geoJson(LINE_METRORIO_LINHA1,                    {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineMetroRioLinha2      = L.geoJson(LINE_METRORIO_LINHA2,                    {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaSantaCruz   = L.geoJson(LINE_SUPERVIA_SCZ,                       {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaSaracuruna  = L.geoJson(LINE_SUPERVIA_SRC,                       {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaJaperi      = L.geoJson(LINE_SUPERVIA_JPI,                       {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaGuapimirim  = L.geoJson(LINE_SUPERVIA_GPI,                       {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineSuperViaBelfordRoxo = L.geoJson(LINE_SUPERVIA_BRX,                       {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonLineVltCarioca          = L.geoJson(LINE_VLT_CARIOCA,                        {onEachFeature: linePopupFn, style: lineStyleOutrosModosEstruturantes}),
      geoJsonStationTransOeste       = L.geoJson(STATIONS_TRANSOESTE),
      geoJsonStationTransCarioca     = L.geoJson(STATIONS_TRANSCARIOCA),
      geoJsonStationTransOlimpica    = L.geoJson(STATIONS_TRANSOLIMPICA),
      geoJsonStationTransBrasil      = L.geoJson(STATIONS_TRANSBRASIL);

  // defining layers
  var layerTransOeste    = L.layerGroup([geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOeste]),
      layerTransCarioca  = L.layerGroup([geoJsonLineTransCarioca, geoJsonStationTransCarioca]),
      layerTransOlimpica = L.layerGroup([geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpica]),
      layerTransBrasil   = L.layerGroup([geoJsonLineTransBrasil, geoJsonStationTransBrasil]),
      layerOutrosModos   = L.layerGroup([geoJsonLineMetroRioLinha1, geoJsonLineMetroRioLinha2, geoJsonLineSuperViaSantaCruz, geoJsonLineSuperViaSaracuruna, geoJsonLineSuperViaJaperi, geoJsonLineSuperViaJaperi, geoJsonLineSuperViaBelfordRoxo, geoJsonLineVltCarioca]);

  var overlayMaps = {
    "BRT TransOeste":    layerTransOeste,
    "BRT TransCarioca":  layerTransCarioca,
    "BRT TransOlímpica": layerTransOlimpica,
    "BRT TransBrasil":   layerTransBrasil,
    "Outros Modos Estruturantes": layerOutrosModos
  };

  // adding layer control to map
  L.control.layers(null, overlayMaps).addTo(map);

  // initiating pre-opened layers
  layerTransOeste.addTo(map);
  layerTransCarioca.addTo(map);
  layerTransOlimpica.addTo(map);
  layerTransBrasil.addTo(map);
  layerOutrosModos.addTo(map);
});