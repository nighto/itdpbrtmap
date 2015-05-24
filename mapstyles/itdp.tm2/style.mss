// Languages: name (local), name_en, name_fr, name_es, name_de
@name: '[name]';

// Fonts //
@sans: 'Source Sans Pro Regular';
@sans_italic: 'Source Sans Pro Italic';
@sans_bold: 'Source Sans Pro Semibold';

// Common Colors //
@land: #fff;
@water: #ddeffb;

Map { background-color: @land; }

// Political boundaries //

#admin[admin_level>=2][maritime=1] {
  line-join: round;
  line-color: #bbe;
  line-width: 1.4;
  [zoom>=6] { line-width: 2; }
  [zoom>=8] { line-width: 4; }
  [disputed=1] { line-dasharray: 4,4; }
}

// Places //

#country_label[zoom>=3] {
  text-name: @name;
  text-face-name: @sans_bold;
  text-fill: #66a;
  text-size: 12;
  [zoom>=3][scalerank=1],
  [zoom>=4][scalerank=2],
  [zoom>=5][scalerank=3],
  [zoom>=6][scalerank>3] {
    text-size: 14;
  }
  [zoom>=4][scalerank=1],
  [zoom>=5][scalerank=2],
  [zoom>=6][scalerank=3],
  [zoom>=7][scalerank>3] {
    text-size: 16;
  }
}

#country_label_line { line-color: fadeout(#66a,75%); }

#place_label[localrank<=2] {
  [type='city'][zoom<=15] {
    text-name: @name;
    text-face-name: @sans_bold;
    text-fill: #444;
    text-size: 16;
    [zoom>=10] { text-size: 18; }
    [zoom>=12] { text-size: 24; }
  }
  [type='town'][zoom<=17] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #333;
    text-size: 14;
    [zoom>=10] { text-size: 16; }
    [zoom>=12] { text-size: 20; }
  }
  [type='village'] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #444;
    text-size: 12;
    [zoom>=12] { text-size: 14; }
    [zoom>=14] { text-size: 18; }
  }
  [type='hamlet'],
  [type='suburb'],
  [type='neighbourhood'] {
    text-name: @name;
    text-face-name: @sans;
    text-fill: #666;
    text-size: 12;
    [zoom>=14] { text-size: 14; }
    [zoom>=16] { text-size: 16; }
  }
}

// Water Features //

#water {
  polygon-fill: @water;
  polygon-gamma: 0.6;
}

#water_label {
  [zoom<=13],  // automatic area filtering @ low zooms
  [zoom>=14][area>500000],
  [zoom>=16][area>10000],
  [zoom>=17] {
    text-name: @name;
    text-face-name: @sans_italic;
    text-fill: darken(@water, 30%);
    text-size: 13;
    text-wrap-width: 100;
    text-wrap-before: true;
  }
}

#waterway {
  [type='river'],
  [type='canal'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=12] { line-width: 1; }
    [zoom>=14] { line-width: 2; }
    [zoom>=16] { line-width: 3; }
  }
  [type='stream'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=14] { line-width: 1; }
    [zoom>=16] { line-width: 2; }
    [zoom>=18] { line-width: 3; }
  }
}

// Roads //
#tunnel { opacity: 0.5; }
#road,
#tunnel,
#bridge {
  ['mapnik::geometry_type'=2] {
    line-color: #afa9a6;
    line-width: 0;
    [class='motorway'],
    [class='motorway_link']{
      [zoom>=0] { line-width: 0.5; }
      [zoom>=10] { line-width: 1; }
      [zoom>=12] { line-width: 2; }
      [zoom>=14] { line-width: 3; }
      [zoom>=16] { line-width: 5; }
    }
    [class='main']{
      [zoom>=13] { line-width: 1; }
      [zoom>=14] { line-width: 2; }
      [zoom>=15] { line-width: 3; }
      [zoom>=16] { line-width: 5; }
    }
    [class='street'],
    [class='street_limited'] {
      [zoom>=14] { line-width: .5; }
      [zoom>=15] { line-width: 1; }
      [zoom>=16] { line-width: 2; }
    }
    [class='street_limited'] { line-dasharray: 4,1; }
  }
}

// Parks
#landuse[class='park'],
#landuse[class='forest'],
#boundary[class='protected_area']{
  polygon-fill: #96d0a0;
}

// Railway
#Lines_Supervia,#Lines_Metro,#Lines_VLT{
  ::line {
    [zoom>=0]{
      line-width: 1;
    }
    [zoom>=14]{
      line-width: 2;
    }
  }
  ::hatch {
    line-dasharray: 1, 24;
    [zoom>=0]{
      line-width: 4;
    }
    [zoom>=14]{
      line-width: 8;
    }
  }
}
#Lines_Supervia{
  ::line, ::hatch {
    line-color: #9A8D28;
  }
}
#Lines_Metro{
  ::line, ::hatch {
    line-color: #9490BC;
  }
}
#Lines_VLT{
  ::line, ::hatch {
    line-color: #FFE090;
  }
}

// Bairros
#RJ_TCM_Limites_Administrativos_Bairros_com_dados{
  ::line {
    line-width: 1;
    line-color: #C8C8C8;
    line-dasharray: 5,5;
    [zoom>=14]{
      line-width: 2;
      line-dasharray: 5,10;
    }
  }
}