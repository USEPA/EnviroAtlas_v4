//use this to test out swagger specs.
// https://editor.swagger.io/
//Just paste in the specs that are printed to console when swagger started
// It does a great job of showing errors

let swagger_utilities = {};

const appRoot = require('app-root-path');
const YAML = require('yamljs');
const fse = require('fs-extra');
const node_path = require('path');
const merge = require('merge');
const utilities = require(appRoot + '/shared/utilities');
const routesConfig = require(appRoot + '/config/routes');
const routesLib = require(appRoot + '/shared/routes');
const queryBuilder = require(appRoot + '/db/queryBuilder');

swagger_utilities.processTags = async function(args) {
//    let {tags} = args;
//note: don't really need to resolve fields other than tags but just doing so to document args signature
    let {tags,specs,basePath,auth} = args;

    //tags passed in to this function has tag "path" (folder in swagger/specs directory) as the key and tag object as value where tag object has tag "name" as field
    let tagPathFromName = {};
    for (let [tagPath,tag] of Object.entries(tags)) {
        if (!specs.tags) specs.tags = [];
        //        const specFn = require(appRoot + '/swagger/specs/' + tag);
        //        specFn(specs);
        specs.tags.push(tag);

        tagPathFromName[tag.name] = tagPath;

        //Set up the paths now from YAML or JS
        let folderRoot =  appRoot + '/swagger/specs/' + tagPath;
        await swagger_utilities.processFolder({folderRoot,target:'paths',...args});
    }
    //Now loop through the paths because if a Tag is not referenced in any path then we shouldn't show
    //If user not authorized to see any paths associated with tag then just hide the tag
    let tagNamesInPaths = {};

    for (let path of Object.values(specs.paths)) {
        for (let method of Object.values(path)) {
            for (let tagName of (method.tags || [])) {
                tagNamesInPaths[tagName] = true;
            }
        }
    }
    //if tag name is in at least one path/method then it is kept in visible tags list
    let visibleTags = specs.tags.filter(function (tag) {
        return tagNamesInPaths[tag.name];
    });
    //now replace spec tags with only visible tags
    specs.tags = visibleTags;

    //now add only the components for the visible tags
    let componentTagPaths = Object.keys(tagNamesInPaths).map(tagName=>tagPathFromName[tagName]);
    //also assume root components should always be visible (put root first though so we show these first)
    componentTagPaths.unshift('root');
    for (let tagPath of componentTagPaths) {
        //Set up the paths now from YAML or JS
//        let tagPath = tagPathFromName[tagName];
        let folderRoot =  appRoot + '/swagger/specs/' + tagPath;

        //Set up the components now from YAML or JS
        let swaggerComponentTypes = await fse.readdir(folderRoot + '/components');
        //types are like schemas, etc
        for (let swaggerComponentType of swaggerComponentTypes) {
            await swagger_utilities.processFolder({folderRoot,target:'components.' + swaggerComponentType,...args});
        }
    }

};

swagger_utilities.processFolder = async function (args) {
    let {folderRoot,target} = args;

    let folderPath = folderRoot + '/' + target.split('.').join('/');
    let fileNames = await fse.readdir(folderPath);
    for (let fileName of fileNames) {
        //create object if it doesn't exist over multiple "dotted" levels
//        utilities.objectChain.create(specs,target);
        let filePath = folderPath + '/' + fileName;

        swagger_utilities.processFile({filePath,...args});
    }
};

swagger_utilities.processFile = function (args) {
    let {filePath,target,specs,basePath,auth} = args;

    let ext = node_path.extname(filePath);
    let resultJS;
    if (ext==='.yaml') {
        resultJS = YAML.load(filePath);
    } else if (ext==='.js') {
        const specFn = require(filePath);
        resultJS = specFn({fullSpec:specs,auth});
    } else {
        //ignore files that aren't js or yaml
        return;
    }

    for (let pathName of Object.keys(resultJS)) {
//        target[pathName] = resultJS[pathName];
        //allow target to be multiple "dotted" levels and objects will be created if heirarchy doesn't exist yet
        let fullPathName = basePath ? basePath + pathName : pathName;
        utilities.objectChain.set(specs,target + '.' + fullPathName,resultJS[pathName]);
    }
};

swagger_utilities.createPathSpec = function ({method='get',spec={},parameters,body={},responses={}}={}) {
//helper function to create GET endpoint with typical defaults
//make copy of spec so we don't mess it up
    let defaultSpec = {
//        produces: ['application/json'],
        responses: {}
    };

    spec = merge.recursive(true, defaultSpec, spec);

    //set up the body parameters
    if (body.parameters || body.schema || body.$ref) {
        let properties = {};
        let required = [];
        let contentTypesMap = {
            json: 'application/json',
            form: 'application/x-www-form-urlencoded',
            multi: 'multipart/form-data'
        };

        let content = {};
        spec.requestBody = {content};
        for (let contentTypeShort of body.types || ['form','json']) {
            //if no short name for content type then use whatever full name was passed
            let contentType = contentTypesMap[contentTypeShort] || contentTypeShort;
            content[contentType] = {};
            //allow alternate schema based on content type eg. deal with arrays in the form being wacky
            let schema = utilities.objectChain.find(body,'altSchema.' + contentTypeShort) || body.schema;
            if (schema) {
                content[contentType].schema = schema;
            } else if (body.$ref) {
                content[contentType].schema = {$ref:body.$ref};
            } else {
                content[contentType].schema = {
                    type: 'object',
                    properties
//                    required
                };
            }
        }
        if (body.parameters) {
            let defaultParameter = {
                type: 'string'
            };
            for (let [name,parameter] of Object.entries(body.parameters)) {
                parameter = merge.recursive(true,defaultParameter, parameter);
                properties[name] = parameter;
                if ('required' in parameter) {
                    if (parameter.required) required.push(name);
                    delete parameter.required;
                }
            }

            //now add required array in here only if length>0 because swagger doesn't like that
            for (let [typeName,typeObj] of Object.entries(content)) {
                if (required.length>0) typeObj.schema.required = required;
            }

        }

    }

    if (parameters) {
        spec.parameters = [];
        let defaultParameter = {
            in: 'query',
            schema: {
                type: 'string'
            }
        };
        for (let [name,parameter] of Object.entries(parameters)) {
            parameter = merge.recursive(true,defaultParameter, parameter);
            parameter.name = name;
            for (let extra of ['type','format','enum']) {
                if (extra in parameter) {
                    parameter.schema[extra] = parameter[extra];
                    delete parameter[extra];
                }
            }
            spec.parameters.push(parameter)
        }

    }


    let defaultResponse = {
        content: {
            'application/json': {
                schema:{}
            }
        }
    };

    //add 400 and 500 error codes by default if not in there
    //If no 400 desired pass responses['400']=undefined
    for (let code of [400,500]) {
        if (!(code in responses)) {
            responses[code] = {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/error'
                }}
        }
    }

    for (let [code,response] of Object.entries(responses)) {
        if (spec.responses[code]) continue;

        spec.responses[code] = merge.recursive(true,defaultResponse);
        if (response.description) {
            spec.responses[code].description = response.description;
        } else {
            if (code==200) spec.responses[code].description = 'OK';
            if (code==400) spec.responses[code].description = 'Bad Request';
            if (code==403) spec.responses[code].description = 'Forbidden';
            if (code==500) spec.responses[code].description = 'Internal Server Error';
        }

        if (response.schema) {
            spec.responses[code].content['application/json'].schema = response.schema;
        } else {
            let schema = spec.responses[code].content['application/json'].schema;

            if (response.properties) {
                schema.type = 'object';
                schema.properties = response.properties;
                for (let [name,property] of Object.entries(schema.properties)) {
                    if (!property) {
                        schema.properties = property = {};
                    }
                    if (Object.keys(property).length===0) {
                        property.type = 'string';
                    }
                }
            } else if (response.items) {
                schema.type = 'array';
                schema.items = response.items;
                if (!response.type) schema.items.type = 'string';
            } else if (response.$ref) {
                schema.$ref = response.$ref;
            }
        }
    }

    return spec;
};

//gets the schema component object from a table fields config object
swagger_utilities.getSchemaComponent = function ({config,resource,table,procedure,procedureArgs,writable,insert,writableInclude=[], altSchema,exclude}) {
//there is bug with application/x-www-form-urlencoded which doesn't hide readOnly = true fields on the form
//https://github.com/swagger-api/swagger-ui/issues/6158
//as a hack add the writable field here so that when writable=true readOnly fields won't be returned on schema
//adding on to hack writableInclude list which allows readonly fields to be include when writable = true
//eg. if key is allowed to be set on inserts eg pula_id on pula table
    let fields;
    if (config) {
        fields = config;
    }else if (resource) {
        let qb = new queryBuilder();
        //setting writable on qb easiest way to give nested arrays access to the setting
        qb.writable = writable;
        ({config:fields} = qb.getQueryText({resource,writable}));
    } else if (procedure) {
        const getProcedure = require(appRoot + '/db/procedures/' + procedure);
        ({config:fields} = getProcedure({...procedureArgs,writable}));
    } else if (table) {
        let tableConfig = require(appRoot + '/db/tables/' + table);
        fields = tableConfig.fields;
    } else {
        throw new Error('config, resource, table, procedure is required.')
    }

    let schema = {
        type: 'object',
        properties: {
        }
    };
    let required = [];

    for (let [fieldName,fieldConfig] of Object.entries(fields)) {
//This didn't work. Can't do the altSchema stuff in array because .getSchemaComponent() needs to be called recursively
//Instead just turn array of objects into an object here if altSchema set to form
//        let fieldSchema = utilities.objectChain.find(fieldConfig,'altSchema.' + altSchema) || fieldConfig.schema;
        //blacklisted stuff sometimes still ends up in fields but with empty fieldConfig. don't process in that case
        if (!fieldConfig) {
            continue;
        }
        let fieldSchema = fieldConfig.schema;
        //allow alternate schema to be used if configured for the field
        // eg. helps with array that want to be set up different for x-www-form-urlencoded
        if (altSchema==='form') {
            if (!fieldSchema) {
                console.log();
            }
            if (fieldSchema.type==='array') {
                fieldSchema = {...fieldSchema.items,description: "When using x-www-form-urlencoded this needs to be a JSON array."};
            }
        }
        //Allow hard coded exclusions also in cases like arrays where don't want array key in the post/put where array is a field
        if (exclude && exclude.includes(fieldName)) continue;

        if (resource==='pulas') {
            console.log();
        }
        //make copy of schema object so we don't mess up table config when setting defaults like type
        fieldSchema = merge.recursive(true,fieldSchema);
        //if create only then set readOnly = false if insert and true if update
        if (fieldConfig.createOnly) {
            if (insert) {
                delete fieldSchema.readOnly;
            } else {
                fieldSchema.readOnly = true;
            }
//            fieldSchema.readOnly = insert ? false : true;
        }
        //if writable is set then don't show readOnly fields unless writableInclude
        if (writable && fieldSchema.readOnly && !writableInclude.includes(fieldName)) continue;
        //set schema on each table config field and set as schema for field on component
        if (!fieldSchema.$ref && !fieldSchema.type) fieldSchema.type = 'string';
        //if writable and we want to include extra readonly fields then set readOnly to false
        //if (writable && writableInclude.includes(fieldName)) fieldSchema.readOnly = false;
        if (writable && writableInclude.includes(fieldName)) delete fieldSchema.readOnly;

        schema.properties[fieldName] = fieldSchema;
        //if required is on the fieldSchema then need to move it to main schema as an array and remove from fieldSchema
        //Note: the field schema might actually be an object though and have a required array on it so if required is not an array then don't move
        if ('required' in fieldSchema && !Array.isArray(fieldSchema.required)) {
            if (fieldSchema.required) required.push(fieldName);
            delete fieldSchema.required;
        }

    }
    //now add required array in here only if length>0 because swagger doesn't like that
    if (required.length>0) schema.required = required;

    return schema;
};

swagger_utilities.getCrudPaths = function ({tag,resource, component,queryParameters={},pathParameters,route,auth}) {
    if (!resource) throw new Error('resource is required.');

    let resourceConfig = utilities.objectChain.find(routesConfig,'resources.'+resource);
    let table = resourceConfig.table || resource;

    const tableConfig = require(appRoot + '/db/tables/' + table);
    if (!tableConfig) throw new Error('table = ' + table + ' is not configured.');
    let keyField = tableConfig.key;

//    if (!tag) tag = utilities.capitalize(table);
//If not tag present then split the underscore and capitalize each word
    if (!tag) tag = table.split('_').map(x=>utilities.capitalize(x)).join(' ');

    if (!component) component = table.replace(/s$/,'');
//    if (!route) route = table;
//not sure why i was defaulting route to table when app.js defaults route to resource
//Also we have a routePath field now on the routeConfig
    if (!route) route = resourceConfig.routePath || resource;

    //set up the user authorization based on role
    let rolesAllowed = routesConfig.settings({resource,field:'rolesAllowed'});
    //Allow description to be custom by method also
    let description = routesConfig.settings({resource,field:'description'});

    let isAuth = routesLib.isAuth({auth,resource});

    let pathSpec = {
        tags: [tag]
    };

    let tableLabel = table.replace(/_/g,' ');
    let componentLabel = component.replace(/_/g,' ');

    let defaultQueryParameters = {
        get: {
            select:{
                description: `projection for ${componentLabel} search results in JSON format <a target="_blank" href='/ea/swagger/custom/select.html'>docs</a>`,
            },
            where:{
                description: `query for ${componentLabel} search in JSON format <a target="_blank" href='/ea/swagger/custom/where.html'>docs</a>`,
            },
            union:{
                description: `list of queries to combine in union for ${componentLabel} search in JSON format <a target="_blank" href='/ea/swagger/custom/union.html'>docs</a>`,
            },
            order:{
                description: `sort order for ${componentLabel} search results in JSON format <a target="_blank" href='/ea/swagger/custom/order.html'>docs</a>`,
            },
            options:{
                description: `options for ${componentLabel} search in JSON format <a target="_blank" href='/ea/swagger/custom/options.html'>docs</a>`,
            }
        },
        getByID: {
            select:{
                description: `projection for ${componentLabel} result in JSON format <a target="_blank" href='/ea/swagger/custom/select.html'>docs</a>`,
            },
            options:{
                description: `options for ${componentLabel} result in JSON format <a target="_blank" href='/ea/swagger/custom/options.html'>docs</a>`,
            }
        },
        post: {
            select:{
                description: `projection for inserted ${componentLabel} to return in JSON format <a target="_blank" href='/ea/swagger/custom/select.html'>docs</a>`,
            },
            options:{
                description: `options for ${componentLabel} insert in JSON format <a target="_blank" href='/ea/swagger/custom/options.html'>docs</a>`,
            }
        },
        put: {
            select:{
                description: `projection for updated ${componentLabel} to return in JSON format <a target="_blank" href='/ea/swagger/custom/select.html'>docs</a>`,
            },
            options:{
                description: `options for ${componentLabel} update in JSON format <a target="_blank" href='/ea/swagger/custom/options.html'>docs</a>`,
            }
        },
        delete: {
            options:{
                description: `options for ${componentLabel} delete in JSON format <a target="_blank" href='/ea/swagger/custom/options.html'>docs</a>`,
            }
        }
    };
    //add defaults for all methods over defaultQueryParameters
    if (queryParameters.default) {
        for (let method of Object.keys(defaultQueryParameters)) {
            merge.recursive(defaultQueryParameters[method],queryParameters.default);
        }
    }
    //now merge in passed query params with defaults
    queryParameters = merge.recursive(defaultQueryParameters,queryParameters);
    //make sure put, post and delete don't have extra query params
    delete queryParameters.post.where;
    delete queryParameters.post.union;
    delete queryParameters.put.where;
    delete queryParameters.put.union;
    delete queryParameters.delete.where;
    delete queryParameters.delete.select;
    delete queryParameters.delete.union;

    if (!pathParameters) pathParameters = {
        [keyField]:{
            in: 'path',
            type:'integer',
            required:true
        }
    };

    let  responses = {
        200: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/' + component
            }}
    };

    let rootPaths = {};
    let byIdPaths = {};

    if (isAuth.get!==false) {
        //if rolesAllowed is set then path requires auth
        delete pathSpec.security;
        if (rolesAllowed.get) pathSpec.security = [{"ApiKeyAuth": []}];
        pathSpec.description = description.get || `Find EA ${tableLabel}`;
        rootPaths.get = swagger_utilities.createPathSpec({method:'get',spec:pathSpec,parameters:{...queryParameters.get},responses});
    }

    if (isAuth.getById!==false) {
        //if rolesAllowed is set then path requires auth
        delete pathSpec.security;
        if (rolesAllowed.getById) pathSpec.security = [{"ApiKeyAuth": []}];
        pathSpec.description = description.getById || `Get Single EA ${componentLabel} by ${keyField}`;
        byIdPaths.get = swagger_utilities.createPathSpec({method:'get',spec:pathSpec,parameters:{...pathParameters,...queryParameters.getByID},responses});
    }

    if (resource==='pulas') {
        console.log()
    }

    let updateBody = getUpsertBody();
    let insertBody = getUpsertBody(true);
    /*
    if (tableConfig.allowKeyInsert) {
        insertBody = getUpsertBody([keyField])
    } else {
        insertBody = updateBody;
    }
    */

    function getUpsertBody(insert,writableInclude) {
        let upsertSchema = swagger_utilities.getSchemaComponent({resource,writable:true,insert,writableInclude});
        //create the alt schema for x-www-form-urlencoded to make it easier to deal with in swagger ui
        let upsertSchemaForm = swagger_utilities.getSchemaComponent({altSchema:'form',resource,writable:true,insert,writableInclude});

        let body = {
            schema:upsertSchema,
            altSchema: {form:upsertSchemaForm}
        };
        return body;
    }

    responses['200'] = {
        $ref: '#/components/schemas/' + component
    };

    //Could also just use user definition again instead of $ref if desired
    //Just commenting out for now unless we decide we don't want all the components to show in swagger
    /*
    let fullSchema;
    if (procedure) {
        fullSchema = swagger_utilities.getSchemaComponent({procedure,procedureArgs});
    } else {
        fullSchema = swagger_utilities.getSchemaComponent({table});
    }
    responses['200'].schema = fullSchema;
    */

    if (isAuth.post!==false) {
        //if rolesAllowed is set then path requires auth
        delete pathSpec.security;
        if (rolesAllowed.post) pathSpec.security = [{"ApiKeyAuth": []}];
        pathSpec.description = description.post || `Create EA ${componentLabel}`;
        rootPaths.post = swagger_utilities.createPathSpec({method:'post',spec:pathSpec,parameters:{...queryParameters.post},body:insertBody,responses});
    }

    if (isAuth.put!==false) {
        //if rolesAllowed is set then path requires auth
        delete pathSpec.security;
        if (rolesAllowed.put) pathSpec.security = [{"ApiKeyAuth": []}];
        pathSpec.description = description.put || `Update EA ${componentLabel}`;
        byIdPaths.put = swagger_utilities.createPathSpec({method:'put',spec:pathSpec,parameters:{...queryParameters.put,...pathParameters},body:updateBody,responses});
    }

    responses['200'] = {
        schema: {
// Don't return true anymore, just return the number of items deleted
//            type:'boolean',enum:[true]
            type:'integer'
//            type:'string',example:null
        }
    };

    if (isAuth.delete!==false) {
        //if rolesAllowed is set then path requires auth
        delete pathSpec.security;
        if (rolesAllowed.delete) pathSpec.security = [{"ApiKeyAuth": []}];
        pathSpec.description = description.delete || `Delete EA ${componentLabel}`;
        byIdPaths.delete = swagger_utilities.createPathSpec({method:'delete',spec:pathSpec,parameters:{...queryParameters.delete,...pathParameters},responses});
    }

    //if pathParameters are empty then don't need keyField
    if (Object.keys(pathParameters).length) {
        return {
            ['/' + route]:rootPaths,
            [`/${route}/{${keyField}}`]:byIdPaths
        };

    } else {
        return {
            ['/' + route]:{...rootPaths,...byIdPaths}
        };

    }

};

swagger_utilities.getAuthorizations = function ({route,auth,defaultRolesAllowed}) {
    //set up the user authorization based on role

    //one day might want to change default roles allowed for a set of paths
    if (!defaultRolesAllowed) {
        defaultRolesAllowed = {
            get: ['ENFORCE','ADMIN'],
            getById: ['ENFORCE','ADMIN'],
            post: ['ADMIN'],
            put: ['ADMIN'],
            delete: ['ADMIN']
        };
    }

    let rolesAllowed = {};
    if (routesConfig[route]) {
        for (let [method,config] of Object.entries(routesConfig[route])) {
            if (config.rolesAllowed) rolesAllowed[method] = config.rolesAllowed
        }
    }

    rolesAllowed = merge.recursive(defaultRolesAllowed,rolesAllowed);

    let isAuth = {};
    //if rolesAllowed set and role is not member of rolesAllowed then they are not auth for this resource->route eg. where route is combo of params, method, etc
    //now that we added review users allow admin to also be logged in as reviewer
    let role_names = [];
    if (auth) {
        if (auth.user) role_names.push(auth.user.role_name);
        if (auth.review) role_names.push('REVIEWER');
    }

    for (let [method,methodRolesAllowed] of Object.entries(rolesAllowed)) {
        //if rolesAllowed set and role is not member of rolesAllowed then don't add this path. they can't see it.
        if (methodRolesAllowed && (!auth || !utilities.array.intersection(methodRolesAllowed,role_names).length)) continue;
        isAuth[method] = true;
    }

    return {rolesAllowed,isAuth};
};

module.exports = swagger_utilities;
