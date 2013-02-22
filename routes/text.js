var 
	Navigation = require('../modules/navi').navi
	,config = require('../config')
;

exports.about = function(req, res)
{
	var navigation = Navigation(req.route);
	res.render('about', {bodyClass: 'text', title: 'Express', navigation:navigation, config:config});
};
