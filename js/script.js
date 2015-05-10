require([
  "basemap/brt/transoeste",
  "basemap/brt/transcarioca",
  "basemap/brt/transolimpica",
  "basemap/brt/transbrasil",
  "basemap/ome/metrorio",
  "basemap/ome/supervia",
  "basemap/ome/vltcarioca",
  "basemap/bairros", "dummy"
], function(util){

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
      pathStyleOutrosModosEstruturantes = {"color": "#000000","weight": 3,"opacity": 1};

  var selectedMapaDeCalorRef = 'DES';

  var pathStyleBairros = function(layer){
    // estilo padrão
    if(selectedMapaDeCalorRef == 'DES'){
      return {
        "color": "#404040",
        "weight": 2,
        "fillOpacity": .05
      }
    }

    var _prop, _value, minLimit, maxLimit, hue = 0;
    switch(selectedMapaDeCalorRef){
      case 'DEN':
        _prop = 'DENS_POP_K';
        minLimit = 0;
        maxLimit = 40;
        break;
      case 'EMP':
        _prop = 'RAZAO_EMPR';
        minLimit = 0.001;
        maxLimit = 15.238;
        break;
    }
    _value = layer.feature.properties[_prop];

    // normalizing value
    if(_value > maxLimit){
      _value = maxLimit;
    } else if(_value < minLimit){
      _value = minLimit;
    }

    Math.log10 = Math.log10 || function(x) {
      return Math.log(x) / Math.LN10;
    };

    // calculates color (hsl(hue, 100%, 40%);), hue is defined between 0 (red) and 120 (green)
    if(selectedMapaDeCalorRef == 'DEN'){
      //hue = ( (_value - minLimit) / maxLimit ) * 120;
      hue = Math.log( ( (_value - minLimit) / maxLimit ) * (Math.E - 1) + 1) * 120;
    }
    else if(selectedMapaDeCalorRef == 'EMP'){
      var epsilon = 0.008;
      hue = ( ( Math.log(_value + epsilon) - Math.log(epsilon) ) / ( Math.log(15.238 + epsilon) - Math.log(epsilon) ) ) * 120;
    }

    // inverting hue: I'd like my green to be 0, and red 120
    hue *= -1; hue += 120;

    return {
      "color": "#404040",
      "fillColor": 'hsl(' + hue + ', 100%, 40%)',
      "weight": 2,
      "fillOpacity": .4
    }
  };

  // defining circle icons
  var fnMarkerOptionsBrtStation = function(feature, latlng){
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: '#649bd2',
      color: '#649bd2',
      weight: 1,
      opacity: 1,
      fillOpacity: .6
    });
  };

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

  var estudoPopupFn = function(feature, layer){
    // "properties": { "Name": "Uma coisa muito crítica", "Description": "Muito crítica mesmo" }
    var popupText = '<b>' + feature.properties.Name + '</b><br>' + feature.properties.Description;
    layer.bindPopup(popupText);
  };

  // defining geojson's objects
  var geoJsonBairros                 = L.geoJson(BAIRROS, {onEachFeature: bairrosPopupFn, style: pathStyleBairros}).addTo(map);

  var geoJsonLineTransOeste          = L.geoJson(LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA, {onEachFeature: linePopupFn, style: pathStyleConstructedBRT}).addTo(map);
  var geoJsonLineTransOesteLote0     = L.geoJson(LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA,     {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}).addTo(map);
  var geoJsonLineTransOestePlanejada = L.geoJson(LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA,  {onEachFeature: linePopupFn, style: pathStylePlannedBRT}).addTo(map);
  var geoJsonLineTransCarioca        = L.geoJson(LINE_TRANSCARIOCA_GEOJSON_DATA,          {onEachFeature: linePopupFn, style: pathStyleConstructedBRT}).addTo(map);
  var geoJsonLineTransOlimpica       = L.geoJson(LINE_TRANSOLIMPICA_GEOJSON_DATA,         {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}).addTo(map);
  var geoJsonLineTO_TC               = L.geoJson(LINE_TO_TC_GEOJSON_DATA,                 {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}).addTo(map);
  var geoJsonLineTransBrasil         = L.geoJson(LINE_TRANSBRASIL_GEOJSON_DATA,           {onEachFeature: linePopupFn, style: pathStyleUnderConstructionBRT}).addTo(map);
  var geoJsonLineMetroRioLinha1      = L.geoJson(LINE_METRORIO_LINHA1,                    {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineMetroRioLinha2      = L.geoJson(LINE_METRORIO_LINHA2,                    {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineSuperViaSantaCruz   = L.geoJson(LINE_SUPERVIA_SCZ,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineSuperViaSaracuruna  = L.geoJson(LINE_SUPERVIA_SRC,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineSuperViaJaperi      = L.geoJson(LINE_SUPERVIA_JPI,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineSuperViaGuapimirim  = L.geoJson(LINE_SUPERVIA_GPI,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineSuperViaBelfordRoxo = L.geoJson(LINE_SUPERVIA_BRX,                       {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);
  var geoJsonLineVltCarioca          = L.geoJson(LINE_VLT_CARIOCA,                        {onEachFeature: linePopupFn, style: pathStyleOutrosModosEstruturantes}).addTo(map);

  var geoJsonStationTransOeste       = L.geoJson(STATIONS_TRANSOESTE,    {onEachFeature: stationPopupFn, pointToLayer: fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransCarioca     = L.geoJson(STATIONS_TRANSCARIOCA,  {onEachFeature: stationPopupFn, pointToLayer: fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransOlimpica    = L.geoJson(STATIONS_TRANSOLIMPICA, {onEachFeature: stationPopupFn, pointToLayer: fnMarkerOptionsBrtStation}).addTo(map);
  var geoJsonStationTransBrasil      = L.geoJson(STATIONS_TRANSBRASIL,   {onEachFeature: stationPopupFn, pointToLayer: fnMarkerOptionsBrtStation}).addTo(map);

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
  var arrayLayerTransOeste    = [geoJsonLineTransOeste, geoJsonLineTransOesteLote0, geoJsonLineTransOestePlanejada, geoJsonStationTransOeste],
      arrayLayerTransCarioca  = [geoJsonLineTransCarioca, geoJsonStationTransCarioca],
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

    _createTitle: function(titleText, container){
      // <h2>Sistemas BRT</h2>
      this.title = L.DomUtil.create('h2', '', container);
      this.title.innerHTML = titleText;
    },

    _createCheckboxInput: function(labelText, htmlId, checked, container, layerArray){
      // <div><input type="checkbox" id=""><label for=""></label></div>
      this.div = L.DomUtil.create('div', '', container);
      this.input = L.DomUtil.create('input', '', this.div);
      this.input.type = 'checkbox';
      this.input.id = htmlId;
      this.input.checked = checked;
      this.label = L.DomUtil.create('label', '', this.div);
      this.label.innerHTML = labelText;
      this.label.htmlFor = htmlId;

      // event
      var context = this;
      L.DomEvent
        .disableClickPropagation(this.input)
        .on(this.input, 'change', function(e){
          if(layerArray !== undefined){ // checkboxes das linhas
            // remove ou adiciona todos os layers
            for (l in layerArray){
              if(map.hasLayer(layerArray[l])){
                map.removeLayer(layerArray[l]);
              }else{
                map.addLayer(layerArray[l]);
              }
            }
          }
          if(e.srcElement.id == 'BDE'){ // checkbox dos bairros
            if(e.srcElement.checked){   // se está ligando
              document.getElementsByClassName('mapasDeCalorInputs')[0].style.display = 'block';
            } else {
              document.getElementsByClassName('mapasDeCalorInputs')[0].style.display = 'none';
            }
          }
          context._handleLayerEstudoAddRemove();
        }
      );
    },

    _createRadioInput: function(labelText, htmlId, groupName, selected, container, layerArray){
      //<div><input type="radio" name=""><label for=""></label></div>
      this.div = L.DomUtil.create('div', '', container);
      this.input = L.DomUtil.create('input',  '', this.div);
      this.input.type = 'radio';
      this.input.id = htmlId;
      this.input.name = groupName;
      this.input.checked = selected;
      this.label = L.DomUtil.create('label', '', this.div);
      this.label.innerHTML = labelText;
      this.label.htmlFor = htmlId;

      var context = this;
      L.DomEvent
        .disableClickPropagation(this.input)
        .on(this.input, 'change', function(e){
          selectedMapaDeCalorRef = e.srcElement.id;
          geoJsonBairros.eachLayer(function(layer){
            layer.setStyle(pathStyleBairros(layer));
          });
        }
      );
    },

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
      this._createCheckboxInput('TransOeste',    'TW', true, this.form, arrayLayerTransOeste);
      this._createCheckboxInput('TransCarioca',  'TC', true, this.form, arrayLayerTransCarioca);
      this._createCheckboxInput('TransOlímpica', 'TO', true, this.form, arrayLayerTransOlimpica);
      this._createCheckboxInput('TransBrasil',   'TB', true, this.form, arrayLayerTransBrasil);

      this._createTitle('Categorias', this.form);
      this._createCheckboxInput('Segurança Viária', 'SV', true, this.form);
      this._createCheckboxInput('Integração',       'IN', true, this.form);
      this._createCheckboxInput('Operação',         'OP', true, this.form);
      this._createCheckboxInput('TOD',              'TD', true, this.form);
      this._createCheckboxInput('Transporte Ativo', 'TA', true, this.form);

      this._createTitle('Níveis de Atenção', this.form);
      this._createCheckboxInput('Crítico',  'CR', true, this.form);
      this._createCheckboxInput('Atenção',  'AT', true, this.form);
      this._createCheckboxInput('Sugestão', 'SU', true, this.form);

      this._createTitle('Extras', this.form);
      this._createCheckboxInput('Outros Modos Estruturantes', 'OME', true, this.form, arrayLayerOutrosModos);
      this._createCheckboxInput('Bairros/Densidade/Empregos', 'BDE', true, this.form, arrayLayerBairros);

      this.divMapasDeCalor = L.DomUtil.create('div', 'mapasDeCalorInputs', this.form);

      this._createTitle('Mapas de Calor', this.divMapasDeCalor);
      this._createRadioInput('Desativado', 'DES', 'mapaCalor', true,  this.divMapasDeCalor, undefined);
      this._createRadioInput('Densidade' , 'DEN', 'mapaCalor', false, this.divMapasDeCalor, undefined);
      this._createRadioInput('Empregos',   'EMP', 'mapaCalor', false, this.divMapasDeCalor, undefined);

      return container;
    }
  });
  map.addControl(new MyControl());
});