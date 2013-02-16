
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');

var routes = {
  maps:require('./routes/maps'),
  text:require('./routes/text'),
  busstops : require('./routes/busstops')
};



var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){ 
  app.use(express.errorHandler());
});

app.get('/', routes.maps.mobile);
app.get('/mobile.html', routes.maps.mobile);
app.get('/about.html', routes.text.about);

app.get('/xhr/points/:startlat/:startlng/:endlat/:endlng', routes.busstops.points);
app.get('/xhr/busstop/:name', routes.busstops.busstop);
app.get('/xhr/typeahead', routes.busstops.typeahead);


http.createServer(app).listen(app.get('port'), '192.168.2.105', function(){
//http.createServer(app).listen(app.get('port'), '127.0.0.1', function(){
  console.log("Express server listening on port " + app.get('port'));
});
