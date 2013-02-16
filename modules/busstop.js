var Q = require('q')
, http = require('http')
, Departures = require('./departures.js').Departures
;

var fs = require('fs');

var pathToCache = 'data/cache/';

exports.setCachePath = function(path){
  pathToCache = path;
};


// In Minutes 
var cacheExpires = 100000;

var cacheName = function(name){
  name = name
    .replace(/ /g,'-')
    .replace(/ä/gi,'ae')
    .replace(/ö/gi,'oe')
    .replace(/ü/gi,'ue')
    .replace(/ß/gi,'ss')
    .replace(/[^a-z0-9]/gi,'')
    ;
  return name;
};

exports.getCacheName = cacheName;

/**
 * Read Cache as a Promise 
 * Resolved, when cachefile exists and is readable and is json and is not older then expired  
 */
var readCache = function(name){

  var deferred = Q.defer();

  var cacheFilename = pathToCache + cacheName(name) + '.json';

  fs.exists(cacheFilename, function (exists) {

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

        var now = new Date();
        now = Date.parse(now.toGMTString());
        
        var diff = (now - requestTime) / 1000 / 60;

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

var requestData = function(name){

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
      fs.writeFile(pathToCache + cacheName(name) + '.json',JSON.stringify(json));
    });
    responseBusses.on('error', function () {
      deferred.reject('request error');
    });
  });

  requestBusses.end();
  return deferred.promise;
};

var parse = function(data){
  var departures = Departures(data);
  //data = departures.getData();
  data = departures.getNextDepartures(10);
  return data;
}

exports.get = function(name, options){
  if(options === undefined){
    options = {};
  }
  if(options.useCache === undefined){
    options.useCache = true;
  }
  
  var deferred = Q.defer();
  
  if(options.useCache === true){
     readCache(name)
    .then(function(cachedJson){
      deferred.resolve(parse(cachedJson));
    })
    .fail(
      function(error){
      requestData(name)
      .then(function(requestJson){
        deferred.resolve(parse(requestJson));
      })
      .fail(function(){
        deferred.reject('request error');
      });
    }
  );
    
  }

  
  
  return deferred.promise;
}
