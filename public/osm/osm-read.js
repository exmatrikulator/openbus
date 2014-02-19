var osmread = require('osm-read');


osmread.parse({
    url: 'http://overpass-api.de/api/interpreter?data=node(51.93315273540566%2C7.567176818847656%2C52.000418429293326%2C7.687854766845703)%5Bhighway%3Dtraffic_signals%5D%3Bout%3B',
    url:'http://www.overpass-api.de/api/xapi?node[bbox=7.1,51.2,7.2,51.3][highway=bus_stop]',
    url:'http://www.overpass-api.de/api/xapi?relation[operator=WSW]',
    //url: 'http://overpass-api.de/api/interpreter?data=relation("VRR Buslinien")',
    url:'http://overpass-api.de/api/interpreter?data=relation(operator=WSW)',    
    format: 'xml',
    endDocument: function(){
        console.log('document end');
    },
    relation: function(bounds){
        console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function(node){
        console.log('node: ' + JSON.stringify(node));
    },
    way: function(way){
        console.log('way: ' + JSON.stringify(way));
    },
    error: function(msg){
        console.log('error: ' + msg);
    }
});



/*
 <query type="relation">
  <has-kv k="name" v="VRR Buslinien"/>
</query>
<recurse type="relation-relation"/>
<print/>
 * */