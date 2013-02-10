var http = require('http');
var fs = require('fs');

var stations = require('../data/busstops-wtal.js').busstops;

var maxConnections = 10;
var actConnection = 0;

var urls = {};

//for(var i = 0, x = stations.length; i < x; i += 1){
for (var i = 0, x = 500; i < x; i += 1) {
  var name = stations[i].name;
  if (urls[name] === undefined) {
    urls[name] = {
      status : 'queued',
      url : stations[i].name,
      osmIds : []
    };
  }
  urls[name].osmIds.push(stations[i].osmId);

  //urls['/app-panel.php?p=Wuppertal&s=' + encodeURIComponent(name) + '&l=WSW_Limit'] = {
}

var queueEmpty = false;

var cacheData = function(name, data){
  name = name.replace(' ', '-');

  fs.writeFile('../data/cache/' + name + '.json',JSON.stringify(data));

}

var requestData = function() {
  var url = false;
  for (var name in urls) {
    if (urls[name].status === 'queued') {
      url = name;
      urls[url].status = 'fetching';
      break;
    }
  }

  if (url === false) {
    if(queueEmpty === false){
      queueEmpty = true;
      console.log('Warteschlange leer');
    }
   
    //console.log(urls)
    return;
  }


  var startTime = new Date();

  var options = {
    hostname : 'www.wsw-mobil.de',
    port : 80,
    path : '/app-panel.php?p=Wuppertal&s=' + encodeURIComponent(urls[url].url) + '&l=WSW_Limit',
    method : 'GET'
  };


  var body = '';

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      
      
      var data = JSON.parse(body);

      urls[url].status = 'end';

      var endTime = new Date();
      data.requestTime = endTime.toGMTString();
      cacheData(url, data);
      
      var diffTime = Date.parse(endTime.toGMTString()) - Date.parse(startTime.toGMTString());
      diffTime = diffTime;
      console.log("Request handled \t " + diffTime + "ms \t " + options.path + " success \t" + actConnection + "\t von \t" + maxConnections);
      
      actConnection -= 1;
      for (var i = actConnection, x = maxConnections; i < x; i += 1) {
        requestData();
      }
    });
  });

  req.on('error', function(e) {


    var endTime = new Date();

    var diffTime = Date.parse(endTime.toGMTString()) - Date.parse(startTime.toGMTString());
    diffTime = diffTime;
    console.log("Request handled \t diffTime \t " + options.path + " error \t" + actConnection + "\t von \t" + maxConnections + "\t" + e.message);
    
    urls[url].status = 'error';

    actConnection -= 1;
    for (var i = actConnection, x = maxConnections; i < x; i += 1) {
      requestData();
    }

  });
  
  actConnection += 1;

  req.end();

 
}
for (var i = actConnection, x = maxConnections; i < x; i += 1) {
  requestData();
}

