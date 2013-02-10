var Tpl = (function(){
  var parse = function(data, tpl){

    for(var key in data){
      tpl = tpl.replace('#{' + key + '}', data[key]);
    }
    return tpl;
  };
  
  return{
    parse:parse
  }
})();

var TimeTo = function(time){
  var now = new Date();

  now = Date.parse(now.toGMTString());
  
  var to = Date.parse(time.toGMTString());
  
  var diff = Math.round( (to - now) / 1000 / 60);
  
  var till = {
    hour: 0,
    minutes: 0
  }
  
  if(diff < 60){
    till.minutes = diff;
  }
  else if(diff >= 60 ){

    till.hours = Math.floor(diff / 60)
    till.minutes = (diff - till.hours * 60);
  }

  return till;  
};


var Departures = function(orginalJSON){
  var data = {}
  var depatures = [];  
  var busses = {};


  var brokenDateRegEx  = /^-(\d+)-(\d+)/;
  
  var structureByLine = function(){
    for(var i = 0, x = data.departures.length; i < x; i += 1){
      if(busses[data.departures[i].number] === undefined){
        busses[data.departures[i].number] = {
          'meta':{
            number:data.departures[i].number,
            type:data.departures[i].type,
            directions:[]
          },
          'directions':{}
        };
      }
      if(busses[data.departures[i].number].directions[data.departures[i].direction] === undefined){
        busses[data.departures[i].number].directions[data.departures[i].direction] = [];
        var direction = data.departures[i].direction;
        busses[data.departures[i].number].meta.directions.push(direction);
      }

      busses[data.departures[i].number].directions[data.departures[i].direction].push(data.departures[i]);
    }  
  };
  
  /**
   * Add add missing year (for some reason the api returns date in format"-mm-dd") and add a date 
   */
  var setTimestamp = function(){
    for(var i = 0, x = data.departures.length; i < x; i += 1){
      var departure = data.departures[i];
  
      var broken = brokenDateRegEx.exec(departure.date);
      if(broken !== null){
        var date = new Date();
        departure.date = date.getFullYear() + departure.date
      }
      departure.Date = new Date(departure.date + ' ' + departure.time); 
      data.departures[i] = departure;
    }
  }; 

  var getLines = function(){
    var lines = [];
    for(var line in busses){
      lines.push(line);
    }
    return lines;
  } 

  var getLine = function(line){
    if(busses[line] === undefined){
      return false;
    }
    return busses[line];
  }; 

  var getDirections = function(line){
    if(busses[line] === undefined){
      return false;
    }
    return busses[line].meta.directions;
  } 

  /**
   * get the next (limit) depatures per line and direction ordered by time  
   */
  var getNextDepartures = function(limit){
    limit = (limit === undefined) ? 1 : limit;
    var nextDepartures = [];
    
    for(var line in busses){
      var bus = busses[line];
      
      for(var direction in bus.directions){
        var depatures = bus.directions[direction];
        var sliceLimit = (depatures.length < limit) ? depatures.length: limit;
        for(var i = 0, x = sliceLimit; i < x; i += 1){
          nextDepartures.push(depatures[i]);  
        }
      } 
    }
    
    var orderByTime = {};
    var times = [];
    
    for(var i = 0, x = nextDepartures.length; i < x; i += 1){
      var nextDeparture = nextDepartures[i];
      var timestamp = Date.parse(nextDeparture.Date.toGMTString());
      if(orderByTime[timestamp] === undefined){
        orderByTime[timestamp] = [];
        times.push(timestamp);
      }
      orderByTime[timestamp].push(nextDeparture);
    }
    times.sort(function (a, b) {return a - b;});
  
    nextDepartures = [];
    
    for(var i = 0, x = times.length; i < x; i += 1){
      var byTime = orderByTime[times[i]];

      for(var y = 0, z = byTime.length; y < z; y += 1){
        nextDepartures.push(byTime[y]);
      }
        
    }
    return nextDepartures;
  }
  
  var parseData = function(){
    data = orginalJSON;
    setTimestamp();
    structureByLine();
  };
  parseData();
  
  
  return{
    getLine:getLine,
    getLines:getLines,
    getDirections:getDirections,
    getNextDepartures:getNextDepartures
  };
};

var Busstop = (function(){
  var $modal = null;
  
  var $title = null;
  var $timeTable = null;
  
  var $next = null;
  var $lines = null;
  var $streetview = null;
  
  var createTabs = true;
  
  var hide = function(){
    $('#busstopDetail').modal('hide');
  };
  var show = function(){
    $('#busstopDetail').modal('show');
  };
  var title = function(title){
    $title.html(title);
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

  var addAccordion = function(busses){
    var html = [];
    for(var key in busses){
      var buss = busses[key];

      var item = [];
      item.push('<div class="accordion-group">');
        item.push('<div class="accordion-heading">');
          item.push('<a class="accordion-toggle" data-toggle="collapse" data-parent="#timeTable" href="#bus' + buss.meta.number + '">');
            item.push(buss.meta.number + ' (' + buss.meta.type + ')');
          item.push('</a>');
        item.push('</div>');
        item.push('<div id="bus' + buss.meta.number + '" class="accordion-body collapse">');
          item.push('<div class="accordion-inner">');
            item.push('<div>');
              for(var direction in buss.lines){
                item.push('<div>Richtung: ' + direction + '</div>');
                item.push('<ul>');
                  for(var i = 0, x = buss.lines[direction].length; i < x; i += 1){
                    item.push('<li>');
                      item.push(buss.lines[direction][i].time);
                      if(buss.lines[direction][i].plattform !== undefined){
                        item.push( '(' + buss.lines[direction][i].plattform + ')');
                      }
                    item.push('</li>');
                  }
                item.push('</ul>');
              }
            item.push('</div>');

          item.push('</div>');
        item.push('</div>');
      item.push('</div>');
      html.push(item.join(''));
    }
    $timeTable.html(html.join(''));
    
  };
  
  var clearTabs = function(){
    $next.html('');
    $lines.html('');
    $streetview.html('');
  };
  
  var addOverview = function(departures){
    var nextDepartures = departures.getNextDepartures();
    
    var html = [];
    html.push('<ul class="next">');    
    $(nextDepartures).each(function(index, item){
      var timeTo = TimeTo(item.Date);
      if(timeTo.hour === 0 && timeTo.minutes < 0){
        return true;
      }
      if(timeTo.hour === 0){
        item.timeTo = timeTo.minutes + ' min';
      }
      else{
        item.timeTo = timeTo.minutes + ':' + timeTo.minutes + ' h';
      }
      var tpl = Tpl.parse(item, '<li><div><span class="badge badge-info">#{number}</span> Richtung <strong>#{direction}</strong></div><div>fährt in <strong>#{timeTo}</strong></div></li>');
      html.push(tpl);
    });
    html.push('</ul>');    

    $next.html(html.join(''))
  };
  
  var addTabs = function(departures){
    if(createTabs === true){
      $('#tabs.nav-tabs li a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      })
      clearTabs()
      createTabs = false;
    }
    
    addOverview(departures);
    
    title('Alter Markt');
    show();
    
  };
  
  var loadBusses = function(title){
    $.ajax({
        dataType: "json",
        url: '/busstops.proxy/' + title,
        success: function(data){
          var departures = Departures(data);
          addTabs(departures);
        }
    });

    
  }; 
  
  
  var showBusDetails = function(marker){
    var data = marker._data;
    
    var titleFast = data[0].name;
    
    loadBusses(titleFast);
    
    title(titleFast);
    show();
    getStreetview(marker);
  };
  
  var ready = function(){
    $('#busstopDetail').modal({show:false});
    $title = $('#busstopDetail').find('.modal-header h3');
    $timeTable = $('#busstopDetail').find('#timeTable');
    
    $next = $('#next');
    $lines = $('#lines');
    $streetview = $('#streetview');
    
    
  };
  $(document).ready(ready);

  return{
    hide:hide,
    show:show,
    showBusDetails:showBusDetails,
    loadBusses:loadBusses
  };
})();
var Map = (function(){
  $map = null;
  var map = null;
  var mapReady = false;
  
  
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
          Busstop.showBusDetails(marker);
          return;
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


  var loadMarkers = function(){
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

  var createGoogleMap = function (position) {
    var startPos = new google.maps.LatLng(position.lat, position.lng);
    var options = {
      zoom: 15,
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
    
    //Busstop.loadBusses('Alter Markt');
    //return;
    $map = $('#map');
    scaleMap();
    addGoogleMap();

  };

  $(document).ready(ready);
  $(window).resize(scaleMap);
  return{
    scaleMap:scaleMap
  }  
})();


window.addEventListener("load",function() {
  return;
  // Set a timeout...
  setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
      setTimeout(function(){
        Map.scaleMap();
      }, 10);
  }, 0);
});