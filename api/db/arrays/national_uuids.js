const dbApi = require('@usepa-ngst/db-api/index');
const arrayBuilder = dbApi.require('/db/arrayBuilder');

let array = {
    name: 'national_uuids',
//resource in routes config file name where object in this array is set up eg. procedures, table, etc
    resource: 'national_uuids',
    arrayKey: 'metadataID',
//don't really want an array since this will always be single length. have it resolve to object
    toObject: true
};

let ab = arrayBuilder(array);

module.exports = ab;
