var Navigation = require('../modules/navi').navi;


exports.impress = function(req, res){

  var navigation = Navigation(req.route);
    res.render('impress', { title: 'Express', navigation:navigation });
};
exports.about = function(req, res){

  var navigation = Navigation(req.route);
    res.render('about', { title: 'Express', navigation:navigation });
};
