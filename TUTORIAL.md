# Tutorial

## Introdução

Este documento tem como objetivo descrever o código para permitir que sua edição seja feita por qualquer pessoa, sem muito treinamento em JavaScript.

Na primeira parte, iremos acompanhar uma descrição dos arquivos que compõem o projeto, explicando em linhas gerais que informações eles contém e como editá-las. Na segunda parte teremos o inverso: uma lista de possibilidades de edições a serem feitas e que arquivos devem ser editados para que se atinja esse objetivo.

## Descrevendo os arquivos

O arquivo [`js/script.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/script.js) é o principal arquivo do projeto. Nas linhas iniciais há a chamada do `require` que carrega os demais arquivos. Por esse motivo, os analisaremos primeiro.

### js/basemap/brt/*corredores*

A pasta [`js/basemap/brt`](https://github.com/nighto/itdpbrtmap/tree/gh-pages/js/basemap/brt) possui quatro arquivos, um para cada corredor. Basicamente cada arquivo desses se divide em duas partes: a parte inicial, e maior, define o traçado das linhas (definindo as coordenadas que formam as linhas), e a segunda parte define as estações. Analisemos, por exemplo, o arquivo [`js/basemap/brt/transoeste.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/basemap/brt/transoeste.js) (clique para abrir em outra janela e acompanhar junto).

#### Definição dos traçados dos corredores

Das linhas 1 até 1959 temos a definição das linhas em si, sendo definidos três objetos: `LINE_TRANSOESTE_CONSTRUIDA_GEOJSON_DATA` (linhas 1 a 1166), `LINE_TRANSOESTE_LOTE_0_GEOJSON_DATA` (linhas 1167 a 1248) e `LINE_TRANSOESTE_PLANEJADA_GEOJSON_DATA` (linhas 1249 a 1959) seguindo o padrão [GeoJSON](http://geojson.org/). Note que para cada um destes objetos, há uma propriedade `properties`, que traz informações sobre esta linha em específico, como nome, corredor, trecho, extensão, estações, terminais e um código de status. Essas informações são as que são exibidas no popup ao clicar na linha. Mudar o traçado da linha envolveria determinar um novo conjunto de coordenadas e isto foge do escopo deste tutorial, mas para mudar as informações mencionadas anteriormente basta alterar o texto entre as aspas, tomando o cuidado de respeitar as aspas e as vírgulas (caso esse cuidado não seja tomado, o arquivo "quebra" e o mapa deixa de funcionar).

#### Definição das estações dos corredores

Após as linhas, temos a definição das estações que compõem os corredores. Das linhas 1960 até o final do arquivo temos a definição do objeto `STATIONS_TRANSOESTE`, um array de objetos seguindo o padrão [GeoJSON](http://geojson.org/). Cada um desses objetos possui uma propriedade `properties` que define o nome da estação, o corredor ao qual ela faz parte, seu tipo de operação (expresso, parador etc.) e seu status (operacional, em construção, em planejamento), e uma propriedade `geometry` que define a tupla de coordenadas da estação.

##### Tipos de operação

As estações possuem dois tipos de operação:

* `Parador`
* `Expresso\/Parador`
* `Expresso\/Parador\/Semi-Direto`

Para substituir um tipo de operação de uma estação, basta substituir o texto entre as aspas. Atenção ao fato de que a barra `/` deve ser "escapada" com uma contra-barra, ficando `\/`.

##### Status

As estações possuem três possíveis status:

* `Operational` - em operação comercial
* `U.C.` - sigla para "Under Construction", atualmente em construção
* `Planned` - planejada, sem obras acontecendo

## Exemplos de alterações

### Alterar propriedades de um corredor ou de estações de um corredor

Para alterar propriedades de um corredor (nome, trecho, extensão, quantidade de estações e terminais e status de construção), ou de suas estações (nome, corredor, tipo, status), edite o arquivo `js/basemap/brt/[corredor].js`. São quatro arquivos, um para cada corredor:

* [`js/basemap/brt/transoeste.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/basemap/brt/transoeste.js)
* [`js/basemap/brt/transcarioca.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/basemap/brt/transcarioca.js)
* [`js/basemap/brt/transolimpica.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/basemap/brt/transolimpica.js)
* [`js/basemap/brt/transbrasil.js`](https://github.com/nighto/itdpbrtmap/blob/gh-pages/js/basemap/brt/transbrasil.js)
