const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'national_uuids',
    key: 'metadataID',
};

table.fields = queryBuilder.generateFieldsConfig({table,fields:'tableServiceName,metadataID,uuid'});

table.views = {
};

module.exports = table;
