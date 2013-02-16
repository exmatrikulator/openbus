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

    var now = new Date();
    now = Date.parse(now.toGMTString())
    for(var i = 0, x = times.length; i < x; i += 1){
      var byTime = orderByTime[times[i]];

      for(var y = 0, z = byTime.length; y < z; y += 1){
        // filter departures in the past
        if(Date.parse(byTime[y].Date) > now){
          nextDepartures.push(byTime[y]);  
        }
      }        
    }
    
    return nextDepartures;
  }
  
  var getData = function(){
    return busses;
  }
  var parseData = function(){
    data = orginalJSON;
    setTimestamp();
    structureByLine();
  };
  parseData();
  
  
  return{
    getData: getData,
    getLine:getLine,
    getLines:getLines,
    getDirections:getDirections,
    getNextDepartures:getNextDepartures
  };
};

exports.Departures = Departures;
