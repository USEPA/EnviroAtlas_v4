const appRoot = require('app-root-path');
const appFactory = require('@usepa-ngst/db-api/app/factory');

//need to pass the appRoot of this app instance so db-api library can use it opposed to db-api library appRoot
let settings = {
    appRoot,
    name: 'ea',
    label: 'EA'
};

let app = appFactory(settings);

module.exports = app;
