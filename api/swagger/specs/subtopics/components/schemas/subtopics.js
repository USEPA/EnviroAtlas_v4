module.exports = function() {
    const dbApi = require('@usepa-ngst/db-api/index');
    const swagger_utilities = dbApi.require('/swagger/swagger-utilities');

    let subtopic = swagger_utilities.getSchemaComponent({resource:'subtopics'});

    //return the final path spec
    return {subtopic};
};
