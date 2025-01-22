import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer"
import PopupTemplate from "@arcgis/core/PopupTemplate";

export let view;

// Generic ea api call function
export async function getEaData(url, params) {
    //TODO: check if params is string or object
    //TODO: if object, JSON.stringify
    let paramText = '';
    for (const [key, value] of Object.entries(params)) {
        paramText += `${key}=${params[key]}&`
    }
    let constructedUrl = `${url}?${paramText.slice(0, -1)}`;
    try {
        let res = await fetch(constructedUrl);
        let data = await res.json();
        return data;
    } catch (e) {
        console.error("Error fetching data: ", e)
    }
}

// addLayer function is passed an array of objects (like feature and tile layers)
// TODO: Make this a handler function? 
// TEST: is it faster to load data from portal item metadata instead of EAAPI?
export function addLayer(lObj, view) {
    console.log(lObj);
    if (isFeatureService(lObj.url)) {
        addFeatureLayer(lObj)
    }
    if (lObj.tileLink === 'yes') {
        addTileLayer(lObj, view)
    }
};

export function isFeatureService(url) {
    let match = url.substring(url.lastIndexOf('/') + 1);
    return match === 'FeatureServer' || match === 'MapServer'
}

export function isImageService(url) {
    return url.substring(url.lastIndexOf('/') + 1) === 'ImageServer'
}

export function addFeatureLayer(lObj) {
    const url = Object.hasOwn(lObj, 'lyrNum') ? `${lObj.url}/${~~lObj.lyrNum}` : lObj.url;
    console.log(url);
    // feature server URL
    var copiedLayer = new FeatureLayer({
        url,
        title: lObj.name,
        opacity: 0.6, // apply defaults, like opacity=0.6
    });
    // if it has a popup property, build the popup template
    if (lObj.popup != null) {
        copiedLayer.popupTemplate = buildFSPopupTemp(lObj);
    }
    
    console.log('lObj', copiedLayer);

    setupErrorHandling(copiedLayer);
        
    copiedLayer.on('layerview-create', function () {
        // TODO: popup config?
    });
        
    view.map.add(copiedLayer);
}

export function addTileLayer(lObj, view) {
    console.log(lObj.tileURL)
    let tLyr = new TileLayer({
        title: lObj.name,
        url: lObj.tileURL,
        legendEnabled: false, // hide from legend not honored in layer list...
        opacity: 0.6, // set opacity
        // TODO: revist scale level...seems like cacheNatLevel isn't synced with the feature layer scales.
        maxScale: 4622324
    });
    //tLyr.listMode = "hide"; // hide from layer list...or "hide-children"
    console.log(view.zoom);
    view.map.add(tLyr);
}

// TODO: look for the layer already in the view

// TODO: error catching / email broken layers?
export function setupErrorHandling(errorObj) {
    errorObj.on("layerview-create-error", function (evt) {
        console.error("Failed to create layer: ", errorObj.title, ". Error is: ", evt.error.message, ". Details: ", evt.error.details);
        // TODO: alert messaging?
    });
};

export function buildFSPopupTemp(lObj) {
    let pTemplate;
    if (lObj.popup.fieldInfos != null) {
        pTemplate = new PopupTemplate({
            title: lObj.name,
            content: [{
                type: 'fields', 
                fieldInfos: lObj.popup.fieldInfos 
            }]
        })
        return pTemplate
    } else {
        return
    }
}