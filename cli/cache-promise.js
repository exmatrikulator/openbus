var busstops = require('../modules/busstops');

busstops.setCachePath('../data/cache/');

var doSomeThingWithBusData = function(data){
  console.log('doSomeThingWithBusData');
};


var name = 'Heimatplan';
busstops.readCache(name)
.then(doSomeThingWithBusData)
.fail(
  function(error){
    console.log(name);
    busstops.requestData(name)
    .then(doSomeThingWithBusData)
    .fail(function(){
      console.log('something with api request went wrong');
    });
  }
);
