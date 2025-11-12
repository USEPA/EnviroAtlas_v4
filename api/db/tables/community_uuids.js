const dbApi = require('@usepa-ngst/db-api/index');
const queryBuilder = dbApi.require('/db/queryBuilder');

let table = {
    name: 'community_uuids',
    key: 'metadataID',
};

table.fields = queryBuilder.generateFieldsConfig({table,fields:'tableServiceName,metadataID,allCommunity,atx,birAl,bmd,btx,cil,cleOh,dmia,dnc,fca,gbwi,laca,mspmn,mtn,mwi,nbma,nhct,nyny,paz,phiPa,pitPa,pme,pnj,por,sdca,slmo,slcut,sonCa,tacWa,tfl,vbwva,wdc,wia'});

module.exports = table;
