import layerConfig from "src/shared/dataCatalog_layerConfig.json";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

export let view;

// Generic ea api call function
export async function getEaData(url, params) {
    let paramText = '';
    for (const key in params) {
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

// When Add to Map button is clicked, get object from the mapping config
export function getEALayerObject(id) {
    var filtered = layerConfig.filter(lyr => lyr.eaID == id)
    return filtered
}

// addLayer function is passed an array of objects (like feature and tile layers)
export function addLayer(lObj, view) {
    // TODO: apply defaults to lObj, like opacity=0.6
    console.log(lObj);
    lObj.forEach(lyr => {
        const url = Object.hasOwn(lyr, 'eaLyrNum') ? `${lyr.url}/${lyr.eaLyrNum}` : lyr.url;
        console.log(url);
        // feature server URL
        var copiedLayer = new FeatureLayer({
            url,
            title: lyr.name
        });
        console.log('lObj', copiedLayer);

        setupErrorHandling(copiedLayer);
        
        copiedLayer.on('layerview-create', function () {
            // TODO: popup config?

        });
        
        view.map.add(copiedLayer);

    });
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
