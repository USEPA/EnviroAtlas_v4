const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'national_uuids',
    key: 'eaMetadata',
};

table.fields = queryBuilder.generateFieldsConfig({table,fields:'tableServiceName,eaMetadata,uuid'});

table.views = {
    'national_uuids_view':{
        fields: {
            scale:{name:'scale',schema:{type:"string"}}
        }
    }
};

module.exports = table;
