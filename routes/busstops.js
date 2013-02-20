var 
	busstops = require('../data/busstops-wtal').busstops
	,http = require('http')
	,Navigation = require('../modules/navi').navi
	,busstop = require('../modules/busstop')

;

exports.allpoints = function(req, res)
{
	var allBusstops = {};
	for(var i = 0, x = busstops.length; i < x; i += 1)
	{
		if(busstops[i].wswName === undefined)
		{
			continue;
		}
		
		if(allBusstops[busstops[i].wswName] === undefined)
		{
			allBusstops[busstops[i].wswName] = [];
		}
		
		var busstop = {};
		busstop.lat = busstops[i].lat;
		busstop.lng = busstops[i].lng;
		allBusstops[busstops[i].wswName].push(busstop);
	}
	res.contentType('text/javascript');
	res.send('OpenBus.Busstops = ' + JSON.stringify(allBusstops) + ';');
};

exports.busstop = function(req, res)
{
	var name = req.params.name;
	name = decodeURIComponent(name);

	name = name.replace('__','/');


	busstop.get(name)
	.then(function(data){
		res.json(data);
	});
};


exports.typeahead = function(req, res)
{

	var query = req.query.query;
	var exp = new RegExp('^' + query, 'i');

	var stations = {};

	for(var i = 0, x = busstops.length; i < x; i += 1)
	{
		if(exp.test(busstops[i].wswName) === true)
		{
			stations[busstops[i].wswName] = busstops[i];
		}
	}
	
	var typeaheadSort = [];
	for(var name in stations)
	{
		typeaheadSort.push(name);
	}
	typeaheadSort.sort();

	var typeahead = {};
	for(var i = 0, x = typeaheadSort.length; i < x; i += 1)
	{
		var station = stations[typeaheadSort[i]];
		typeahead[station.wswName] =
		{
			lat: station.lat,
			lng: station.lng,
			name: station.wswName
		};
	}

	res.json({"stations": typeahead});
};