module.exports = function({fullSpec,auth}) {
    //fullSpec is current version of full spec
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    return swagger_utilities.getCrudPaths({resource:'subtopics',auth});
};
