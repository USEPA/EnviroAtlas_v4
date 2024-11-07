const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'subtopics',
    key: 'subTopicID',
};

//table.fields = queryBuilder.generateFieldsConfig({table,fields:'pula_id, event_name, effective_date, creator_id, created_by, created_time_stamp, reviewer_id, reviewed_by, reviewed_time_stamp, publisher_id, published_by, published_time_stamp, expirer_id, expired_by, expired_time_stamp, base_data, base_data_modifiers, additional_information, focus_meeting, proposed_decision, interim_proposed_decision, interim_decision, final_decision, biological_opinion_regreview, biological_opinion_lit, sec3_newchem, sec3_newuse, sec24, sec18, other_justification, comments'});
//get rid of justification fields
table.fields = queryBuilder.generateFieldsConfig({table,fields:'subTopicID,eaTopic,categoryTab,eaScale,name'});

//Note: schema. fields are used by swagger and query builder code
// put fields query builder code only fields level above schema
// eg. table.fields.creator_id.serverWrite = true;

table.fields.subTopicID.schema.type = 'integer';

//This extra fields created in views are same so just created one variable here
let standardViewFields = {
};

table.views = {
};

module.exports = table;
