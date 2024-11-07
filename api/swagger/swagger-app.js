const merge = require('merge');
const express = require('express');
//This to allow express to handle thrown errors from async route handlers
//Really helps alot so you don't have to try catch -> next(ex) in every route handler
require('express-async-errors');

const session = require('express-session');

const sqlite3 = require('better-sqlite3');
const sqliteStoreFactory = require('better-sqlite3-session-store');

let app = express();

console.log('EA swagger-app.js started on:  ' + new Date());

//Get the app root
let appRoot = require('app-root-path');
let config = require(appRoot + '/config/env');
let env = config.env;

//The session is stored in sqlite
let sqliteStoreOptions = merge(true,config.sqlite.storeOptions);
sqliteStoreOptions.client = sqlite3(config.sqlite.storeOptions.dbFile);
sqliteStoreOptions.client.pragma('journal_mode = WAL');

let sqliteStore = sqliteStoreFactory(session);
let sqliteStoreInstance = new sqliteStore(sqliteStoreOptions);
app.set('sqliteStoreInstance',sqliteStoreInstance);

//Create copy of config sessionOptions so that is is not altered
let sessionOptions = merge(true,config.sessionOptions);
sessionOptions.store = sqliteStoreInstance;

//Allow persistent session data (eg: username of logged in user)
app.use(session(sessionOptions));

const swagger = require(appRoot + '/swagger/swagger-index.js');

//put custom stuff in custom folder like css, js, etc
app.use('/ea/swagger/custom', express.static(appRoot + '/swagger/custom'));

app.use('/ea/swagger', swagger(app));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.error('404 req.url: ' + req.url);

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
// will print stacktrace

if (app.get('env') !== 'production') {
  app.use(function(err, req, res, next) {
    console.log(err.status);
    res.status(err.status || 500);

    console.log(err.stack);

    res.json(
      {error: {
        message: err.message,
        code: 'ApplicationError',
        stack: err.stack,
      },body: null,}
    );
  });
}

// Production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(
        {error: {
          message: err.message,
          code: 'ApplicationError',
        },body: null,}
    );
});


module.exports = app;
