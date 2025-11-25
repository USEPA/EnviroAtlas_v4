const libRoot = require('@usepa-ngst/lib-root-path');
let dbApi = libRoot.require('/db-api/index');

const routesLib = dbApi.require('/shared/routes');
const inputProcessor = dbApi.require('/shared/inputProcessor');

module.exports = function({app,resource}) {
    let crud = require('@usepa-ngst/db-api/routes/types/crud');

    let router = crud({app,resource});

    //Not sure if this is bad idea but instead of copying over all the crud paths, just overwrite the one route that needs it
    //To do this we just find existing route in stack and remove before adding new route handler
    removeRoutePath({router,path:'/'});
    router.get(`/`, async function(req, res, next) {
        let inputs = inputProcessor.getRequestInputs(req,{slice:['where'],parse:true});
        if (!inputs.where) inputs.where = {};
        if ('subTopicID' in inputs.where) {
        } else {
//if positive subTopicID not entered in query then only show layers where supTopicID is not 0 or null
            inputs.where.subTopicID = {'>':0};
        }

        //req.query overwrites req.body in inputProcessor.getRequestInputs so just set req.query.where
        req.query.where = inputs.where;

        await routesLib.standardGetRoute({req,res,resource,route:'get'});
    });

    return router;
};

//Add this to db-api module shared/routes at some point
function removeRoutePath({router,path}) {
    let stackIndex = getStackIndexByRoutePath({router,path});
    router.stack.splice(stackIndex,1);
}

function getStackIndexByRoutePath({router,path}) {
    let stackIndex = null;
    let i=0;
    for (let stackItem of router.stack) {
        if (stackItem.route.path===path) {
            stackIndex = i;
            break;
        }
        i += 1;
    }
    return stackIndex;
}