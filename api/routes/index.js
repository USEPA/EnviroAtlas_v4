
let routes = function () {
    let routes = require('@usepa-ngst/db-api/routes/index');
    let router = routes();
    router.use('/testOverride', async function(req, res, next) {
            res.json({testOverride:true});
    });
    return router;
};

module.exports = routes;