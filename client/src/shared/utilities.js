import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer"
import PopupTemplate from "@arcgis/core/PopupTemplate";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction";


export let view;

export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// When Add to Map button is clicked, get object from the mapping config
export function getEALayerObject(id) {
    // use api to fetch layer object
    let layerParams = {
        //TODO: where did type go?
        //TODO: test out using code like, select = JSON.stringify( {layerID:1,name:1,etc etc} )
        select: encodeURIComponent(`{"layerID":1,"name":1,"lyrNum":1,"popup":1,"renderer":1,"type":1,"url":1,"serviceType":1,"sourceType":1}`)
    }
    let lObj = getEaData(`/ea/api/layers/${id}`, layerParams)
    return lObj
}

// Generic ea api call function
export async function getEaData(url, params) {
    //TODO: check if params is string or object
    //TODO: if object, JSON.stringify
    let paramText = '';
    for (const [key] of Object.entries(params)) {
        paramText += `${key}=${params[key]}&`
    }
    let constructedUrl = `${url}?${paramText.slice(0, -1)}`;
    try {
        let res = await fetch(constructedUrl);
        return await res.json()
    } catch (e) {
        console.error("Error fetching data: ", e)
    }
};

export function addLayer(lObj, view, index) {
    // Look for the layer already in the view
    if (isLayerUrlInMap(lObj.url, view)) {
        if (isLayerTitleInMap(lObj.name, view)) {
            console.log("Layer is already in map!")
            return 
        }
    }
    console.log(lObj);
    if (isFeatureorMapService(lObj.url)) {
        addFeatureLayer(lObj, view)
    }
    if (lObj.tileLink === 'yes') {
        addTileLayer(lObj, view)
    }
    if (isImageService(lObj.url)) {
        if (lObj.renderer) {
            console.log('render this!')
            let rfRule = new RasterFunction({
                functionName: lObj.renderer
            })
            addImageryLayer(lObj, view, rfRule, index)
        } else {
            addImageryLayer(lObj, view, null, index)
        }
    }
};

/** 
 * Boolean test for Feature or Map service type
 * @param {string} url
 * @return {boolean} Is the url an Feature or Map Service?
 */
export function isFeatureorMapService(url) {
    let match = url.substring(url.lastIndexOf('/') + 1);
    return match === 'FeatureServer' || match === 'MapServer'
};

/** 
 * Boolean test for Image service type
 * @param {string} url
 * @return {boolean} Is the url an Image Service?
 */
export function isImageService(url) {
    return url.substring(url.lastIndexOf('/') + 1) === 'ImageServer'
};

/**
 * Boolean test for object with undefined values
 * @param {Object} obj
 * @return {boolean} Does object have undefined value?
 */
export function hasValueUndefined(obj) {
    return Object.values(obj).some(value => value.value === undefined)
};

/** 
 * Returns largest absolute value of two numbers
 * @param {number} num1
 * @param {number} num2
 * @returns {number} largest absolute value of num1, num2
*/
export function largestAbsVal(num1, num2) {
    return Math.max(Math.abs(num1), Math.abs(num2))
};

export function isLayerUrlInMap(url, view) {
    const foundLayer = view.map.allLayers.find(function(lyr) {
        // TODO: For RFTs, the url may be the same, but the viz will be different, 
        // so will need to update this helper function
        return lyr.url === url
    });
    return foundLayer
};

export function isLayerTitleInMap(title, view) {
    const foundLayer = view.map.allLayers.find(function(lyr) {
        return lyr.title === title
    });
    return foundLayer
};

export function findLayersByTitle(view, title) {
    const foundLayers = view.map.allLayers.findIndex(function(lyr, index, lyrs) {
        if (lyr.title && lyr.title.includes(title)) {
            return index
        }
    });
    return foundLayers
}

/**
 * Remove the layer(s) from map based on the title.
 * @param {string} lyrName 
 * @param {object} view 
 */
export function removeLayer(lyrName, view) {
    const foundLyr = view.map.allLayers.filter(function(layer) {
        return layer.title === lyrName;
    });
    if (foundLyr) {
        foundLyr.forEach((lyr) => {
            view.map.remove(lyr);
        }) 
    };         
};

export function addFeatureLayer(lObj, view) {
    const url = Object.hasOwn(lObj, 'lyrNum') ? `${lObj.url}/${~~lObj.lyrNum}` : lObj.url;
    console.log(url);
    // feature server URL
    var copiedLayer = new FeatureLayer({
        url,
        title: lObj.name,
        //opacity: 0.6,
    });

    if (lObj.renderer === "simpleFill") {
        let simpleFill = {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                //color: [ 255, 128, 0, 0.5 ],
                outline: {  // autocasts as new SimpleLineSymbol()
                    width: 1,
                    color: "white"
                }
            }
        };
        copiedLayer.renderer = simpleFill
    }

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
            view.map.remove(copiedLayer);
            let miLyr = new MapImageLayer({
                url: lObj.url,
                title: lObj.name
            });
            view.map.add(miLyr);
        }
    });

    setupErrorHandling(copiedLayer);

    view.map.add(copiedLayer);
};

//TODO: options object?
export function addImageryLayer(lObj, view, rfRule, index) {
    let iLyr = new ImageryLayer({
        url: lObj.url,
        format: "lerc", // for possible client side rendering or pixelfilter
        popupEnabled: true,
        //opacity: 0.6,
    }); 
    if (lObj.name) {
        iLyr.title = lObj.name
        if (!lObj.name.includes("Summarize My Area")) {
            iLyr.popupTemplate = { content: '<b>' + lObj.name + '</b><br/>' + "{Raster.ServicePixelValue.Raw}" }
        }
    } else {
        iLyr.popupTemplate = { content: "{Raster.ServicePixelValue.Raw}" }
    }
    if (rfRule) {
        iLyr.rasterFunction = rfRule
    }
    view.map.add(iLyr, index);
    view.whenLayerView(iLyr).then((layerView) => {
        layerView.highlightOptions = {
            color: [0,0,0,0],
            haloOpacity: 0, 
            fillOpacity: 0
        }
    }) 
    return iLyr
};

export function addTileLayer(lObj, view) {
    // Scale for block group vs huc12 layers
    let mxScale = lObj.sourceType == "cbg" ? 577790 : 4622324;
    let tLyr = new TileLayer({
        title: lObj.name,
        url: lObj.tileURL,
        legendEnabled: false, // hide from legend not honored in layer list...
        //opacity: 0.6,
        // TODO: revist scale level...seems like cacheNatLevel isn't synced with the feature layer scales.
        maxScale: mxScale
    });
    tLyr.listMode = "hide"; // hide from layer list...or "hide-children"
    //console.log(view.zoom);
    view.map.add(tLyr);
};

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
    popupTitle[1] = popupTitle[1]?.replace('{', '').replace('}', '').trim();
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
                    text: '<b>' + lObj.name + '</b>'
                },
                {
                    type: 'fields',
                    fieldInfos: lObj.popup.fieldInfos
                }]
        });
        return pTemplate
    }
}

/** 
 * Expand or collapse the topic headers in the data catalog.
 * @param {boolean} expand - default is true
 */
export function expandTopics(expand = true) {
    const ids = ["ESB", "PSI", "PBS", "BNF"]
    ids.forEach(id => {
        document.querySelectorAll(`calcite-list-item#${id}`).forEach(elem => {
            expand ? elem.setAttribute("expanded", "") : elem.removeAttribute("expanded")   
        });
    });
};

/**
 * Opens Layer List widget and closes others on right side, if applicable.
 * Used when data is added to the map.
 * @param {object} activeWidget - this value comes from the store
 * @param {string} dataPanelToOpen - this data panel id string will select the panel to open
 */
export function openRightPanel(activeWidget, dataPanelToOpen) {
    let shell = document.querySelector(`[component-id="shell-panel-end"]`);
    let layerPanel = document.querySelector(`[data-panel-id="${dataPanelToOpen}"]`)
    let targetFab = document.querySelector(`[id=${dataPanelToOpen}-fab]`);
    let rightExpand = document.querySelector(`[id=expand-right]`);
    // Given the right side panel is closed, when Add to map is clicked, 
    // the right side panel opens with the layer list visible
    if (!activeWidget.right) {
        layerPanel.removeAttribute("hidden");
        layerPanel.removeAttribute("closed");
        shell.removeAttribute("collapsed");
        targetFab.hidden = !targetFab.hidden;
        rightExpand.hidden = !rightExpand.hidden;
        activeWidget.right = dataPanelToOpen;
        document.querySelector(`[data-action-id=${activeWidget.right}]`).active = true;
    } else if (activeWidget.right !== dataPanelToOpen) {
        // Given the right side panel is open, when Add to map is clicked, 
        // the right side panel remains open and has layer list visible
        layerPanel.removeAttribute("hidden");
        layerPanel.removeAttribute("closed");
        document.querySelector(`[data-action-id=${activeWidget.right}]`).active = false;
        document.querySelector(`[data-panel-id=${activeWidget.right}]`).hidden = true;
        document.querySelector(`[data-panel-id=${activeWidget.right}]`).closed = true;
        document.querySelector(`[id=${activeWidget.right}-fab]`).hidden = true;
        activeWidget.right = dataPanelToOpen;
        document.querySelector(`[data-action-id=${activeWidget.right}]`).active = true;
        targetFab.hidden = !targetFab.hidden
        shell.removeAttribute("collapsed");
    }
};

export function isStringNotEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Open the information modal. Right now just the SMAT.
 */
export function openInfo() {
    document.querySelector(`[id=info-modal]`).open = true;
}