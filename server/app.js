/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express')
  , mongoose = require('mongoose')
  , fs = require('fs')
  , path = require('path')
  , formsAngular = require('forms-angular')
  , errors = require('./components/errors')
  , config = require('./config/environment')
  , auth = require('./auth/auth.service')
  , bodyParser = require("body-parser")
  , http = require('http')
  , util = require('util')
  , mu   = require('mu2')
  , fs   = require('fs')
  , shortid = require ('shortid')
  , child_process = require('child_process');



// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
	}
);
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();

var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

var DataFormHandler = new (formsAngular)(app, {
  urlPrefix: '/api/' , JQMongoFileUploader: {}, authentication: auth.isAuthenticated()
});


var modelsPath = path.join(__dirname, 'forms-angular-models');

fs.readdirSync(modelsPath).forEach(function (file) {
  var fname = modelsPath + '/' + file;
  if (fs.statSync(fname).isFile()) {
    DataFormHandler.newResource(require(fname));
  }
});

//app.use('/pdf', express.static('./client/assets/pdf/'));
//
app.get('/pdf/:name', function(req, res) {
  var filePath = path.resolve('client/assets/pdf/' + req.params.name);
  res.setHeader('Content-type', 'application/pdf');
  //fs.createReadStream(filePath).pipe(res).on('end', function(a) { console.log(a); });
  res.sendFile(filePath);
});

  // All undefined asset or api routes should return a 404
/*
  app.route('/:url(pdf|auth|components|app|bower_components|assets)/*')
  .get(errors[404]);
*/

// All other routes should redirect to the index.html
/*
app.route('/*')
.get(function(req, res) {
  res.sendFile(app.get('appPath') + '/index.html');
});
*/




// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
