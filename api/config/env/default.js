let dbApi = require('@usepa-ngst/db-api');
const defaultConfig = require('@usepa-ngst/db-api/config/env/default');
const utilities = dbApi.require('/shared/utilities');

//override the default settings for session cookie path in db-api library
utilities.objectChain.set(defaultConfig,'sessionOptions.cookie.path',`/ea`);

module.exports = defaultConfig;