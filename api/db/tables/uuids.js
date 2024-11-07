const merge = require('merge');
const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    key: 'eaMetadata',
};
let fields = queryBuilder.generateFieldsConfig({table,fields:'eaMetadata,scale'});

let tableConfigs = queryBuilder.loadTableConfigs(['national_uuids','community_uuids']);

table.fields = merge.recursive(true,fields,tableConfigs.national_uuids.fields,tableConfigs.community_uuids.fields);

module.exports = table;
