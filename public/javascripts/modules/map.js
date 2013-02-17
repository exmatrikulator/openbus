(function(){

	OpenBus.Map = (function()
	{
		var $map = null;
		var map = null;
		var mapReady = false;
	
		var defaultCenter = {
			lat:51.270069391526135, 
			lng:7.21111099999995
		};
	
		var scaleMap = function()
		{
			// scaling #map to fit into viewport
			var pos = $map.position();
			var navbarHeight = $('.navbar').height();
			var height = $(window).height() - (pos.top + (pos.top -  navbarHeight) ) 
			
			$map.css('height', height + 'px');
		};
	
		var addMarker = function(markerName, markerData)
		{
		
			var center = {
				lat:0,
				lng:0
			};
		
			for(var i = 0, x = markerData.length; i < x; i += 1){
				center.lat += markerData[i].lat;
				center.lng += markerData[i].lng;
			}
		
			center.lat = center.lat / markerData.length;
			center.lng = center.lng / markerData.length;
			var pos = new google.maps.LatLng(center.lat, center.lng);
		
			var marker = new google.maps.Marker(
			{
				position: pos, 
				map: map, 
				title:markerName
			});
			google.maps.event.addListener(marker, 'click', function()
			{
				OpenBus.Busstop.showBusDetails(marker);
			});
		};
	
		var addMarkers = function(json)
		{
			for(var name in json)
			{
				addMarker(name, json[name]);
			}
		};
	
		var createGoogleMap = function (position)
		{
			var startPos = new google.maps.LatLng(position.lat, position.lng);
			var options = {
				zoom: 15,
				center: startPos,
				disableDefaultUI: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
		
			map = new google.maps.Map(document.getElementById('map'), options);
		
			addMarkers(OpenBus.Busstops);		
		};
		
		var addGoogleMap = function()
		{
			if (navigator.geolocation) 
			{
				navigator.geolocation.getCurrentPosition(function(position)
				{
					createGoogleMap({lat:position.coords.latitude, lng:position.coords.longitude});
				}, 
				function()
				{
					createGoogleMap(defaultCenter);
				});
			}
			else
			{
				createGoogleMap(defaultCenter);
			}
		};
	
		var ready = function()
		{
			$map = $('#map');
			scaleMap();
			addGoogleMap();
		};
	
		$(window).resize(scaleMap);
		return{
			ready:ready
		}  
	})();

})();