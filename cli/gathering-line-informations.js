var busstop = require('../modules/busstop');
busstop.setCachePath('../data/cache/');


var stations = require('../data/busstops-wtal.js').busstops;

var lines = {};

var linesStatus = {};

for(var i = 0, x = stations.length; i < x; i += 1){
  linesStatus[stations[i].name] = false;
}


var parseLine = function(){
  var station = false;

  for(var name in linesStatus){
    if(linesStatus[name] === false){
      station = name;
      console.log(station);      
      //parseLine();

      break;
    }
  }
  
  if(station === false){
    console.log('done');
    return;
  }
  
  busstop.readCache(station)
  .then(function(data){
    for(var i = 0, x = data.departures.length; i < x; i += 1){
      var departure = data.departures[i];
      
      var lineNumber = departure.number;
      if(lines[lineNumber] === undefined){
        lines[lineNumber] = [];  
      }
      lines[lineNumber].push(departure.stops);

    }
    linesStatus[station] = true;
    console.log(linesStatus);
    parseLine();
    
  },function(err){
    console.log(err);
  });
};



parseLine();
