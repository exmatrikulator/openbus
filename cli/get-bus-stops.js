var http = require('http'),
fs = require('fs'),
xml2js = require('xml2js')
;

// http://toolserver.org/~dispenser/cgi-bin/locateCoord.py?dbname=dewiki&lon=7.211111&lat=51.259167&range_km=1
var box = {
  start: {
    lat:51.124396,
    lng:6.995645
  },
  end:{
    lat:51.393938,
    lng:7.426577
  }

 
}

var overpass = {
  hostname:'www.overpass-api.de',
  path:'/api/xapi?node[bbox='+ box.start.lng +','+ box.start.lat +','+ box.end.lng +','+ box.end.lat +'][highway=bus_stop]'
};

var getXml = function(){

  var options = {
    hostname: overpass.hostname,
    port: 80,
    path: overpass.path,
    method: 'GET'
  };

  var body = '';

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      parseXml(body)
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
