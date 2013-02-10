
var unfiltered = require('../data/busstops-filtered.js').unfiltered
var filtered = [];
console.log(unfiltered.length);


for(var i = 0, x = unfiltered.length; i < x; i += 1){
  if(unfiltered[i].isInWuppertal === true){
    filtered.push(unfiltered[i]);
  }
}
console.log(filtered) ;
