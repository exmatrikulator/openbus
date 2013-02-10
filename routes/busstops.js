var busstops = require('../data/busstops-wtal').busstops
, http = require('http')
,Navigation = require('../modules/navi').navi
;


exports.filter = function(req, res){
  var navigation = Navigation(req.route);
  //setTimeout(function(){
    res.render('filter', { title: 'Express', navigation:navigation });  
  //},2000)
  
};

exports.proxy = function(req, res){

  var name = req.params.name;
  name = decodeURIComponent(name);

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
      res.send(body)
    });
  });

  requestBusses.end();



  
 
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