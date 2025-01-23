import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer"
import PopupTemplate from "@arcgis/core/PopupTemplate";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";


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

// TEST: is it faster to load data from portal item metadata instead of EAAPI?
export function addLayer(lObj, view) {
    console.log(lObj);
    if (isFeatureService(lObj.url)) {
        addFeatureLayer(lObj, view)
    }
    if (lObj.tileLink === 'yes') {
        addTileLayer(lObj, view)
    }
    if (isImageService(lObj.url)) {
        addImageryLayer(lObj, view)
    }
    // TODO: Add EA Boundaries and locations when community data is added to the map
};

// Boolean test for Feature or Map service type
export function isFeatureService(url) {
    let match = url.substring(url.lastIndexOf('/') + 1);
    return match === 'FeatureServer' || match === 'MapServer'
}

// Boolean test for Image service type
export function isImageService(url) {
    return url.substring(url.lastIndexOf('/') + 1) === 'ImageServer'
}

export function addFeatureLayer(lObj, view) {
    const url = Object.hasOwn(lObj, 'lyrNum') ? `${lObj.url}/${~~lObj.lyrNum}` : lObj.url;
    console.log(url);
    // feature server URL
    var copiedLayer = new FeatureLayer({
        url,
        title: lObj.name,
        opacity: 0.6, // apply defaults, like opacity=0.6
    });

    // catch error on instantiating the new Feature Layer
    copiedLayer.when(function () {
        // if it has a popup property, build the popup template
        if (lObj.popup != null) {
            copiedLayer.popupTemplate = buildFSPopupTemp(lObj);
        }
    }, function (error) {
        // This function will execute if the promise is rejected due to an error
        // This is a workaround not having sourceType='dynamic' from API
        // TODO: Update sourceType with data in DB
        if (error.message === 'Source type "Raster Layer" is not supported') {
            console.log('this is a dynamic map service')
            let miLyr = new MapImageLayer({
                url: lObj.url
            });
            view.map.add(miLyr);
        }
    });

    setupErrorHandling(copiedLayer);

    view.map.add(copiedLayer);
}

export function addImageryLayer(lObj, view) {
    let iLyr = new ImageryLayer({
        url: lObj.url,
        format: "lerc", // for possible client side rendering or pixelfilter
        popupEnabled: true
    });
    console.log("imageryLayer: ", iLyr);
    view.map.add(iLyr);
}

export function addTileLayer(lObj, view) {
    console.log(lObj.tileURL)
    let tLyr = new TileLayer({
        title: lObj.name,
        url: lObj.tileURL,
        legendEnabled: false, // hide from legend not honored in layer list...
        opacity: 0.6, // set opacity
        // TODO: revist scale level...seems like cacheNatLevel isn't synced with the feature layer scales.
        // TODO: revist scale for block group vs huc12 layers
        maxScale: 4622324
    });
    //tLyr.listMode = "hide"; // hide from layer list...or "hide-children"
    console.log(view.zoom);
    view.map.add(tLyr);
}

// TODO: look for the layer already in the view

// TODO: error catching / email broken layers
export function setupErrorHandling(errorObj) {
    errorObj.on("layerview-create-error", function (evt) {
        console.error("Failed to create layer: ", errorObj.title, ". Error is: ", evt.error.message, ". Details: ", evt.error.details);
        // TODO: alert messaging
    });
};

export function buildFSPopupTemp(lObj) {
    let pTemplate;
    // Add popup title data to the front of fieldInfos array
    let popupTitle = lObj.popup.title?.split(":");
    popupTitle[1] = popupTitle[1].replace('{', '').replace('}', '').trim();
    lObj.popup.fieldInfos.unshift({
        fieldName: popupTitle[1],
        label: popupTitle[0],
        visible: true
    });

    // Instantiate popup template 
    if (lObj.popup.fieldInfos != null) {
        pTemplate = new PopupTemplate({
            //title: lObj.name,
            overwriteActions: true,
            content: [
                {
                    type: 'text',
                    text: '<b>' + lObj.name + '<b>'
                },
                {
                    type: 'fields',
                    fieldInfos: lObj.popup.fieldInfos
                }]
        });
        return pTemplate
    }
}