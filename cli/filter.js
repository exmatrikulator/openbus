var http = require('http'),
unfiltered = require('../data/busstops-filtered.js').unfiltered,
xml2js = require('xml2js')
;


var pointer = 0;

var filtered = {};


var getXml = function(){

  if(pointer >= unfiltered.length){
    console.log('done');
    return;
  }
  var point = unfiltered[pointer];
  if(point.isInWuppertal !== 'undefined'){
    pointer += 1;
    getXml();
    return;

  }
  var options = {
    hostname: 'api.geonames.org',
    port: 80,
//    path: '/findNearbyPlaceNameJSON?lat=' + point.lat + '&lng=' + point.lng + '&username=samisdat',
    path: '/findNearbyPostalCodesJSON?lat=' + point.lat + '&lng=' + point.lng + '&username=samisdat',
    method: 'GET'
  };


  var body = '';

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('error', function () {
       console.log('error');
       console.log('');
       console.log(filtered);
       console.log('');
    })
    res.on('end', function () {
      body = JSON.parse(body);

      if(body.postalCodes !== undefined && body.postalCodes.length > 0 && body.postalCodes[0].placeName !== undefined){
        var town = body.postalCodes[0].placeName;
      }
      else{
        var town = 'unkown'
      }
      
      console.log(pointer + "\t\t" + point.osmId + "\t\t" + town);
      filtered[point.osmId] = town; 
      
      pointer += 1;
      
      if(pointer >= filtered.length){
        console.log('');
        console.log(filtered);
        console.log('');
      }
      else{
        setTimeout(function(){
          getXml();
        },50)
      }
    });
  });

  req.end();

};

var parseXml = function(xml){
  var busStops = [];

  var parser = new xml2js.Parser();
  parser.parseString(xml, function (err, result) {
        if(err){
          console.log(err);
          return;
        }
        if(result.osm.node !== undefined && result.osm.node.length > 0){
          for(var i = 0, x = result.osm.node.length; i < x; i += 1){
            var busStop = {
              osmId:false,
              lat:false,
              lng:false,
              name:false
            }
            busStop.osmId = (result.osm.node[i].$.id === undefined)?false:result.osm.node[i].$.id;
            busStop.lat = (result.osm.node[i].$.lat === undefined)?false:result.osm.node[i].$.lat;
            busStop.lng = (result.osm.node[i].$.lon === undefined)?false:result.osm.node[i].$.lon;
            busStop.lat = parseFloat(busStop.lat); 
            busStop.lng = parseFloat(busStop.lng); 
            
            for(var y = 0, z = result.osm.node[i].tag.length; y < z; y += 1){
              if(result.osm.node[i].tag[y].$.k !== 'name'){
                continue;
              }
              if(result.osm.node[i].tag[y].$.v !== undefined){
                busStop.name = result.osm.node[i].tag[y].$.v;
              }
            }
            
            var allData = true;
            for(var key in busStop){
              if(busStop[key] === false){
                allData = false;
              }
            }

            if(allData === true){
              busStops.push(busStop);
            }

          }
        }

        fs.writeFile('../busstops-unfiltered.json',JSON.stringify(busStops));
        console.log(busStops);
    });
};

getXml();

