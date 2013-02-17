var 
  busstops = require('../data/busstops-wtal').busstops
  ,http = require('http')
  ,Navigation = require('../modules/navi').navi
  ,busstop = require('../modules/busstop')

;

exports.allpoints = function(req, res){  
	var allBusstops = {};
	for(var i = 0, x = busstops.length; i < x; i += 1){
		if(busstops[i].wswName === undefined){
			continue;
		}
		
		if(allBusstops[busstops[i].wswName] === undefined){
			allBusstops[busstops[i].wswName] = [];
		}
		
		var busstop = {};
		busstop.lat = busstops[i].lat;
		busstop.lng = busstops[i].lng;
		allBusstops[busstops[i].wswName].push(busstop);  
    
     }
  res.contentType('text/jacascript');
  //@todo Namespacing
  res.send('var busstops = ' + JSON.stringify(allBusstops) + ';');
	
};
exports.points = function(req, res){  
  var box = {
    start: {
      lat:parseFloat(req.params.startlat),
      lng:parseFloat(req.params.startlng)
    },
    end:{
      lat:parseFloat(req.params.endlat),
      lng:parseFloat(req.params.endlat)
    }
  };

  var boxBusstops = {};
  
  for(var i = 0, x = busstops.length; i < x; i += 1){
    if(
      box.start.lat <= busstops[i].lat &&
      box.end.lat >= busstops[i].lat &&
      box.start.lng <= busstops[i].lng &&
      box.end.lng >= busstops[i].lng      
    ){
      if(boxBusstops[busstops[i].name] === undefined){
        boxBusstops[busstops[i].name] = [];
      }
      boxBusstops[busstops[i].name].push(busstops[i]);  
    }
  }
  
  res.json(boxBusstops);
};

exports.busstop = function(req, res){

  var name = req.params.name;
  name = decodeURIComponent(name);
  console.log(name);
  var doSomeThingWithBusData = function(data){
    res.json(data);
  };
  busstop.get(name)
  .then(function(data){
    res.json(data);
  });
};




exports.typeahead = function(req, res){ 
{

  var query = req.query.query;
  var exp = new RegExp('^' + query, 'i');

  

  var stations = {};

  for(var i = 0, x = busstops.length; i < x; i += 1){
    if(exp.test(busstops[i].wswName) === true){
      stations[busstops[i].wswName] = busstops[i];
    }
  }
  var typeaheadSort = [];
  for(var name in stations){
    typeaheadSort.push(name);
  }
  typeaheadSort.sort();
  
  var typeahead = {};
  for(var i = 0, x = typeaheadSort.length; i < x; i += 1){
    var station = stations[typeaheadSort[i]];
    typeahead[station.wswName] = {
      lat: station.lat,
      lng: station.lng,
      name: station.wswName
    };
  }
  
    res.json({"stations": typeahead});
}
};