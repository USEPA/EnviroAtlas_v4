const merge = require('merge');
const dbApi = require('@usepa-ngst/db-api/index');

const db = dbApi.require('/db/index');
const utilities = dbApi.require('/shared/utilities');
const queryBuilder = dbApi.require('/db/queryBuilder');

function getText (args={}) {
    let {qb} = args;

// Don't do this anymore. require that qb is passed from caller. they can instantiate it
//    if (!qb) qb = queryBuilder({select,where,order,options});

    //make copy of args so we can remove qb
    args = {...args};
    delete args.qb;

    let tableConfigs = queryBuilder.loadTableConfigs(['national_uuids','community_uuids']);

    let mergedFields = Object.keys({...tableConfigs.national_uuids.fields,...tableConfigs.community_uuids.fields});
    let nationalUuidsFields = {};
    let communityUuidsFields = {};
    for (let field of mergedFields) {
        if (tableConfigs.national_uuids.fields[field]) {
            nationalUuidsFields[field] = field;
        } else {
            nationalUuidsFields[field] = `NULL AS ${field}`;
        }
        if (tableConfigs.community_uuids.fields[field]) {
            communityUuidsFields[field] = field;
        } else {
            communityUuidsFields[field] = `NULL AS ${field}`;
        }
    }

    ///need to get national field list with unused columsn and community with its unused columns
    //try to get fields from table config
    //then can pass this custom from table to getQueryText
    //from is subquery wrapped in () and called table name alias
    let fromTable = `
(SELECT eaMetadata,'national' AS scale,${Object.values(nationalUuidsFields).join(',')}
FROM national_uuids
UNION
SELECT eaMetadata,'community' AS scale,${Object.values(communityUuidsFields).join(',')}
FROM community_uuids)
`;

    //note: force scale to always be selected otherwise can't transform
    let select = args.select || {};
    if (Object.keys(select).length) {
        if (select.scale===0) delete select.scale;
        for (let [name,value] of Object.entries(select)) {
            if (value) {
                select.scale=1;
            }
        }
    }
    //IMPORTANT: need to pass procedureName as null or this function will be called recursively with no end
    let out = qb.getQueryText({...args,select,resource:'uuids',fromTable,procedureName:null});

    //merge the national and ocmmunity uuid properties
    //the config is not in form of above text but form of rows after transformUuids() applied
    //but this out is what is need when adding to table like layers via join
//    let config = merge.recursive(true,outNationalUuids.config,outCommunityUuids.config);

    return {...out};
}

module.exports = getText;