var http = require('http');
var fs = require('fs');

var busstop = require('../modules/busstop');
busstop.setCachePath('../data/cache/');


var stations = require('../data/busstops-wtal.js').busstops;


var rematchStationName = function(osnName, wswName){
  for(var i = 0, x = stations.length; i < x; i += 1){
    if(stations[i].name === osnName){
      stations[i].wswName = wswName;
   
    }
  }
};

var maxConnections = 1000;
var actConnection = 0;

var urls = {};

for(var i = 0, x = stations.length; i < x; i += 1){
//for (var i = 0, x = 500; i < x; i += 1) {
  var name = busstop.getCacheName(stations[i].name);
  if (urls[name] === undefined) {
    urls[name] = {
      status : 'queued',
      name : stations[i].name,
      osmIds : []
    };
  }
  urls[name].osmIds.push(stations[i].osmId);

  //urls['/app-panel.php?p=Wuppertal&s=' + encodeURIComponent(name) + '&l=WSW_Limit'] = {
}


var queueEmpty = false;

var nextRequests = function(){
  actConnection -= 1;
  for (var i = actConnection, x = maxConnections; i < x; i += 1) {
    requestData();
  }
  if(actConnection === 0 && queueEmpty === true){
    console.log(stations);
  }
};

var requestData = function() {
  var stationName = false;
  for (var name in urls) {
    if (urls[name].status === 'queued') {
      stationName = urls[name].name;
      urls[busstop.getCacheName(stationName)].status = 'fetching';
      break;
    }
  }

  if (stationName === false) {
    if(queueEmpty === false){
      queueEmpty = true;
    }
    
    //console.log(urls)
    return;
  }
  actConnection += 1;
  
  var startTime = new Date();

  busstop.readCache(stationName)
  .then(function(data){
    var endTime = new Date();
    var diffTime = Date.parse(endTime.toGMTString()) - Date.parse(startTime.toGMTString());
    rematchStationName (stationName, data.strFormStation);
    console.log("Request handled \t " + diffTime + "ms \t " + stationName + " fromCache \t" + actConnection + "\t von \t" + maxConnections);
    nextRequests();
  })
  .fail(
    function(error){      
      busstop.requestData(stationName)
      .then(function(data){
        rematchStationName (stationName, data.strFormStation);
        urls[busstop.getCacheName(stationName)].status = 'end';
      
        var endTime = new Date();
        var diffTime = Date.parse(endTime.toGMTString()) - Date.parse(startTime.toGMTString());

        console.log("Request handled \t " + diffTime + "ms \t " + stationName + " success \t" + actConnection + "\t von \t" + maxConnections);
            
        nextRequests();
        
      })
      .fail(function(){
        var endTime = new Date();
        var diffTime = Date.parse(endTime.toGMTString()) - Date.parse(startTime.toGMTString());
        urls[busstop.getCacheName(stationName)].status = 'failed';
        console.log("Request handled \t " + diffTime + "ms \t " + stationName + " failed \t" + actConnection + "\t von \t" + maxConnections);
        nextRequests();
      });
    }
  );




 
}


requestData();
