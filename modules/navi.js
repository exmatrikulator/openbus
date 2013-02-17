var Navi = [
  {
    href: '/',
    text: 'Abfahrtsmonitor'
  },
  {
    href: '/ueber-openbus.html',
    text: 'Über'
  },
  {
    href: '/impressum.html',
    text: 'Impressum'
  }
];

var navi = function(route){
  var path = route.path;

  var nav = [];
  
  for(var i = 0, x = Navi.length; i < x; i += 1){
    nav.push(Navi[i]);
  }
  
  for(var i = 0, x = nav.length; i < x; i += 1){
    if(nav[i].href === path){
      nav[i].active = true;
    }
    else{
      nav[i].active = false;
    }
  }
  return nav;
  
}

exports.navi = navi;
