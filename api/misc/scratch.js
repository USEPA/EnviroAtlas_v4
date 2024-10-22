//const appRoot = require('app-root-path');
//const utilities = require(appRoot + '/shared/utilities');
//const inputProcessor = require(appRoot + '/shared/inputProcessor');
//const config = require(appRoot + '/config/env');
//const db = require(appRoot + '/db/index');
//const queryBuilder = require(appRoot + '/db/queryBuilder');
//const auth = require(appRoot + '/shared/auth');
//const merge  = require('merge');
//const jwt = require('jsonwebtoken');

//const utilities = require('@usepa-ngst/utilities');
const utilities = require('@usepa-ngst/utilities/index.cjs');

const sqlite3 = require('better-sqlite3');

(async function () {
    try {
        let rurl = utilities.relativeURLfactory('test/index');
        console.log(rurl.pathname);
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
        const rows = db.prepare(text).all();


        console.log(rows);
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
