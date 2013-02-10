(function(){
	var Maps = (function(){
		var map = null;
		var markers = [];
		var mapReady = false;
		var removeMarkers = function(){
		  for(var i = 0, x = markers.length; i < x; i += 1){
		   markers[i].setMap(null); 
		  }
		  markers = [];
		};
		
		var loadBusses = function(marker){
		  console.log(marker.title)
		}; 
		//http://www.wsw-mobil.de/app-panel.php?p=Wuppertal&s=Heimatplan&l=WSW_Limit
    var addMarker = function(markerData){
        var pos = new google.maps.LatLng(markerData.lat, markerData.lng);
        
        var marker = new google.maps.Marker({
          position: pos, 
          map: map, 
          title:markerData.name
        });     
        
        google.maps.event.addListener(marker, 'click', function(){
          console.log(marker.title);
        });
      
    }
    
    var addMarkers = function(json){
			
      removeMarkers()

			for(var i = 0, x = json.length; i < x; i += 1){
        addMarker(json[i]);
			}
		};
		var loadBoundMarkers = function(){

			if(mapReady === false){
				mapReady = true;
			}
			var box = {
				start: {
					lat:map.getBounds().getSouthWest().lat(),
					lng:map.getBounds().getSouthWest().lng()
				},
				end: {
					lat:map.getBounds().getNorthEast().lat(),
					lng:map.getBounds().getNorthEast().lng()
				}
			};
			$.ajax({
  				dataType: "json",
  				url: '/busstops.xhr/' + box.start.lat + '/' + box.start.lng + '/' + box.end.lat + '/' + box.end.lng,
  				success: addMarkers
			});
		};
		var showCanter = function(){
		  var center = map.getCenter();
      $('#mapLat').text(center.lat());
      $('#mapLng').text(center.lng());
      $('#mapZoom').text(map.getZoom());
      
		}
		var createMap = function(){
			//@todo Sensor?
	        var startPos = new google.maps.LatLng(51.270069391526135, 7.21111099999995);
	
	        var options = {
	          zoom: 15,
	          center: startPos,
	          mapTypeId: google.maps.MapTypeId.ROADMAP
	        };
	        map = new google.maps.Map(document.getElementById('map_canvas'), options);
	        
			 google.maps.event.addListener(map, 'tilesloaded', loadBoundMarkers);
			 google.maps.event.addListener(map, 'dragend', showCanter);
			 
			 showCanter();
		};
		var ready = function(){
			createMap();
		};
		return{
			ready:ready
		};
	})();
	$(document).ready(Maps.ready);
	
})();      
      
      function initialize() {

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Hello World!'
        });
      }
