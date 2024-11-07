module.exports = function() {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    let national_uuid = swagger_utilities.getSchemaComponent({resource:'national_uuids'});

    //return the final path spec
    return {national_uuid};
};
