const merge = require('merge');

const dbApi = require('@usepa-ngst/db-api/index');
const utilities = dbApi.require('/shared/utilities');
const queryBuilder = dbApi.require('/db/queryBuilder');

function transform (row,fieldsConfig) {
//instead of having uuids as a field (that was necessary when joining national and community uuids tables/arrays) unwrap it so each of it's fields are row fields
//this is artifact of using national and community uuids tables as an array because makes it easy to join and aggregate into json
//just added scale explicity in here because it made it come at beginning of object
//    let transformed = {metadataID:row.metadataID,scale:row.scale,...row.uuids};

//    return row;
//if row is empty then can't transform it
    if (!row) {
        return row;
    }

    let tableConfigs = queryBuilder.loadTableConfigs(['national_uuids','community_uuids']);
    let transformed = {};

    let aliasFromName = queryBuilder.getFieldAliasFromFieldName(fieldsConfig);
    let scaleAlias = aliasFromName["scale"];

    for (let [name,value] of Object.entries(row)) {
        //this is new field not in national_uuids or community_uuids
        //OR field is in table for this scale
        let fieldExists = [scaleAlias].includes(name) || tableConfigs[row[scaleAlias]+'_uuids'].fields[name];

        if (fieldExists) transformed[name]=value;
    }

    return transformed;
}

module.exports = transform;