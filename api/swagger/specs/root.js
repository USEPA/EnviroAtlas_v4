//This was test of doing everything in JS. Just keeping for reference but wasn't used
//If nothing really dynamic going on it was easier to just have YAML file for path and components
//If you want to use JS instead of YAML then just for:
// 1) path: return object keyed by path string
// 2) component: return object keyed by component name
//
//Note: the tags are set up in swagger-index.js all in one place
//
module.exports = function(specs) {
    const YAML = require('yamljs');
    const appRoot = require('app-root-path');
    const utilities = require(appRoot + '/shared/utilities');

    let tag = {
      name: 'Base',
      description: 'Base endpoints'
    };
    specs.tags.push(tag);

    let Errors = {
        type: 'array',
        items: {
            name: 'message',
            type: 'string'
        }
    };
    utilities.objectChain.set(specs,'components.schemas.Errors',Errors);

//    specs.paths['/login'] = YAML.load(appRoot + '/swagger/specs/base/login.yaml');


    specs.paths['/login'] = {
        get: {
            description: 'login to API',
            tags: ['Base'],
            produces: ['application/json'],
            parameters: [
                {
                    name: 'username',
                    description: 'username',
                    in: 'body',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'token',
                    description: 'ESRI API token',
                    in: 'body',
                    required: true,
                    type: 'string'
                }
            ],
            responses: {
                200: {
                    description: 'OK',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
//Note: needed to add quotes to field errors and body or swagger wasn't refresing, whiting out, etc
                                    "'errors'": {$ref: '#/components/schemas/Errors'},
                                    "'body'": {type: 'string'},
                                }
                            }
                        }
                    }
                }
            }

        }
    };


    return specs;
};
