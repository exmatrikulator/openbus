var Map = (function(){
  $map = null;
  var map = null;
  var mapReady = false;
  
  var geocoder = null;
  
  var defaultCenter = {
    lat:51.270069391526135, 
    lng:7.21111099999995
  }
  
  var markers = [];
  var scaleMap = function(){
     // scaling #map to fit into viewport     
    var pos = $map.position();
    var navbarHeight = $('.navbar').height();
    var height = $(window).height() - (pos.top + (pos.top -  navbarHeight) ) ; 

    $map.css('height', height + 'px');
    
  };

    var removeMarkers = function(){
      for(var i = 0, x = markers.length; i < x; i += 1){
       markers[i].setMap(null); 
      }
      markers = [];
    };
    
   var addMarker = function(markerData){

        var pos = new google.maps.LatLng(markerData.lat, markerData.lng);
        
        var marker = new google.maps.Marker({
          position: pos, 
          map: map, 
          _data:markerData
        });     
        markers.push(marker)      
    }
    
    var addMarkers = function(json){
      
      removeMarkers()
      for(var i = 0, x = json.length; i < x; i += 1){
        addMarker(json[i]);
      }
    };


  var geoCodePointer = 0;
  
  var osmIds = [];
  
  var done = function(){
    for(var i = 0, x = markers.length; i < x; i += 1){
      if(markers[i]._data.isInWuppertal === false){
        osmIds.push(markers[i]._data.osmId)
      }
    }
    
    console.log(JSON.stringify(osmIds))
  }
  
  var geocode = function(){
    var marker = markers[geoCodePointer];


    var latlng = marker.getPosition();
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) 
      {
        if (results[1]) 
        {
          var town = results[1].address_components[1].long_name;
          console.log(town);
          markers[geoCodePointer]._data.town = town;
          if(town === 'Wuppertal'){
            markers[geoCodePointer]._data.isInWuppertal = true;
          }
          else{
            markers[geoCodePointer]._data.isInWuppertal = false;
          }
          
          geoCodePointer += 1;
          
          if(geoCodePointer >= markers.length){
            console.log('alle');
            done();
          }
          else{
            setTimeout(function(){
              geocode();
            },1500)
            
          }
          
        }
        else 
        {
            geoCodePointer += 1;
             console.log('No results found');
            setTimeout(function(){
              
              geocode();
            },3000)
        }
      } 
      else 
      {
         console.log('Geocoder failed due to: ' + status);
            geoCodePointer += 1;
                      
            setTimeout(function(){
              geocode();
              done();
            },3000)
      }
    });          
  };

  var loadMarkers = function(){
    var json = [];
    json = unfiltered;
    /*
    for(var i = 0, x = 10; i < x; i += 1){
      json.push(unfiltered[i])
    }
    */
    for(var i = 0, x = json.length; i < x; i += 1){
      json[i].isInWuppertal = undefined;
    }
    addMarkers(json);
    geocode();
  };

  var createGoogleMap = function (position) {
    geocoder = new google.maps.Geocoder();
    
    var startPos = new google.maps.LatLng(position.lat, position.lng);
    var options = {
      zoom: 12,
      center: startPos,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), options);
    
  google.maps.event.addListener(map, 'tilesloaded', loadMarkers);
    
  }
  var addGoogleMap = function(){
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
  
  var ready = function(){
    
    $map = $('#map.filter');
    scaleMap();
    addGoogleMap();

  };

  $(document).ready(ready);
  $(window).resize(scaleMap);
  return{
    scaleMap:scaleMap
  }  
})();
