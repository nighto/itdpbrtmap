var COORDENADA_INICIAL = [-22.871658, -43.3371976], // Madureira
    ZOOM_INICIAL = 11;

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView(COORDENADA_INICIAL, ZOOM_INICIAL);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// add a marker in the given location, attach some popup content to it and open the popup
L.marker(COORDENADA_INICIAL).addTo(map)
    .bindPopup('Olá mundo!')
    .openPopup();