const express      = require('express'),
      http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      favicon      = require('serve-favicon'),
      logger       = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser   = require('body-parser'),
      debug        = require('debug')('pharmacieplus:app'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env;


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Chargement des modules de routage
const routes = require('./routes/index');
const pharmaciesRoutes = require('./routes/v1/pharmacies');
app.use('/', routes);
app.use('/v1/pharmacies', pharmaciesRoutes); // Requêtes vers /pharmacies/*


app.get('/health', function(req, res) {
  res.writeHead(200);
  res.end();
});

app.get('/info/gen', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.end(JSON.stringify(sysInfo[req.url.slice(6)]()));
});

app.get('/info/poll', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.end(JSON.stringify(sysInfo[req.url.slice(6)]()));
});

app.get('/home', function(req, res) {
  fs.readFile('./static/' + 'index.html', function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      let ext = path.extname(req.url).slice(1);
      res.setHeader('Content-Type', contentTypes[ext]);
      if (ext === 'html') {
        res.setHeader('Cache-Control', 'no-cache, no-store');
      }
      res.end(data);
    }
  });
});

// catch 404 and forward to error handler
app.use((request, response, next) => {
  var err = new Error('Not Found');
err.status = 404;
next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, request, response, next) => {
    response.status(err.status || 500);
  response.render('error', {
    message: err.message,
    error: err
  });
});
}

// production error handler
// no stacktraces leaked to user
app.use((err, request, response, next) => {
  response.status(err.status || 500);
response.render('error', {
  message: err.message,
  error: {}
});
});

app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});

//const ImportData = require('./app/importdata');
//ImportData.process();
/*
 var mongoose = require('mongoose');
 var id = mongoose.Types.ObjectId('5471aad59c93d7dd010ce3c1');
 debug(id);
 */



//module.exports = app;
