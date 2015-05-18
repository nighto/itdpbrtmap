// public object to hold all path style definitions
pathStyle = {};
pathStyle.BRT = {},
pathStyle.OME = {};

pathStyle.BRT.TW = {"color": "#5AC9E6","weight": 5,"opacity": .75},
pathStyle.BRT.TC = {"color": "#FFCB5D","weight": 5,"opacity": .75},
pathStyle.BRT.TO = {"color": "#BDCC2A","weight": 5,"opacity": .75},
pathStyle.BRT.TB = {"color": "#EF4738","weight": 5,"opacity": .75},
pathStyle.OME.SuperVia   = {"color": "#9A8D28","weight": 2,"opacity": .9},
pathStyle.OME.MetroRio   = {"color": "#9490BC","weight": 2,"opacity": .9},
pathStyle.OME.VLTCarioca = {"color": "#FFE090","weight": 2,"opacity": .9};

pathStyle.Bairros = function(layer){
  // estilo padrão
  if(selectedMapaDeCalorRef == 'DES'){
    return {
      "color": "#404040",
      "weight": .6,
      "fillOpacity": .05,
      "dashArray": "5, 5"
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
    hue = ( ( Math.log(_value + epsilon) - Math.log(epsilon) ) / ( Math.log(maxLimit + epsilon) - Math.log(epsilon) ) ) * 120;
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
pathStyle.fnMarkerOptionsBrtStation = function(feature, latlng){
  return L.circleMarker(latlng, {
    radius: 2.5,
    fillColor: '#ffffff',
    color: '#ff7800',
    weight: 1,
    opacity: 1,
    fillOpacity: 1
  });
};