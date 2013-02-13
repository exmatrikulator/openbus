var 
  busstops = require('../data/busstops-wtal').busstops
  ,http = require('http')
  ,Navigation = require('../modules/navi').navi
  ,busstop = require('../modules/busstop')

;
exports.proxy = function(req, res){

  var name = req.params.name;
  name = decodeURIComponent(name);

  var doSomeThingWithBusData = function(data){
    res.json(data);
  };
  
  
  busstop.readCache(name)
  .then(doSomeThingWithBusData)
  .fail(
    function(error){
      busstop.requestData(name)
      .then(doSomeThingWithBusData)
      .fail(function(){
        console.log('something with api request went wrong');
      });
    }
  );
 
};



exports.xhr = function(req, res){	
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
	return;
	
	var aBusstops = [];
	
	//@todo this step should be provided by exporting from 
	for(var name in boxBusstops){
	  var lat = 0;
	  var lng = 0;
	  
	  for(var i = 0, x = boxBusstops[name].length; i < x; i += 1){
      lat += boxBusstops[name][i].lat;
      lng += boxBusstops[name][i].lng;
	  }
	  
	  aBusstops.push({
	    name:name,
      lat:lat/boxBusstops[name].length,
      lng:lng/boxBusstops[name].length,
	  })
	  
	}
	

	res.json(aBusstops);
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