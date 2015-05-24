// public object to hold all path style definitions
pathStyle = {};
pathStyle.BRT = {},
pathStyle.OME = {};

pathStyle.BRT.TW = {"color": "#5AC9E6","weight": 5,"opacity": .75},
pathStyle.BRT.TC = {"color": "#FFCB5D","weight": 5,"opacity": .75},
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
      _fillOpacity = .6;
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
pathStyle.fnMarkerOptionsBrtStation = function(feature, latlng){
  // feature.properties.Corredor
  var _color, _fillColor, _fillOpacity = 1;
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

  _fillColor = _color;

  if(
    feature.properties.Type == 'Expresso/Parador' ||
    (feature.properties.Corredor == 'TransOlímpica' || feature.properties.Corredor == 'TransBrasil') // temporário enquanto não sei quem vai ser parador e quem vai ser expresso
  ){
    _fillColor = '#ffffff';
  }

  return L.circleMarker(latlng, {
    radius: 4,//2.5,
    fillColor: _fillColor,
    color: _color,
    weight: 2,
    opacity: 1,
    fillOpacity: _fillOpacity
  });
};