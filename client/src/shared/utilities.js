import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer"
import PopupTemplate from "@arcgis/core/PopupTemplate";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction";


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
    // Look for the layer already in the view
    // TODO: find a way to check this before sending request to API for lyrObject?
    if (isLayerInMap(lObj.url, view)) {
        console.log("Layer is already in map!")
        return 
    }
    console.log(lObj);
    if (isFeatureorMapService(lObj.url)) {
        addFeatureLayer(lObj, view)
    }
    if (lObj.tileLink === 'yes') {
        addTileLayer(lObj, view)
    }
    if (isImageService(lObj.url)) {
        if (lObj.tileLink == 'renderer') {
            console.log('render this!')
            let rfRule = new RasterFunction({
                functionName: lObj.tileURL
            })
            addImageryLayer(lObj, view, rfRule)
        } else {
            addImageryLayer(lObj, view)
        }
    }
    // TODO: Add EA Boundaries and locations when community data is added to the map
    // Maybe don't have to do this if EA is dropping Community data from the app?
};

// Boolean test for Feature or Map service type
export function isFeatureorMapService(url) {
    let match = url.substring(url.lastIndexOf('/') + 1);
    return match === 'FeatureServer' || match === 'MapServer'
}

// Boolean test for Image service type
export function isImageService(url) {
    return url.substring(url.lastIndexOf('/') + 1) === 'ImageServer'
}

export function isLayerInMap(url, view) {
    const foundLayer = view.map.allLayers.find(function(lyr) {
        // TODO: For RFTs, the url may be the same, but the viz will be different, 
        // so will need to update this helper function
        return lyr.url === url
    });
    return foundLayer
}

export function removeLayer(lyrName, view) {
    const foundLyr = view.map.allLayers.filter(function(layer) {
        return layer.title === lyrName;
    });
    if (foundLyr != undefined) {
        view.map.removeAll(foundLyr);
    };         
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
        // This is a workaround not having serviceType='dynamic' from API
        // TODO: Update serviceType with data in DB
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

// export function renderFloodplainNLCD(url, pixSize, fpID, lcID){
//     let riparianRemap = new RasterFunction({
//         functionName: "Remap",
//         functionArguments: {
//             inputRanges: [1, 5],
//             outputValues: [1],
//             NoDataRanges: [0, 0],
//             raster: "$" + fpID, //$# is the image # in the service
//         },
//     });

//     let nlcdRemap = new RasterFunction({
//         functionName: "Remap",
//         functionArguments: {
//             inputRanges: [0,11,11,12,12,21,21,31,31,41,41,42,42,43,43,52,52,71,71,81,81,82,82,90,90,95,95,96],
//             outputValues: [0,11,12,0,31,41,42,43,52,71,81,82,90,95],
//             NoDataRanges: [0, 0],
//             raster: "$" + lcID,
//         }
//     });

//     let riparianNLCD = new RasterFunction({
//         functionName: "Arithmetic",
//         functionArguments: {
//             Raster: riparianRemap,
//             Raster2: nlcdRemap,
//             Operation: "3",
//         }
//     });

//     let colorRft = new RasterFunction({
//         functionName: "Colormap",
//         functionArguments: {
//             Colormap: [
//                 [11, 92,138,194],
//                 [12, 250,250,253],
//                 [31, 240,233,235],
//                 [41, 130,197,135],
//                 [42, 103,134,94],
//                 [43, 90,164,119],
//                 [52, 242,219,192],
//                 [71, 252,242,205],
//                 [81, 240,237,169],
//                 [82, 253,253,172],
//                 [90, 169,221,185],
//                 [95, 199,236,229]
//             ],
//             raster: riparianNLCD
//         }
//     });

//     return colorRft
// }

export function addImageryLayer(lObj, view, rfRule) {
    console.log(rfRule)
    let iLyr = new ImageryLayer({
        url: lObj.url,
        format: "lerc", // for possible client side rendering or pixelfilter
        popupEnabled: true,
        opacity: 0.6,
        title: lObj.name
    }); 
    if (rfRule) {
        iLyr.rasterFunction = rfRule
    }
    iLyr.popupTemplate = { title: lObj.name, content: "{Raster.ServicePixelValue.Raw}" }
    console.log("imageryLayer: ", iLyr);
    view.map.add(iLyr);
}

export function addTileLayer(lObj, view) {
    // console.log(lObj)
    // Scale for block group vs huc12 layers
    let mxScale = lObj.sourceType == "cbg" ? 577790 : 4622324;
    let tLyr = new TileLayer({
        title: lObj.name,
        url: lObj.tileURL,
        legendEnabled: false, // hide from legend not honored in layer list...
        opacity: 0.6, // set opacity
        // TODO: revist scale level...seems like cacheNatLevel isn't synced with the feature layer scales.
        maxScale: mxScale
    });
    tLyr.listMode = "hide"; // hide from layer list...or "hide-children"
    //console.log(view.zoom);
    view.map.add(tLyr);
}

// TODO: error catching / email broken layers
export function setupErrorHandling(errorObj) {
    errorObj.on("layerview-create-error", function (evt) {
        console.error("Failed to create layer: ", errorObj.title, ". Error is: ", evt.error.message, ". Details: ", evt.error.details);
        // TODO: alert messaging
    });
};

// TODO: build popup template without the DB popup json object? 
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

export function expandTopics(expand = true) {
    const ids = ["ESB", "PSI", "PBS", "BNF"]
    ids.forEach(id => {
        document.querySelectorAll(`calcite-list-item#${id}`).forEach(elem => {
            if (expand) {
                elem.setAttribute("expanded", "")
            } else {
                elem.removeAttribute("expanded")
            }
        });
    });
};