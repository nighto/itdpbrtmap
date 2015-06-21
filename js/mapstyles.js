// public object to hold all path style definitions
pathStyle = {};
pathStyle.BRT = {},
pathStyle.OME = {};

pathStyle.BRT.TW = {"color": "#5AC9E6","weight": 5,"opacity": .75},
pathStyle.BRT.TWplanejada = {"color": "#5AC9E6","weight": 5,"opacity": .4},
pathStyle.BRT.TC = {"color": "#F9A460","weight": 5,"opacity": .75},
pathStyle.BRT.TO = {"color": "#BDCC2A","weight": 5,"opacity": .75},
pathStyle.BRT.TB = {"color": "#EF4738","weight": 5,"opacity": .75};

pathStyle.Bairros = function(layer){
  // estilo padrão
  if(selectedMapaDeCalorRef == 'DES'){
    return {
      "weight": 0,
      "fillOpacity": 0,
    }
  }

  var _value,
      _fillColor,
      _color = "#404040",
      _weight = 2,
      _fillOpacity = .8;
  if(selectedMapaDeCalorRef == 'DEN'){
    _value = layer.feature.properties['DENS_POP_K'];
    if(_value < 5)
      _fillColor = "#FFE090"; // PMS 7403
    else if(_value < 10)
      _fillColor = "#FFCB5D"; // PMS 135
    else if(_value < 15)
      _fillColor = "#F9A460"; // PMS 7411
    else if(_value < 20)
      _fillColor = "#A1501C"; // PMS 470
    else
      _fillColor = "#6B2E20"; // PMS 478
  }
  if(selectedMapaDeCalorRef == 'EMP'){
    _value = layer.feature.properties['RAZAO_EMPR'];
    if(_value === 0 || Math.log(_value) <= -1.5) // 1 emprego por 32 habitantes
      _fillColor = "#E3E3E5";
    else if(Math.log(_value) <= -1.0) // 1 emprego por 10 habitantes
      _fillColor = "#B9B7CA";
    else if(Math.log(_value) <= -0.5) // 1 emprego por 3.2 habitantes
      _fillColor = "#9490BC";
    else if(Math.log(_value) <= 0) // 1 emprego por habitante
      _fillColor = "#534C9C";
    else // mais de 1 emprego por habitante
      _fillColor = "#271C92";
  }

  return {
    "color": _color,
    //"fillColor": 'hsl(' + hue + ', 100%, 40%)',
    "fillColor": _fillColor,
    "weight": _weight,
    "fillOpacity": _fillOpacity
  }
};

// defining circle icons
pathStyle.fnMarkerOptionsBrtStation = function(feature, latlng, zoomCode){
  // feature.properties.Corredor
  var _color, _fillColor, _fillOpacity = 1, _radius = 4, _weight = 2, _opacity = 1;
  switch(feature.properties.Corredor){
    case "TransOeste":
      _color = pathStyle.BRT.TW.color; break;
    case "TransCarioca":
      _color = pathStyle.BRT.TC.color; break;
    case "TransOlímpica":
      _color = pathStyle.BRT.TO.color; break;
    case "TransBrasil":
      _color = pathStyle.BRT.TB.color; break;
  }

  // station circle has the color of the line...
  _fillColor = _color;

  // except if it's a express station, in which case it's white
  if(feature.properties.Type == 'Expresso/Parador' || feature.properties.Type == 'Expresso\/Parador\/Semi-Direto'){
    _fillColor = '#ffffff';
  }

  // if it's still planned, make it a little transparent
  if(feature.properties.Status == 'Planned'){
    _opacity = .5;
    _fillOpacity = .5;
  }

  // bigger circles for bigger zoom levels
  if(zoomCode){
    if(zoomCode == 'HZ'){
      _radius = 8;
      _weight = 4;
    }
    if(zoomCode == 'SHZ'){
      _radius = 16;
      _weight = 8;
    }
  }

  return L.circleMarker(latlng, {
    radius: _radius,
    fillColor: _fillColor,
    color: _color,
    weight: _weight,
    opacity: _opacity,
    fillOpacity: _fillOpacity
  });
};

pathStyle.fnMarkerOptionsBrtStationHighZoom = function(feature, latlng){
  return pathStyle.fnMarkerOptionsBrtStation(feature, latlng, 'HZ');
};

pathStyle.fnMarkerOptionsBrtStationSuperHighZoom = function(feature, latlng){
  return pathStyle.fnMarkerOptionsBrtStation(feature, latlng, 'SHZ');
};