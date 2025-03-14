let dbApi = require('@usepa-ngst/db-api');
const defaultConfig = require('@usepa-ngst/db-api/config/env/default');
const utilities = dbApi.require('/shared/utilities');

//override the default settings for session cookie path in db-api library
utilities.objectChain.set(defaultConfig,'sessionOptions.cookie.path',`/ea`);
//use port 3033 locally for ea so it doesn't collide with egam(3000) or blt(3030)
utilities.objectChain.set(defaultConfig,'url.internal.port',3033);

module.exports = defaultConfig;