//const appRoot = require('app-root-path');
//const utilities = require(appRoot + '/shared/utilities');
//const inputProcessor = require(appRoot + '/shared/inputProcessor');
//const config = require(appRoot + '/config/env');
//const db = require(appRoot + '/db/index');
//const queryBuilder = require(appRoot + '/db/queryBuilder');
//const auth = require(appRoot + '/shared/auth');
//const merge  = require('merge');
//const jwt = require('jsonwebtoken');

const fs = require("fs");

const sqlite3 = require('better-sqlite3');

let projectDir = 'C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\SQLite\\Porting Old Config to SQLite\\';

const layerFields = getFullFields([
    {name: 'layerID',type:'integer primary key',new:true},
    {name: 'subTopicID',type:'integer',new:true},
    {name:'eaID',type:'integer'},
    'name',
    {name:'subLayerName',type:'text',new:true},
    {name:'eaDescription',rename:'description',type:'text'},
    {name:'eaMetric',rename:'metric',type:'text'},
    {name:'eaDfsLink',rename:'dfsLink',type:'text'},
    {name:'eaMetadata',rename:'metadataID',type:'text'},
    'url',
    {name:'eaLyrNum',rename:'lyrNum',type:'integer'},
    {name:'eaTags',rename:'tags',type:'text'},
    'tileLink',
    'tileURL',
    {name:'type',rename:'serviceType',type:'text'},
    'popup',
    {name:'layers',rename:'popupLayers',type:'text'},
    {name:'numDecimal',type:'integer'},
    'sourceType',
    'cacheLevelNat',
    'DownloadSource',
    'areaGeog',
    'agoID',
    'UniqueTag',
    'HUBsearch',
    'TagHubText',
    {name:'View Name',rename:'ViewName',type:'text'},
]);

/*
const testArrayFields = getFullFields([
    {name:'testArrayID',type:'integer primary key'},
    {name:'testJoinID',type:'integer'},
    {name:'name',type:'string'}
]);
let testArrays = [{testArrayID:1,testJoinID:1,name:'one'},{testArrayID:2,testJoinID:1,name:'two'}];
*/

const subTopicFields = getFullFields([
    {name: 'subTopicID',type:'integer primary key',new:true},
    {name:'eaID',type:'integer'},
    {name:'eaTopic',rename:'topic',type:'text'},
    'categoryTab',
    {name:'eaScale',rename:'scale',type:'text'},
    'name',
    {name:'eaDescription',rename:'description',type:'text'},
    {name:'eaBC',type:'integer'},
    {name:'eaCA',type:'integer'},
    {name:'eaCPW',type:'integer'},
    {name:'eaCS',type:'integer'},
    {name:'eaFFM',type:'integer'},
    {name:'eaNHM',type:'integer'},
    {name:'eaRCA',type:'integer'},
    {name:'eaPBS',type:'text'},
    {name:'eaTags',rename:'tags',type:'text'},
    'sourceType'
]);

(async function () {
    try {
        let config_layer = await fs.promises.readFile(projectDir +  'config_layer.json','utf-8');

        //get the real config which is in layers.layer
        let config = JSON.parse(config_layer).layers.layer;

        let testingConfigFileStuff = false;
        if (testingConfigFileStuff) {
            for (let item of config) {
                if ('layers' in item) {

                }
            }
            //just hacking this in here to try to find the name of the icon booleans because WAB needs that
            let booleanIconLabels = {};
            let booleanIconFields = ['eaBC','eaCA','eaCPW','eaCS','eaFFM','eaNHM','eaRCA'];
            let tempLayers = [];
            for (let item of config) {
                if (!(Array.isArray(item.eaBCSDD))) {
    //                console.log(item.eaBCSDD);
                    continue;
                }
                for (let label of item.eaBCSDD) {
                    if (!(booleanIconLabels[label])) booleanIconLabels[label] = {};
                    for (let field of booleanIconFields) {
                        if (item[field]) {
                            if (!(booleanIconLabels[label][field])) booleanIconLabels[label][field] = 0;
                            booleanIconLabels[label][field] += 1;
                        }
                    }
                }
            }
            //        console.log(JSON.stringify(booleanIconLabels,null,2));

            for (let item of config) {
                if ([10,901,1000,72,79,1001,73,80].includes(item.eaID)) {
                    tempLayers.push(item);
                }
    //            tempLayers.push(item);
            }

            let fileContent = JSON.stringify({layers:{layer:tempLayers}});
            let fileName = 'C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\gitrepos\\EnviroAtlas_JSApp\\widgets\\SimpleSearchFilter\\config_layer.json';
            await writeFile(fileName,fileContent);

            console.log(fileContent===config_layer);
            console.log(fileContent.length);
            console.log(config_layer.length);
            console.log(JSON.stringify(JSON.parse(config_layer)).length);

            return;

        }

        let fixingDBfields = true;

//create dbfile
        let dbfile = projectDir + 'EA_v4.db';
        //Don't set this file name to something that will overwrite active DB so we don't accidentally change stuff
        //Just change name later to active name if we want to port againa and it looks right
        dbfile = 'C:\\AaronEvans\\Projects\\EPA CAM\\EnviroAtlas\\gitrepos\\EnviroAtlas_DB\\db\\staging\\';

        if (fixingDBfields) {
            dbfile += 'staging.db';
        } else {
            dbfile += 'staging-ported.db';

        }
        const db = sqlite3(dbfile);
        db.pragma('journal_mode = WAL');

        if (fixingDBfields) {
            for (let item of config) {
                if ('layers' in item) {
                    console.log(item.eaID);
                    let layerUpdate = db.prepare(`UPDATE layers SET popupLayers=? WHERE eaID=?`);
                    layerUpdate.run([JSON.stringify(item.layers),item.eaID]);
                }
            }
            return;
        }

        console.log('Porting WAB config to Sqlite DB');

        let layerArgs = {db,table:'layers',fields:layerFields};
        createTable(layerArgs);

        let subTopicArgs = {db,table:'subtopics',fields:subTopicFields};
        createTable(subTopicArgs);

//        let testArrayArgs = {db,table:'testArrays',fields:testArrayFields};
//        createTable(testArrayArgs);


//divide items in  onfig into subTopics and layers
        let subTopics = [];
        let layers = [];
        for (let item of config) {
            //if url exists then this is either "sub layer" or "single" layer which is layer/subtopic combo
            if (item.url) {
                item.testJoinID = 1;
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
                } else {
                    if (item.SubLayerIds.length!==item.SubLayerNames.length) {
                        console.log('sublayer mismatch for eaID=' + item.eaID);
                        //bad form but subLayerNames sometimes is length one array with ; seperated string of SubLayerNames!!!!
                        item.SubLayerNames = item.SubLayerNames[0].split(';')
                    } else {
                        console.log('sublayer match for eaID=' + item.eaID)
                    }
                    //this is subtopic with sublayers. just need to split by ; to get arrays
//                    item.SubLayerIds = item.SubLayerIds.split(';');
                    //don't need sub layer name for the singl layer subTopic so just leave empty
//                    item.SubLayerNames = item.SubLayerNames.split(';');
                }
            }
        }

/*
        let testArraysInsert = prepareInsert(testArrayArgs);
//loop over layers and insert them
        for (let testArray of testArrays) {
            let values = getInsertValues({data:testArray,fields:testArrayFields});
            testArraysInsert.run(values);
        }
*/

//prepare the insert statement that will be run for each item
        let layerInsert = prepareInsert(layerArgs);

        //this used to check if sourceType differs on sub layers
        let layersByEaID = {};

//loop over layers and insert them
        for (let layer of layers) {
            layersByEaID[layer.eaID] = layer;
            let values = getInsertValues({data:layer,fields:layerFields});
            layerInsert.run(values);
        }

    //prepare the insert statement that will be run for each item
        let subTopicInsert = prepareInsert(subTopicArgs);
    //prepare the update statement that will be run for each item
        let layerUpdate = db.prepare(`UPDATE layers SET subTopicID=?,subLayerName=? WHERE eaID=?`);

        //this used to check if sourceType differs on sub layers
        let sourceTypeDiffs = {};

//loop over subTopics and insert them
//also update layer with subTopicID
        for (let subTopic of subTopics) {
            if (subTopic.eaID===1124) {
                console.log();
            }
            let values = getInsertValues({data:subTopic,fields:subTopicFields});
            let result = subTopicInsert.run(values);
            //subTopicID is the primary key which is equal to rowID
            let subTopicID=result.lastInsertRowid;
//            console.log(result);
            //now update subTopic ID for layers in this subTopic
            let i = 0;
            for (let eaID of subTopic.SubLayerIds) {
                if (layersByEaID[eaID].sourceType!==subTopic.sourceType) {
                    if (!sourceTypeDiffs[subTopic.subTopicID]) {
                        sourceTypeDiffs[subTopic.subTopicID] = [];
                    }
                    sourceTypeDiffs[subTopic.subTopicID].push(layersByEaID[eaID].sourceType);
                }
                let subLayerName = subTopic.SubLayerNames[i];
                layerUpdate.run([subTopicID,subLayerName,eaID]);
                i+=1;
            }
        }
        console.log(Object.keys(sourceTypeDiffs));
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

class Deferred {
    constructor(options) {
        this.status = "pending";
        this.value;
        this.resolve;
        this.reject;
        //Also store the status and value to expose to outside
        this.promise = new Promise((resolve,reject)=>{
            this.resolve = function (result) {
                this.status = "resolved";
                this.value = result;
                resolve(result);
            };
            this.reject = function (error) {
                this.status = "rejected";
                this.value = error;
                reject(error);
            };
        });
    }
};

function writeFile(filename,content) {
    const fs = require('fs');

    let defer = new Deferred();

    fs.writeFile(filename, content, err => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve();
        }
    });
    return defer.promise;
}

class streamWriter {
    constructor () {
        this.defer = new Deferred();
        this.ws = null;
        //kind of a dumb thing but have to catch rejection here or will get deprecated unhandled rejection warning
        this.defer.promise.catch(()=>{});
    }
    open (file) {
        const fse = require('fs-extra');
        //promise that can be rejecte/resolved for this open command
        let openDefer = new Deferred();
//        console.log('ws open');
        this.ws =  fse.createWriteStream(file);

        let self = this;
        this.ws.on("error",function (err) {
//            console.log('ws error');
            self.defer.reject(err);
            openDefer.reject(err);
        });
        this.ws.on("finish",function () {
//            console.log('ws finish');
            self.defer.resolve();
        });

        //if there was no error then we should be able to write
        this.ws.write('', () => {
            openDefer.resolve();
//            console.log('test write worked and resolved');
        });

        return openDefer.promise;
    }
    write (text,encoding) {
//        console.log('ws write');
        if (this.ws) {
            this.ws.write(text,encoding);
        } else {
            throw new Error('No file is open for writing');
        }
    }
    end () {
        if (this.ws) {
            this.ws.end();
            this.ws = null;
        }
        return this.defer.promise;
    }
};
