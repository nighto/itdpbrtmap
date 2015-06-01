popupfn = {};

popupfn.createTitle = function(titleText, container){
  // <h2>Sistemas BRT</h2>
  this.title = L.DomUtil.create('h2', '', container);
  this.title.innerHTML = titleText;
};

popupfn.createCheckboxInput = function(labelText, htmlId, checked, container, layerArray, arrayLinesIcons){
  // <div><input type="checkbox" id=""><label for=""></label></div>
  this.div = L.DomUtil.create('div', '', container);
  this.input = L.DomUtil.create('input', '', this.div);
  this.input.type = 'checkbox';
  this.input.id = htmlId;
  this.input.checked = checked;
  this.label = L.DomUtil.create('label', '', this.div);

  var _iconsHTML = '';

  if(arrayLinesIcons !== undefined){
    for(var i=0, l=arrayLinesIcons.length; i<l; i++){
      _iconsHTML += '<span class="icon ' + arrayLinesIcons[i] + '">●</span> ';
    }
  }

  this.label.innerHTML = _iconsHTML + labelText;
  this.label.htmlFor = htmlId;

  // event
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
      fnHandleLayerEstudoAddRemove();
    }
  );
};

popupfn.createRadioInput = function(labelText, htmlId, groupName, selected, container, layerArray){
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
        layer.setStyle(pathStyle.Bairros(layer));
      });
    }
  );
};