const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'subtopics',
    key: 'subTopicID',
};

//get rid of justification fields
table.fields = queryBuilder.generateFieldsConfig({table,fields:'subTopicID,topic,categoryTab,scale,name,description,eaBC,eaCA,eaCPW,eaCS,eaFFM,eaNHM,eaRCA,eaPBS,tags'});

//Note: schema. fields are used by swagger and query builder code
// put fields query builder code only fields level above schema
// eg. table.fields.creator_id.serverWrite = true;

table.fields.subTopicID.schema.type = 'integer';
for (let field of 'eaBC,eaCA,eaCPW,eaCS,eaFFM,eaNHM,eaRCA'.split(',')) {
    table.fields[field].schema.type = 'boolean';
}

//This extra fields created in views are same so just created one variable here
let standardViewFields = {
};

table.views = {
};

module.exports = table;
