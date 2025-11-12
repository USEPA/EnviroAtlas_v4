module.exports = function({fullSpec,auth}) {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    return swagger_utilities.getCrudPaths({resource:'uuids',auth});
};
