module.exports = function() {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    let layer = swagger_utilities.getSchemaComponent({resource:'layers'});

    //return the final path spec
    return {layer};
};
