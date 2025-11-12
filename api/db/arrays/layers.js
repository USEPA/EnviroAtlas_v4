const dbApi = require('@usepa-ngst/db-api/index');
const arrayBuilder = dbApi.require('/db/arrayBuilder');

let array = {
    name: 'layers',
//resource in routes config file name where object in this array is set up eg. procedures, table, etc
    resource: 'layers',
    arrayKey: 'subTopicID'
};

let ab = arrayBuilder(array);

module.exports = ab;
