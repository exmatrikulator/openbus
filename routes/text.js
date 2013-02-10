var Navigation = require('../modules/navi').navi;


exports.about = function(req, res){

  var navigation = Navigation(req.route);
  setTimeout(function(){
    res.render('about', { title: 'Express', navigation:navigation });
  },50)
  
};
