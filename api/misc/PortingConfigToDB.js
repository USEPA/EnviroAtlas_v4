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
const fs = require("fs");

const utilities = require('@usepa-ngst/utilities/index.cjs');

const sqlite3 = require('better-sqlite3');

let projectDir = 'C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\SQLite\\Porting Old Config to SQLite\\';

const layerFields = getFullFields([
    {name: 'layerID',type:'integer primary key',new:true},
    {name: 'subTopicID',type:'integer',new:true},
    {name:'eaID',type:'integer'},
    'eaScale',
    'name',
    {name:'subLayerName',type:'text',new:true},
    'eaDescription',
    'fieldName',
    'eaMetric',
    'eaDfsLink',
    'eaMetadata',
    'URL',
    'eaTags',
    'tileLink',
    'tileURL',
    'serviceType',
    'popup',
    {name:'numDecimal',type:'integer'},
    'sourceType',
    'cacheLevelNat',
    'DownloadSource',
    'areaGeog',
    'hucNavStats',
    'hucNavStatsUnits',
    'agoID',
    'UniqueTag',
    'HUBsearch',
    'TagHubText',
    {name:'View Name',rename:'ViewName',type:'text'}
]);

const subTopicFields = getFullFields([
    {name: 'subTopicID',type:'integer primary key',new:true},
    'eaTopic',
    'categoryTab',
    'eaScale',
    'name',
    'eaDescription',
    {name:'eaBC',type:'integer'},
    {name:'eaCA',type:'integer'},
    {name:'eaCPW',type:'integer'},
    {name:'eaCS',type:'integer'},
    {name:'eaFFM',type:'integer'},
    {name:'eaNHM',type:'integer'},
    {name:'eaRCA',type:'integer'},
    {name:'eaPBS',type:'integer'},
    'eaTags',
    'xTopicStatus',
    'sourceType',
    'cacheLevelNat'
]);

(async function () {
    try {
//create dbfile
        let dbfile = projectDir + 'EA_v4.db';
        const db = sqlite3(dbfile);
        db.pragma('journal_mode = WAL');

        let layerArgs = {db,table:'layers',fields:layerFields};
        createTable(layerArgs);

        let subTopicArgs = {db,table:'subTopics',fields:subTopicFields};
        createTable(subTopicArgs);

        let config_layer = await fs.promises.readFile(projectDir +  'config_layer.json','utf-8');
        //get the real config which is in layers.layer
        let config = JSON.parse(config_layer).layers.layer;

//divide items in  onfig into subTopics and layers
        let subTopics = [];
        let layers = [];
        for (let item of config) {
            //if url exists then this is either "sub layer" or "single" layer which is layer/subtopic combo
            if (item.url) {
                layers.push(item);
            }
            //if IsSubLayer is false then this is either subTopic for "sub layers" or "single" layer subTopic
            if (!item.IsSubLayer) {
                subTopics.push(item);
                //if this is layer/subtopic combo (isn't "sub layer" and has url) then need to add SubLayerIds to be eaID of itself
                if (item.url) {
                    item.SubLayerIds = [item.eaID];
                    //don't need sub layer name for the singl layer subTopic so just leave empty
                    item.SubLayerNames = [null];
                }
            }
        }

        /*
        let statement = `INSERT INTO layers (eaID,name) values (?,?)`;
        let insert = db.prepare(statement);
        function test (x,y) {
            return x+y;
        }
        console.log(test.apply(null,[1,2]));
//        return;
        insert.run([1,'one']);
        insert.run([2,'two']);
return;
*/

//prepare the insert statement that will be run for each item
        let layerInsert = prepareInsert(layerArgs);

//loop over layers and insert them
        for (let layer of layers) {
            let values = getInsertValues({data:layer,fields:layerFields});
            layerInsert.run(values);
        }

//prepare the insert statement that will be run for each item
    let subTopicInsert = prepareInsert(subTopicArgs);
//prepare the update statement that will be run for each item
    let layerUpdate = db.prepare(`UPDATE layers SET subTopicID=?,subLayerName=? WHERE eaID=?`);

//loop over subTopics and insert them
//also update layer with subTopicID
        for (let subTopic of subTopics) {
            let values = getInsertValues({data:subTopic,fields:subTopicFields});
            let result = subTopicInsert.run(values);
            //subTopicID is the primary key which is equal to rowID
            let subTopicID=result.lastInsertRowid;
//            console.log(result);
            //now update subTopic ID for layers in this subTopic
            let i = 0;
            for (let eaID of subTopic.SubLayerIds) {
                let subLayerName = subTopic.SubLayerNames[i];
                layerUpdate.run([subTopicID,subLayerName,eaID]);
                i+=1;
            }
        }

    } catch (ex) {
        console.error('exception: ');
        console.error(ex);
    }
})();

//This just put fields in full form
function getFullFields(fields) {
    let fullFields = [];
    for (let field of fields) {
        if (typeof(field)==='string') field= {name:field,type:'text'};
        if (!field.rename) field.rename = field.name;
        fullFields.push(field);
    }
    return fullFields;
}

function createTable({db,table,fields}={}) {
    let createFields = [];
    for (let config of fields) {
//        if (typeof(config)==='string') config = {name:config,type:'text'};
        createFields.push(`${config.rename} ${config.type}`)
    }
    db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table}(${createFields.join(',')})`).run();

}

function prepareInsert({db,table,fields}) {
    let names = [];
    let placeholders = [];
//    let values = [];
    for (let field of fields) {
        //if new field then don't insert
        if (!field.new) {
            names.push(field.rename);
            placeholders.push('?');
        }
    }
    let statement = `INSERT INTO ${table} (${names.join(',')}) values (${placeholders.join(',')})`;
//    console.log(statement);
    let insert = db.prepare(statement);
//    console.log(insert);
    return insert;
}

function getInsertValues({data,fields}) {
    //make the data keys all lower case
    let dataLower = {};
    for (let [name,value] of Object.entries(data)) {
        dataLower[name.toLowerCase()] = value;
    }
    let values = [];
    for (let field of fields) {
        //if new field then don't insert
        if (!field.new) {
            //if this field not in data then just insert null value
            if (field.name in data) {
                let value = data[field.name];
                if (typeof(value)==="object") {
//                    value = JSON.stringify(value);
                    //maybe do array different but might as well just make JSON array for now
                    /*
                     */
                    if (Array.isArray(value)) {
                        value = value.join(",");
                    } else {
                        value = JSON.stringify(value);
                    }
                }
                if (typeof(value)==="boolean") {
                    value = value ? 1 : 0;
                }
                values.push(value);
            } else {
                values.push(null);
            }
        }
    }

    return values;
}