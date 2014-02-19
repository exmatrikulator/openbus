var http = require('http');


var options = {
  host: 'overpass-api.de',
  path: '/api/interpreter?data=[out:json];relation[operator=WSW];out;',
  path: '/api/interpreter?data=[out:json];relation[operator=WSW][type=route];out;',
  //path: '/api/interpreter?data=[out:xml];relation[operator=WSW][ref=628];way(r);(._;>;);out;',
  path: '/api/interpreter?data=[out:json];relation[operator=WSW][ref=628];way(r);(._;>;);out;',
  port: '80'
};

var callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
    return;
    var json = JSON.parse(str);
    for(var i = 0, x = json.elements.length; i < x; i += 1){
        var element = json.elements[i];
        console.log(element);
    }
  });
};

var req = http.request(options, callback);
req.end();