const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'layers',
    key: 'layerID',
};

table.fields = queryBuilder.generateFieldsConfig({table,fields:'layerID,subTopicID,eaID,name,subLayerName,description,metric,dfsLink,metadataID,url,lyrNum,tags,tileLink,tileURL,serviceType,popup,numDecimal,cacheLevelNat,DownloadSource,areaGeog,agoID,UniqueTag,HUBsearch,TagHubText,ViewName'});

//Note: schema. fields are used by swagger and query builder code
// put query builder code only fields level above schema
// eg. table.fields.creator_id.serverWrite = true;
for (let field of 'layerID,subTopicID,eaID,numDecimal,lyrNum'.split(',')) {
    table.fields[field].schema.type = 'integer';
}

module.exports = table;
