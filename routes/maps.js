var Navigation = require('../modules/navi').navi;


exports.index = function(req, res)
{
	var navigation = Navigation(req.route);

	res.render('index', { title: 'Express', navigation:navigation });
};