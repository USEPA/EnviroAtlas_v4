const appRoot = require('app-root-path');
//const utilities = require(appRoot + '/shared/utilities');
//const inputProcessor = require(appRoot + '/shared/inputProcessor');
//const config = require(appRoot + '/config/env');
//const db = require(appRoot + '/db/index');
//const queryBuilder = require(appRoot + '/db/queryBuilder');
//const auth = require(appRoot + '/shared/auth');
//const merge  = require('merge');
//const jwt = require('jsonwebtoken');

//const utilities = require('@usepa-ngst/utilities');
//can only require @usepa-ngst/utilities if you ran npm run devLink because it's not installed via pacakge.json
const utilities = require('@usepa-ngst/utilities/index.cjs');
const dbApi = require('@usepa-ngst/db-api/index.js');
dbApi.appRoot = appRoot;

const sqlite3 = require('better-sqlite3');


(async function () {
    try {
        (function () {
            var db = sqlite3('C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\gitrepos\\EnviroAtlas_DB\\db\\local\\local.db');
            console.log();
            db.pragma('journal_mode = WAL');

            const rows = db.prepare('Select name,subTopicID from subtopics where subTopicID=$subTopicID and 1=$1')['all']({1:1,subTopicID:5});

            console.log(rows);

        })();
//        return;
        const dbsqlite = dbApi.require('/db/');
        let results = await dbsqlite.query('Select name,subTopicID from subtopics where subTopicID=$2 and 1=$1',[1,5]);

        console.log(results);
        return;

        process.on('exit', () => {
            console.log('sqlite3 database connection closed.');
        });
        process.on('exit', () => {
            console.log('sqlite3 database connection closed2.');
        });
        process.on('exit', cleanup);
        function cleanup(type) {
            console.log('sqlite3 database connection closed.' + type);
        }

        process.exit();
        return;

        var libRoot = require('C:/AaronEvans/Projects/EPA CAM/NGST NPM Publishing/ngst-js-library/packages/lib-root-path');
        console.log(libRoot);
//        var libRootTest = libRoot('@ngst\\myapp','c:\\test\\@ngst\\myapp\\bin\\etc.js');
        var libRootTest = libRoot('db-api');
        console.log(libRootTest);
        libRootTest = libRoot('db-api','C:/AaronEvans/Projects/EPA CAM/NGST NPM Publishing/ngst-js-library/packages/db-api/app/');
        console.log(libRootTest);

        /* testing db/core_experimental.js
        console.log(dbsqlite.csv.test());
        dbsqlite.csv.dum().then(x=>console.log(x));
        return;
        */


        let rurl = utilities.relativeURLfactory('test/index');
        console.log(rurl.pathname);
        return;

        let text = `Select x,y,z
        ,(SELECT json_agg(sub.*)
        FROM ( SELECT a,b,c FROM list WHERE list.x = test.x) sub) AS list2
        FROM test`;

        text = `SELECT x,y,z,
        (SELECT json_group_array(json_object('a',a,'b',b,'c',c)) from list where test.x=list.x) as alist
        FROM test`;
        
//        text = `SELECT x,y,z FROM test as outer`;

        let options = null;


//        const db = new Database('C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\gitrepos\\EnviroAtlas_v4\\api\\misc\\foobar.db');
        let dbfile = 'C:/AaronEvans/Projects/EPA CAM/EnviroAtlas/gitrepos/EnviroAtlas_v4/api/misc/foobar.db';
        console.log(typeof(dbfile));
        const db = sqlite3(dbfile);
        db.pragma('journal_mode = WAL');


        db.prepare('CREATE TABLE IF NOT EXISTS test(x INTEGER, y, z, PRIMARY KEY(x ASC))').run();
        db.prepare('CREATE TABLE IF NOT EXISTS list(x INTEGER, a INTEGER, b, c, PRIMARY KEY(a ASC))').run();
//        db.prepare('INSERT INTO test (x,y,z) values (?,?,?)').run(2,'hello','world');
//        db.prepare('INSERT INTO list (x,a,b,c) values (?,?,?,?)').run(2,3,null,null);

//        const rows = db.prepare('SELECT * FROM test WHERE x=?').all(1);
//        const rows = db.prepare('SELECT * FROM list').all();
//        const rows = db.prepare(text).all();
        const rows = db.prepare(text)['all']();


        console.log(rows);
        var alist = rows[1].alist;
        console.log(alist);
        console.log(typeof(alist));
        let rows2 = JSON.parse(rows);
        console.log(rows2);

//        const rows = db.prepare('SELECT * FROM list').all();
//        console.log(rows);


        return;

        function* toRows(stmt) {
            yield [{name:1},{name:2}].map(column => column.name);
            yield [{name:3},{name:4}].map(column => column.name);
        }
        for (let row of toRows()) {
            console.log(row);
        }
        return;

    } catch (ex) {
        console.error('exception: ');
        console.error(ex);
    }
})();

console.log();