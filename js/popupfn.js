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
      _iconsHTML += '<span class="' + arrayLinesIcons[i] + '">●</span> ';
    }
  }

  this.label.innerHTML = _iconsHTML + labelText;
  this.label.htmlFor = htmlId;
  this.label.className = 'label-' + htmlId;

  // event
  L.DomEvent
    .disableClickPropagation(this.input)
    .on(this.input, 'change', function(e){
      // if(layerArray !== undefined){ // checkboxes das linhas
      //   // remove ou adiciona todos os layers
      //   for (l in layerArray){
      //     if(map.hasLayer(layerArray[l])){
      //       map.removeLayer(layerArray[l]);
      //     }else{
      //       map.addLayer(layerArray[l]);
      //     }
      //   }
      // }
      fnHandleLayerEstudoAddRemove();
    }
  );
};

popupfn.createCheckboxInputExtras = function(labelText, htmlId, container){
  this.div = L.DomUtil.create('div', '', container);
  this.input = L.DomUtil.create('input', '', this.div);
  this.input.type = 'checkbox';
  this.input.id = htmlId;
  this.label = L.DomUtil.create('label', 'labelExtras', this.div);
  this.label.innerHTML = labelText;
  this.label.htmlFor = htmlId;
};