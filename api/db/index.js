//wrap db/index.js over db/sqlite.js because everything just consuming db for now
//can fix in future to consume specific db so we could consume multiple in one app

const dbApi = require('@usepa-ngst/db-api/index');
const db = dbApi.require('/db/sqlite');

module.exports = db;
