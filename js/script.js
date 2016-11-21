require([
  "basemap/brt/transoeste",
  "basemap/brt/transcarioca",
  "basemap/brt/transolimpica",
  "basemap/brt/transbrasil",
  "basemap/bairros",
  "estudo",
  "mapstyles",
  "popupfn",
  "vote"
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
      attribution: '&copy; 2016 ITDP Brasil | Mapa base: <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> | <a href="http://itdpbrasil.org.br/mapa-interativo-ficha-tecnica/" target="_blank">Ficha técnica</a>'
  }).addTo(map);

  selectedMapaDeCalorRef = 'DES';

  // defining popups
  var lineStatusText = function(status){
    if(status == 'Open' || status == 'Operational')
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
      var popupText = '<b>' + feature.properties.Name + '</b>';

      if(feature.properties.Trecho)
        popupText += '<br><strong>Trecho:</strong> ' + feature.properties.Trecho;

      if(feature.properties.Extensao)
        popupText += '<br><strong>Extensão:</strong> ' + feature.properties.Extensao + 'km';

      if(feature.properties.Estacoes)
        popupText += '<br><strong>Estações:</strong> ' + feature.properties.Estacoes;

      if(feature.properties.Terminais)
        popupText += '<br><strong>Terminais:</strong> ' + feature.properties.Terminais;

      if(feature.properties.Status)
        popupText += '<br><strong>Status:</strong> ' + lineStatusText(feature.properties.Status);

      var popup = L.popup({
        className: feature.properties.Corredor
      }).setContent(popupText);
      layer.bindPopup(popup);
    }
  };

  var stationPopupFn = function(feature, layer){
    // "properties":{"Name":"Terminal Alvorada","Corredor":"TransCarioca","Type":"Expresso\/Parador","Status":"Operational"}
    if(feature.properties && feature.properties.Name){
      var popupText = '',
          iconClass = 'popup-icon-corridor ';

      if(feature.properties.Corredor == 'TransOeste')
        iconClass += 'popup-icon-corridor-TW';
      else if(feature.properties.Corredor == 'TransCarioca')
        iconClass += 'popup-icon-corridor-TC';
      else if(feature.properties.Corredor == 'TransOlímpica')
        iconClass += 'popup-icon-corridor-TO';
      else if(feature.properties.Corredor == 'TransBrasil')
        iconClass += 'popup-icon-corridor-TB';

      popupText += '<div class="' + iconClass + '"></div>';

      popupText += '<b>Estação ' + feature.properties.Name + '</b>';

      if(feature.properties.Type){
        popupText += '<br><strong>Serviço';
        if(feature.properties.Type !== 'Parador'){ // if is not only "Parador", add plural
          popupText += 's';
        }
        popupText += ':</strong> ' + feature.properties.Type;
      }

      if(feature.properties.Status){
        popupText += '<br><strong>Status:</strong> ' + stationStatusText(feature.properties.Status);
      }

      var popup = L.popup({
        className: 'station ' + feature.properties.Corredor
      }).setContent(popupText);

      layer.bindPopup(popup);
    }
  };

  var bairrosPopupFn = function(feature, layer){
    // "properties": { "BAIRRO_BDA": "Santa Teresa", "AREA": "Centro", "AREA_KM2": 5.1571268999999997, "POPULACAO": 40926, "EMPRG": 2297, "DENS_POP_K": 7.9358140285400003, "RAZAO_EMPR": 0.0561256902702 }
    var popupText = '<div class="popup-icon popup-icon-bairros"></div>'
                  + '<b>' + feature.properties.BAIRRO_BDA + '</b><br>'
                  + '<strong>Área:</strong> ' + feature.properties.AREA_KM2.toFixed(2).toString().replace('.',',') + ' km²<br>'
                  + '<strong>População:</strong> ' + feature.properties.POPULACAO.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' hab.<br>'
                  + '<strong>Densidade populacional:</strong> ' + feature.properties.DENS_POP_K.toFixed(3).toString().replace('.',',') + ' hab./km²<br>'
                  + '<strong>Empregos formais:</strong> ' + feature.properties.EMPRG.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '<br>'
                  + '<strong>Empregos formais/habitante:</strong> ' + feature.properties.RAZAO_EMPR.toFixed(3).toString().replace('.',',');

    var popup = L.popup({
        className: 'bairro'
      }).setContent(popupText);

    layer.bindPopup(popup);
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
      _fcc.insertBefore(_checkboxes, _fcc.firstChild.nextSibling);

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
    if(_zoomLevel < 13){ // LZ
      if(currentZoomLevel == 'HZ'){
        zoomfns.deactivateHZ();
        zoomfns.activateLZ();
      } else if(currentZoomLevel == 'SHZ'){
        zoomfns.deactivateSHZ();
        zoomfns.activateHZ();
      }
      currentZoomLevel = 'LZ';
    }
    if(_zoomLevel >= 13 && _zoomLevel < 16){ // HZ
      if(currentZoomLevel == 'LZ'){
        zoomfns.deactivateLZ();
        zoomfns.activateHZ();
      } else if(currentZoomLevel == 'SHZ'){
        zoomfns.deactivateSHZ();
        zoomfns.activateHZ();
      }
      currentZoomLevel = 'HZ';
    }else if(_zoomLevel >= 16){ // SHZ
      if(currentZoomLevel == 'LZ'){
        zoomfns.deactivateLZ();
        zoomfns.activateHZ();
      } else if(currentZoomLevel == 'HZ'){
        zoomfns.deactivateHZ();
        zoomfns.activateSHZ();
      }
      currentZoomLevel = 'SHZ';
    }
  });

  // initializing study object
  var study = {},
      brts = ['TW', 'TC', 'TO', 'TB'],
      categories = ['SV', 'OI', 'TD', 'BP'],
      levels = ['LO', 'MD', 'HI'];

  var initializeStudy = function(study){
    for(b in brts){
      study[brts[b]] = {};
        for(c in categories){
          study[brts[b]][categories[c]] = {};
          for(l in levels){
            study[brts[b]][categories[c]][levels[l]] = {};
            study[brts[b]][categories[c]][levels[l]].status = true;
            // L.geoJson(TW_SV_CR, {...})
            study[brts[b]][categories[c]][levels[l]].geojson = L.geoJson(window[brts[b] + '_' + categories[c] + '_' + levels[l]], {
              onEachFeature: function(feature, layer){
                var popupText = '',
                    level = '';

                popupText = '<div class="popup-icon popup-icon-' + categories[c] + '"';

                if(feature.properties.aux_area !== undefined){
                  popupText += ' data-aux-area="' + brts[b] + '_' + categories[c] + '_' + levels[l] + '[' + feature.properties.index + ']"'
                }

                popupText += '></div>' +
                            '<b>' + feature.properties.Name + '</b>';
                if(feature.properties.Category){
                  popupText += '<br><strong>Categoria:</strong> ' + feature.properties.Category;
                }
                if(feature.properties.Place){
                  popupText += '<br><strong>Localização:</strong> ' + feature.properties.Place;
                }
                if(feature.properties.Description){
                  popupText += '<br><strong>Descrição:</strong> ' + feature.properties.Description;
                }
                if(feature.properties.Recommendation){
                  popupText += '<br><strong>Recomendação:</strong> ' + feature.properties.Recommendation;
                }
                if(feature.properties.VoteCode){
                  popupText += '<br><br><strong>Qual a prioridade para você?</strong> <a href="javascript:vote(\'' + feature.properties.VoteCode + '\', 1)"><span class="glyphicon glyphicon-star star-1"></span></a><a href="javascript:vote(\'' + feature.properties.VoteCode + '\', 2)"><span class="glyphicon glyphicon-star star-2"></span></a><a href="javascript:vote(\'' + feature.properties.VoteCode + '\', 3)"><span class="glyphicon glyphicon-star star-3"></span></a><a href="javascript:vote(\'' + feature.properties.VoteCode + '\', 4)"><span class="glyphicon glyphicon-star star-4"></span></a><a href="javascript:vote(\'' + feature.properties.VoteCode + '\', 5)"><span class="glyphicon glyphicon-star star-5"></span></a><span id="' + feature.properties.VoteCode + '_votemsg" style="display:none;">Voto computado com sucesso.</span><br><p style="position: relative; top: -10px; bottom: -40px; font-size: 90%; font-style: italic;">O ITDP Brasil quer saber a sua opinião!<br> Você pode votar sobre a prioridade deste ponto em uma escala de 1 (baixa prioridade, à esquerda) a 5 (alta prioridade, à direita).</p>';
                }
                if(feature.properties.Photo){
                  popupText += '<img src="' + feature.properties.Photo.Filename + '" class="foto-estudo">';
                  popupText += '<p style="text-align:right; position: relative; top: -10px; font-size: 8px;">Créditos da foto: ';
                  if(feature.properties.Photo.CreditsURL){
                    popupText += '<a target="_blank" href="' + feature.properties.Photo.CreditsURL + '">' + feature.properties.Photo.Credits + '</a>';
                  } else {
                    popupText += feature.properties.Photo.Credits;
                  }
                  popupText += '</p>';
                }
                if(feature.properties.Level){
                  level = feature.properties.Level;
                }
                layer.bindPopup(L.popup({className: brts[b]}).setContent(popupText));
              },
              pointToLayer: function(feature, latlng){
                var iconSize =    { LO: [24, 58], MD: [32, 77], HI: [48, 115] },
                    iconAnchor =  { LO: [12, 58], MD: [16, 77], HI: [24, 115] },
                    popupAnchor = { LO: [0, -47], MD: [0, -62], HI: [0,  -91] };
                var pointIcon = L.icon({
                  iconSize:    iconSize[levels[l]],
                  iconAnchor:  iconAnchor[levels[l]],
                  popupAnchor: popupAnchor[levels[l]],
                  iconUrl: 'images/pins/' + brts[b] + '_' + categories[c] + '_' + levels[l] + '.png'
                });
                return L.marker(latlng, {icon: pointIcon});
              }
            }).addTo(map);
          }
        }
    }
  };
  initializeStudy(study);

  // drawing auxiliary areas
  aux_polygon = null;
  map.on('popupopen', function(e){
    var aux_area = e.target._popup._contentNode.childNodes[0].attributes[1]; // AB_CD_EF[n]
    if(aux_area !== undefined){
      var auxNode = eval(aux_area.value);
      var auxPointsArray = auxNode.properties.aux_area;

      // inverting lat/lon (on GeoJSON they're inverted in relation of what Leaflet expects)
      if(auxNode.properties.aux_area_workaround === undefined){
        for(var i=0, l=auxPointsArray.length; i<l; i++){
          var t = auxPointsArray[i][0];
          auxPointsArray[i][0] = auxPointsArray[i][1];
          auxPointsArray[i][1] = t;
        }
        auxNode.properties.aux_area_workaround = true;
      }

      aux_polygon = L.polygon(auxPointsArray, { color: "#00A851" }).addTo(map);
    }
    else {
      if(map.hasLayer(aux_polygon)){
        map.removeLayer(aux_polygon);
        aux_polygon = null;
      }
    }
  });
  map.on('popupclose', function(e){
    if(map.hasLayer(aux_polygon)){
      map.removeLayer(aux_polygon);
    }
  });

  // Bairros misclicking correction
  lastPopupClickBairros = false;
  map.on('popupopen', function(e){
    var popupClassList = e.popup._container.classList;
    for(var i=0, l=popupClassList.length; i<l; i++){
      if(popupClassList[i] == 'bairro'){
        lastPopupClickBairros = true;
      }
    }
  });
  map.on('popupclose', function(e){
    var popupClassList = e.popup._container.classList;
    for(var i=0, l=popupClassList.length; i<l; i++){
      if(popupClassList[i] == 'bairro'){
        if(lastPopupClickBairros){
          window.setTimeout(function(){
            // close popup if bairro
            var p = document.getElementsByClassName('leaflet-popup-close-button')[0]
            if(p !== undefined){
              var newPopupClassList = p.parentElement.classList;
              for(var i=0, l=newPopupClassList.length; i<l; i++){
                if(newPopupClassList[i] == 'bairro'){
                  p.click();
                }
              }
            }
            lastPopupClickBairros = false;
          }, 0);
        }
      }
    }
  });

  // defining base layers
  var arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOesteLZ],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCariocaLZ],
      arrayLayerTransOlimpica = [geoJsonLineTransOlimpica, geoJsonLineTO_TC, geoJsonStationTransOlimpicaLZ],
      arrayLayerTransBrasil   = [geoJsonLineTransBrasil, geoJsonStationTransBrasilLZ],
      arrayLayerBairros       = [geoJsonBairros];

  fnHandleLayerEstudoAddRemove = function(){
    for(b in brts){
      for(c in categories){
        for(l in levels){
          // checks if everything is checked and I didn't add, do add.
          if(
            document.getElementById(brts[b]).checked &&
            document.getElementById(categories[c]).checked &&
            document.getElementById(levels[l]).checked &&
            !study[brts[b]][categories[c]][levels[l]].status
          ){
            study[brts[b]][categories[c]][levels[l]].geojson.addTo(map);
            study[brts[b]][categories[c]][levels[l]].status = true;
          }

          // if something is not checked and I already added, do remove.
          if(
            (
              !document.getElementById(brts[b]).checked ||
              !document.getElementById(categories[c]).checked ||
              !document.getElementById(levels[l]).checked
            ) && study[brts[b]][categories[c]][levels[l]].status
          ){
            map.removeLayer(study[brts[b]][categories[c]][levels[l]].geojson);
            study[brts[b]][categories[c]][levels[l]].status = false;
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
    _handleLayerEstudoAddRemove: fnHandleLayerEstudoAddRemove,

    onAdd: function(map){
      var container = L.DomUtil.create('div', 'my-custom-control');
      this.form = L.DomUtil.create('form', 'form-custom-control', container);

      this.containerLogo = L.DomUtil.create('div', 'logo', this.form);
      var logoImg = L.DomUtil.create('img', '', this.containerLogo);
      logoImg.src = 'images/logos/itdp.png';
      L.DomUtil.create('hr', '', this.containerLogo);

      this.containerBRT = L.DomUtil.create('div', 'brtcheckboxes', this.form);
      this._createTitle('Sistemas BRT', this.containerBRT);
      this._createCheckboxInput('TransOeste',    'TW', true, this.containerBRT, arrayLayerTransOeste,    ['icon-TW']);
      this._createCheckboxInput('TransCarioca',  'TC', true, this.containerBRT, arrayLayerTransCarioca,  ['icon-TC']);
      this._createCheckboxInput('TransOlímpica', 'TO', true, this.containerBRT, arrayLayerTransOlimpica, ['icon-TO']);
      this._createCheckboxInput('TransBrasil',   'TB', true, this.containerBRT, arrayLayerTransBrasil,   ['icon-TB']);

      this.containerCategorias = L.DomUtil.create('div', 'categoriascheckboxes', this.form);
      this._createTitle('Categorias', this.containerCategorias);
      this._createCheckboxInput('Segurança viária',            'SV', true, this.containerCategorias);
      this._createCheckboxInput('Rede de Transporte Público', 'OI', true, this.containerCategorias);
      this._createCheckboxInput('Desenvolvimento Urbano (DOTS)',   'TD', true, this.containerCategorias);
      this._createCheckboxInput('Bicicleta e pedestre',        'BP', true, this.containerCategorias);

      this.containerNiveisDeAtencao = L.DomUtil.create('div', 'niveisdeatencaocheckboxes', this.form);
      this._createTitle('Níveis de Atenção', this.containerNiveisDeAtencao);
      this._createCheckboxInput('Alto',  'HI', true, this.containerNiveisDeAtencao);
      this._createCheckboxInput('Médio', 'MD', true, this.containerNiveisDeAtencao);
      this._createCheckboxInput('Baixo', 'LO', true, this.containerNiveisDeAtencao);

      // Extras
      L.DomUtil.create('hr', '', this.form);
      this.containerExtras = L.DomUtil.create('div', 'extras', this.form);

      var checkboxExtras = L.DomUtil.create('input', '', this.containerExtras);
      checkboxExtras.id = 'extras';
      checkboxExtras.type = 'checkbox';
      var labelCheckboxExtras = L.DomUtil.create('label', 'labelExtras', this.containerExtras);
      labelCheckboxExtras.htmlFor = 'extras';
      labelCheckboxExtras.innerHTML = 'Extras';

      var divExtras = L.DomUtil.create('div', 'mapasDeCalorInputs', this.containerExtras);
      divExtras.style.display = 'none';

      var createRadioButton = function(id, groupName, checked, container){
        var radiobutton = L.DomUtil.create('input', '', container);
        radiobutton.id = id;
        radiobutton.type = 'radio';
        radiobutton.name = groupName;
        radiobutton.checked = checked;
        return radiobutton;
      };
      var createLabelRadioButton = function(htmlFor, labelText, container){
        var label = L.DomUtil.create('label', '', container);
        label.htmlFor = htmlFor;
        label.innerHTML = labelText;
      };

      var containerDensidade = L.DomUtil.create('div', '', divExtras);
      var containerEmpregos  = L.DomUtil.create('div', '', divExtras);
      var containerSatelite  = L.DomUtil.create('div', '', divExtras);
      var radiobuttonDensidade = createRadioButton('DEN', 'mapaCalor', true,  containerDensidade);
      var radiobuttonEmpregos  = createRadioButton('EMP', 'mapaCalor', false, containerEmpregos);
      var radiobuttonSatelite  = createRadioButton('SAT', 'mapaCalor', false, containerSatelite);
      var labelRadiobuttonDensidade = createLabelRadioButton('DEN', 'Densidade populacional', containerDensidade);
      var labelRadiobuttonEmpregos  = createLabelRadioButton('EMP', 'Empregos formais/habitante', containerEmpregos);
      var labelRadiobuttonSatelite  = createLabelRadioButton('SAT', 'Imagens de satélite', containerSatelite);

      var handleBairrosChange = function(){
        geoJsonBairros.eachLayer(function(layer){
          layer.setStyle(pathStyle.Bairros(layer));
        });
      }
      L.DomEvent.disableClickPropagation(checkboxExtras).on(checkboxExtras, 'change', function(e){
        if(document.getElementById('extras').checked){
          if(document.getElementById('EMP').checked){
            selectedMapaDeCalorRef = 'EMP';
          }else if(document.getElementById('DEN').checked){
            selectedMapaDeCalorRef = 'DEN';
          }else if(document.getElementById('SAT').checked){
            selectedMapaDeCalorRef = 'DES';
            if(isSatelliteAlreadyLoaded){
              Esri_WorldImagery.bringToFront();
            }
          }
          handleBairrosChange();
          document.getElementsByClassName('mapasDeCalorInputs')[0].style.display = 'block';
        } else {
          if(isSatelliteAlreadyLoaded){
            Esri_WorldImagery.bringToBack();
          }
          selectedMapaDeCalorRef = 'DES';
          handleBairrosChange();
          document.getElementsByClassName('mapasDeCalorInputs')[0].style.display = 'none';
        }
      });
      var handleRadioButtonChange = function(e){
        var rbsrc;
        if(e.srcElement !== undefined){
          rbsrc = e.srcElement.id;
        }else{
          rbsrc = e.target.id;
        }
        if(rbsrc == 'SAT'){
          if(isSatelliteAlreadyLoaded){
            Esri_WorldImagery.bringToFront();
          }else{
            Esri_WorldImagery.addTo(map);
            isSatelliteAlreadyLoaded = true;
          }
          selectedMapaDeCalorRef = 'DES';
          handleBairrosChange();
        }else{
          if(isSatelliteAlreadyLoaded){
            Esri_WorldImagery.bringToBack();
          }
          selectedMapaDeCalorRef = rbsrc;
          handleBairrosChange();
        }
      };
      L.DomEvent.disableClickPropagation(radiobuttonDensidade).on(radiobuttonDensidade, 'change', handleRadioButtonChange);
      L.DomEvent.disableClickPropagation(radiobuttonEmpregos).on(radiobuttonEmpregos, 'change', handleRadioButtonChange);
      L.DomEvent.disableClickPropagation(radiobuttonSatelite).on(radiobuttonSatelite, 'change', handleRadioButtonChange);

      return container;
    }
  });
  map.addControl(new MyControl());

  // scale
  L.control.scale().addTo(map);

  // north
  var north = L.control({position: "bottomleft"});
  north.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend");
      div.innerHTML = '<img src="images/icons/norte.png" style="width:50px">';
      return div;
  }
  north.addTo(map);

  // satellite imagery
  var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    //attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  var isSatelliteAlreadyLoaded = false;

  // removing loading
  document.getElementById('loading-container').className = 'loading-complete';
  setTimeout(function(){
    document.getElementById('loading-container').className = 'loading-complete hidden';
  }, 4000);
});
