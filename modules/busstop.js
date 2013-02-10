var Q = require('q')
, http = require('http')
;

var fs = require('fs');

var pathToCache = 'data/cache/';

exports.setCachePath = function(path){
  pathToCache = path;
};


// In Minutes 
var cacheExpires = 10;

/**
 * Read Cache as a Promise 
 * Resolved, when cachefile exists and is readable and is json and is not older then expired  
 */
exports.readCache = function(name){
  var deferred = Q.defer();

  var cacheFilename = pathToCache + name.replace(' ', '-') + '.json';
  console.log(cacheFilename);
  fs.exists(cacheFilename, function (exists) {
    console.log(exists);
    if(exists === false){
      deferred.reject('cache file does not exist');
      return;
    }

    fs.readFile(cacheFilename, function (err, data) {
      if (err){
        deferred.reject('cannot cache read file');
      }
      
      try {
        var json = JSON.parse(data);
        
        if(json.requestTime === undefined){
          deferred.reject('no requestTime in cached json');
          return;
        }
        
        var requestTime = Date.parse(json.requestTime);
        console.log(json.requestTime);
        var now = new Date();
        now = Date.parse(now.toGMTString());
        
        var diff = (now - requestTime) / 1000 / 60;
        console.log(diff > cacheExpires);
        if(diff > cacheExpires){
          deferred.reject('cache expired');
          return;
        }
        deferred.resolve(json)
      }
      catch (e) {
        deferred.reject('can not parse json from cache file');
      }
      
    });
  });
  return deferred.promise;
}

exports.requestData = function(name){

  var deferred = Q.defer();

  var options = {
    hostname: 'www.wsw-mobil.de',
    port: 80,
    path: '/app-panel.php?p=Wuppertal&s=' + encodeURIComponent(name) + '&l=WSW_Limit',
    method: 'GET'
  };

  var body = '';

  var requestBusses = http.request(options, function(responseBusses) {

    responseBusses.setEncoding('utf8');
    responseBusses.on('data', function (chunk) {
      body += chunk;
    });
    responseBusses.on('end', function () {
      var endTime = new Date();
      var json = JSON.parse(body);
      json.requestTime = endTime.toGMTString();
      deferred.resolve(json);
      
      name = name.replace(' ', '-');
      fs.writeFile(pathToCache + name + '.json',JSON.stringify(json));
      
      
    });
    responseBusses.on('error', function () {
      deferred.reject('request error');
    });
  });

  requestBusses.end();

  
  
  
  
  return deferred.promise;
};