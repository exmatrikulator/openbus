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
		
		var getStreetview = function(marker){
      var latLng = marker.getPosition()

      var headings = [];
      for(var i = 0, x = marker._data.length; i < x; i += 1){
        
        var pos = new google.maps.LatLng(marker._data[i].lat, marker._data[i].lng);
        
        var heading = google.maps.geometry.spherical.computeHeading(latLng, pos);
        headings.push(heading);
      }
      $('#streetview').html('')
      for(var i = 0, x = headings.length; i < x; i += 1){
        $('#streetview').append(
          '<img src="http://maps.googleapis.com/maps/api/streetview?size=400x200&heading=' + headings[i] + '&location=' + latLng.lat() + ',' + latLng.lng() + '&sensor=false&key=AIzaSyDBoyVRJC-572Wj7Pfgf10Z9OjRHHDkgOE">'
        );
      }
      	
      		  
		};
		
		var loadBusses = function(marker){
		  
      $.ajax({
          dataType: "json",
          url: '/busstops.proxy/' + marker.title,
          success: function(data){
            var busses = {};
            if(data.departures !== undefined){
              for(var i = 0, x = data.departures.length; i < x; i += 1){
                if(busses[data.departures[i].number] === undefined){
                  busses[data.departures[i].number] = {};
                }
                if(busses[data.departures[i].number][data.departures[i].direction] === undefined){
                  busses[data.departures[i].number][data.departures[i].direction] = [];
                }
                if(busses[data.departures[i].number][data.departures[i].direction].length > 1){
                  continue;
                }
                busses[data.departures[i].number][data.departures[i].direction].push(data.departures[i]);
              }  
            }
           console.log(busses) 
          }
      });

		  
		}; 
		//http://www.wsw-mobil.de/app-panel.php?p=Wuppertal&s=Heimatplan&l=WSW_Limit
    var addMarker = function(markerData){
      
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
        
        var marker = new google.maps.Marker({
          position: pos, 
          map: map, 
          title:markerData[0].name,
          _data:markerData
        });     
        markers.push(marker)
        google.maps.event.addListener(marker, 'click', function(){
          
          getStreetview(marker);
          loadBusses(marker);
        });
    
      return;
      
    }
    
    var addMarkers = function(json){
			
      removeMarkers()
    for(var name in json){
        addMarker(json[name]);
      }      
      return;
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
	          disableDefaultUI: true,
	          mapTypeId: google.maps.MapTypeId.ROADMAP
	        };
	        map = new google.maps.Map(document.getElementById('busMap'), options);
	        
			 google.maps.event.addListener(map, 'tilesloaded', loadBoundMarkers);
			 google.maps.event.addListener(map, 'dragend', showCanter);
  
			 
			 showCanter();
		};
		var ready = function(){
		      //loadBusses({title:'Döppersberg'});
      
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
