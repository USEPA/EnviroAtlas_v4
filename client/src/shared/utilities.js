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
    let constructedUrl = `${url}?${paramText.slice(0,-1)}`;
    try {
        let res = await fetch(constructedUrl);
        let data = await res.json();
        return data;
    } catch (e) {
        console.error("Error fetching data: ", e)
    }
}

// addLayer function is passed an array of objects (like feature and tile layers)
export function addLayer(lObj, view) {
    console.log(lObj);
    const url = Object.hasOwn(lObj, 'lyrNum') ? `${lObj.url}/${~~lObj.lyrNum}` : lObj.url;
    console.log(url);
    if (lObj.tileLink === 'yes') {
        console.log(lObj.tileURL)
        let layer = new TileLayer({
            url: lObj.tileURL,
            legendEnabled: false, // hide from legend no honored...
            opacity: 0.6,
            maxScale: lObj.cacheNatLevel
        });
        //TODO: set scale level
        //TODO: hide from legend
        //TODO: opacity
        //TODO: 
        view.map.add(layer);
    }
    // feature server URL
    var copiedLayer = new FeatureLayer({
        url,
        title: lObj.name,
        opacity: 0.6, // apply defaults, like opacity=0.6
    });
    console.log('lObj', copiedLayer);

    setupErrorHandling(copiedLayer);
        
    copiedLayer.on('layerview-create', function () {
            // TODO: popup config?
    });
        
    view.map.add(copiedLayer);
};

// TODO: look for tileLink = yes in object attributes, split into 2 objects for addLayer function

// TODO: look at the service url for a type (feature/dynamic/image)?

// TODO: look for the layer already in the view

// TODO: error catching / email broken layers?
export function setupErrorHandling(errorObj) {
    errorObj.on("layerview-create-error", function (evt) {
        console.error("Failed to create layer: ", errorObj.title, ". Error is: ", evt.error.message, ". Details: ", evt.error.details);
        // TODO: alert messaging?
    });
};
