module.exports = function() {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    let uuid = swagger_utilities.getSchemaComponent({resource:'uuids'});

    //return the final path spec
    return {uuid};
};
