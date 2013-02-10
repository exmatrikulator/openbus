
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , busstops = require('./routes/busstops')
  , http = require('http');

console.log(busstops)
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

app.get('/', routes.index);
app.get('/mobile.html', routes.mobile);
app.get('/about.html', routes.about);

app.get('/busstops.xhr/:startlat/:startlng/:endlat/:endlng', busstops.xhr);
app.get('/busstops.proxy/:name', busstops.proxy);

app.get('/filter.html', busstops.filter);


//http.createServer(app).listen(app.get('port'), '192.168.2.105', function(){
http.createServer(app).listen(app.get('port'), '127.0.0.1', function(){
  console.log("Express server listening on port " + app.get('port'));
});
