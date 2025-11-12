const express = require('express');
//This to allow express to handle thrown errors from async route handlers
//Really helps alot so you don't have to try catch -> next(ex) in every route handler
require('express-async-errors');
const fse = require('fs-extra');
const merge = require('merge');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

//Get the app root
const appRoot = require('app-root-path');

//set the appRoot from this consuming app on the db-api library so it can access consuming app configurations
let dbApi = require('@usepa-ngst/db-api');
dbApi.appRoot = appRoot;

let app = express();
console.log('EA app.js started on:  ' + new Date());

/*
//for security scans don't show x powered by express anymore
app.disable('x-powered-by');
//add header here to see if works in ARR redirect proxy
app.use(function(req, res, next) {
//Have to do this on IIS also though so that public and admin client pass not just API
//    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
});
*/

//Get the configuration for this current environment from config file specific
//to current environment
//Note, if for some reason appRoot is wrong try the hardcoded path
let config = dbApi.require('/config/env');
let env = config.env;
let routesConfig = dbApi.require('/config/routes');
let routesLib = dbApi.require('/shared/routes');

//can  set up a DB pool later here
//app.set('dbPool',dbPool);

//When somebody logins we wil need to have DB update of modified items run in a
//queue so they aren't updating same stuff on accident
//var TasksQueues = dbApi.require('/shared/TasksQueues');
//app.set('tasksQueues',new TasksQueues(500));

// Create a write stream (in append mode)
var accessLogStream = fse.createWriteStream(appRoot + '/logs/access.log', {
  flags: 'a',
});

// Setup the logger
app.use(logger('combined', {
  stream: accessLogStream,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());

//The session is stored in db
let db = dbApi.require('/db/index');
let sessionStoreInstance = db.getSessionStore(session);
app.set('sessionStoreInstance',sessionStoreInstance);

//Create copy of config sessionOptions so that is is not altered
let sessionOptions = merge(true,config.sessionOptions);
sessionOptions.store = sessionStoreInstance;

//Allow persistent session data (eg: username of logged in user)
app.use(session(sessionOptions));

//Don't need to use authentication yet
//Check if user is authenticated
//let authRoute  = require(appRoot + '/routes/auth');
//app.use('/ea/api', authRoute(app));

//Creating route /ea/api
//probably should make local routes eventually that consume the library routes
//or else just completely override the default
let routes = dbApi.require('/routes/index');
app.use('/ea/api', routes(app));

//Have to sort resources because if  route is heirarchical then want children to register before parent
//eg. review/comment route must come before review route or else review/:keyField would end up handling review/comment requests
let resourcePathLevels = [];
for (let [resource,resourceConfig] of Object.entries(routesConfig.resources)) {
    let level = 1;
    if (resourceConfig.routePath) level = resourceConfig.routePath.split('/').length;

    resourcePathLevels.push({resource,level});
}
//Now sort by level with highest level being first
resourcePathLevels.sort((a,b) => {return (a.level > b.level) ? -1 : ((a.level < b.level) ? 1 : 0)});
//not get the sorted resource names
let sortedResources = resourcePathLevels.map(item=>item.resource);

//Most of the routes will a same pattern of resources like pulas, limitations, etc.
for (let resource of sortedResources) {
    let resourceConfig = routesConfig.resources[resource];
//for (let [resource,resourceConfig] of Object.entries(routesConfig.resources)) {
//for (let resource of ['pulas','users','roles','organizations','divisions','events','limitation_codes','application_methods','crop_uses','formulations']) {
    let routeSetup;
    if (resourceConfig.type==='custom') {
        routeSetup = dbApi.require('/routes/' + resource);
    } else {
        routeSetup = dbApi.require('/routes/types/' + resourceConfig.type);
    }
    //Can have path different than resource name to allow deeper paths like /ea/api/review/comments instead of just /ea/api/review
    let routePath = resourceConfig.routePath || resource;
    app.use('/ea/api/' + routePath, routeSetup({app,resource}));
}

let redirectRoute = dbApi.require('/routes/redirect');
app.use('/$', redirectRoute(app,{fixed:'/ea/swagger/'}));
app.use('/ea/api/?$', redirectRoute(app,{fixed:'/ea/swagger/'}));

//Can easily serve swagger UI from main app if want on same port
//Can run swagger on local to get rid of caching problems.
// Also just might want to run swagger on same port anyway as main api in future. would be simpler
if (config.standaloneSwagger!==true) {
    const swagger = dbApi.require('/swagger/swagger-index.js');
//put custom stuff in custom folder like css, js, etc
    app.use('/ea/swagger/custom', express.static(appRoot + '/swagger/custom'));
    app.use('/ea/swagger', swagger(app));
}


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.error('404 req.url: ' + req.url);

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(errors, req, res, next) {
    let status = errors.status || 500;

    console.error(status);
    console.error(errors);

    //if header is already sent then need to destroy req returning a 502 error
    if (res.headersSent) {
        return res.destroy();
    }

    res.status(status);

    if (!Array.isArray(errors)) errors = [errors];
    let responseObj = [];

    for (let error of errors) {
        let errorObj;
        if (status===400) {
            errorObj = error;
        } else {
            errorObj = {message:error.message || error.toString()};
            // If not local env then don't leak stack trace to user
            if (config.env === 'local') {
                if (error.stack) errorObj.stack = error.stack;
            }
        }
        responseObj.push(errorObj);
    }

    res.json(responseObj);
});

//send out email saying the app was started
const sendEmail = dbApi.require('/shared/sendEmail');

let subject  = 'EA API Started';
let body = `EA API was started on:

${new Date()}

This could possibly be due to automatic restart after server crash. Check logs/errors.log for uncaught exceptions.`;

let from = config.email.defaultFrom;//FromAddress in config file
let to = config.email.admins;

//console.log(body);

sendEmail.send({from,to,subject,body,isHTML:false,checkProd:false});

module.exports = app;
