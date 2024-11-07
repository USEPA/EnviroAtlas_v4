const dbApi = require('@usepa-ngst/db-api/index');

const utilities = dbApi.require('/shared/utilities');
const merge = require('merge');

//can configure the route if desired

// the routes key is the name of file in routes folder and the base route path
// in each route file there might be different routes set up for different methods, params, etc
// can configure each of these routes seperately like:
/*
{comments:{
    routes: {
        get:{rolesAllowed:['ADMIN']},
        getById:{rolesAllowed:['ADMIN']},
        post:{rolesAllowed:null,procedure:'customPostProcedureName'}
    }}};
 */

//Note: all means that setting will go to any route not set up (in this case all but get)
//  you can name your routes anything you want (doesn't have to be get, post, put, etc)
//  just consume them as you named them
//
// routes fields:
// roleAllowed: roles allowed for each route in route file. if nothing set route is public.
//   Note: to over ride default set to null
//
// procedure: use custom procedure for crud route
//
// field can be basically anything that different type of resources expect
//
// Also have type of resources that have standard route functions set up and default values set up for the type
// set type = custom to use custom route function for that resource
// other types have their own generalized route function that is used for all resources with that type
// can also set defaults field on resource to be another type if you want to use defaults of another type
// eg. wanted to use custom function but still use say crud default values

let config = {
    defaultType:'crud'
};

config.resources = {
    subtopics: {
        table: 'subtopics',
        arrays: {layers:{}},
        description: 'Sub Topics describing layers',
        defaultOptions: {
        }
    },
    layers:{
        description: 'Enviro Atlas Layers',
        procedures: {
//            query: 'getLayers'
        },
        arrays: {
            uuids: {},
//            community_uuids: {},
//            national_uuids: {
//Was easy to support setting toObject (for single length arrays) at the route config level but more useful at array config level
// array key is set in array key. if the array key is unique then would always be single length.
// for example, if array config set toObject to true, not sure why route would want to reverse that...
//                toObject:true
//            },
// this was just to test having an array field on an array field item
//            testArrays:{}
        }
    },
    national_uuids:{
        description: 'Meta Data UUIDs for National Scale',
//        view:'national_uuids_view',
        procedures: {
//            query: 'getNationalUuids'
        }
    },
    community_uuids:{
        description: 'Meta Data UUIDs for Community Scale',
//        view:'community_uuids_view',
        procedures: {
//            query: 'getCommunityUuids'
        }
    },
    uuids:{
        description: 'Meta Data UUIDs for National and Community Scale',
        view:'uuids_union_view',
        procedures: {
            query: 'getUuids',
//transform procedure transforms each row as it streams out
            transform: 'transformUuids'
        },
        arrays: {
        }
    }
};

//can set up a type of resource that does standard behavior like crud
//can set default values for that type
config.types = {
    crud: {
        routes : {
//route to be read only
            get: {rolesAllowed:null},
            getById: {rolesAllowed:null},
//for future if we want to open up to everybody
//    post: {rolesAllowed:['ADMIN']},
//    put: {rolesAllowed:['ADMIN']},
//    delete: {rolesAllowed:['ADMIN']}
            post: {rolesAllowed:[]},
            put: {rolesAllowed:[]},
            delete: {rolesAllowed:[]}
        }
    }
};

//transform field configs to so easy to get all field value for routes by field name
let routeSettingsByField = {};
for (let [resource,resourceConfig] of Object.entries(config.resources)) {
    routeSettingsByField[resource] = {};
    //if no type set up then set type equal to default type
    if (!resourceConfig.type) resourceConfig.type = config.defaultType;
    // usually just get the defaults from the type,
    // but can also set defaults field on resource if want custom route function but type defaults
    let type = resourceConfig.defaults || resourceConfig.type;

    let typeConfig = utilities.objectChain.find(config,`types.${type}`) || {};
    // thii actually merges the third into the second and then new second into first
    //    let resourceConfigWithDefaults = config.resources[resource] = merge.recursive({},typeConfig,resourceConfig);
    //make copy of type config and then merge into to copy
    let typeConfigCopy = merge.recursive(true,typeConfig);
    let resourceConfigWithDefaults = config.resources[resource] = merge.recursive(typeConfigCopy,resourceConfig);

    for (let [route,routeConfig] of Object.entries(resourceConfigWithDefaults.routes || {})) {
        for (let [field,value] of Object.entries(routeConfig || {})) {
            if (!routeSettingsByField[resource][field]) routeSettingsByField[resource][field] = {};
            routeSettingsByField[resource][field][route] = value;
        }
    }
}

//easy way to access the route fields with default type values applied
//if the resource, route or field don't exist then doesn't break like object chain would
config.settings = function ({resource,route,field}) {
    // resource required
    // either route or field required
    // if route passed just returned fields object for that route or empty object if route not configured
    // if field passed then returned routes object with key = route and value = field value or empty object if field not configured
    // if route and field passed then just return field value for that route
    let settingsConfig;
    if (route) {
        settingsConfig = utilities.objectChain.find(config,`resources.${resource}.routes.${route}`) || {};
    } else if (field) {
        settingsConfig = utilities.objectChain.find(routeSettingsByField,`${resource}.${field}`) || {};
    } else {
        settingsConfig = utilities.objectChain.find(config,`resources.${resource}`) || {};
    }
    if (route && field) {
        return settingsConfig[field];
    } else {
        return settingsConfig;
    }
};

module.exports = config;