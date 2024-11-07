module.exports = function() {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    let community_uuid = swagger_utilities.getSchemaComponent({resource:'community_uuids'});

    //return the final path spec
    return {community_uuid};
};
