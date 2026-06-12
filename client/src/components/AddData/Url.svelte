<script>
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
    import PopupTemplate from '@arcgis/core/PopupTemplate';
    import FieldsContent from '@arcgis/core/popup/content/FieldsContent';
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
    import FieldInfo from '@arcgis/core/popup/FieldInfo';

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-label";
    import "@esri/calcite-components/dist/components/calcite-input-text";
    import "@esri/calcite-components/dist/components/calcite-icon";
    import "@esri/calcite-components/dist/components/calcite-tooltip";

    import { addAlertMessage } from "src/shared/addLayers.ts";
    import { openRightPanel, isLayerUrlInMap, isImageService, addImageryLayer } from "../../shared/utilities";
    import { activeWidget } from "src/store.ts";
    

    export let view;
    export let isHidden = true;

    let urlPanel;
    let addLayerInput;
    let url;

    //TODO: Add some loading indicator to the panel when layers are slow

    function getAddLayerURL() {
        if (!addLayerInput) return;
        let dataUrl = addLayerInput.value;
        urlPanel.loading = true;
        processDataUrl(dataUrl);
        urlPanel.loading = false;
    }

    // Reads a URL and imports the layers available from the URL, if applicable
    function processDataUrl(dataUrl) {
        if (dataUrl === undefined || dataUrl === null || dataUrl.trim().length == 0) {
            addAlertMessage('Data URL is invalid. ', 'Enter a valid URL.');
            return;
        }
        try {
            let parsedUrl = new URL(dataUrl);
        } catch (error) {
            addAlertMessage('Data URL is invalid. ', 'Enter a valid URL.');
            console.log(error);
            return
        }
        
        let drawCheck = isLayerUrlInMap(url, view);
        if (drawCheck) {
            addAlertMessage(
                "",
                "This layer is already in the map: " + url,
                "warning",
                "Layer is already in the map",
            );
        } else {
            let featureServerTest = /\/FeatureServer\d*/gi;
            let mapServerTest = /\/MapServer/gi;
            if (featureServerTest.test(dataUrl) === true) {
                // feature server URL
                var copiedLayer = new FeatureLayer({
                    url: dataUrl,
                    outFields: ['*']
                });
                copiedLayer.on('layerview-create', function () {
                    var fieldInfos = copiedLayer.fields.map(function (field) {
                        return new FieldInfo({
                            fieldName: field.name,
                            label: field.alias,
                            visible: true,
                        });
                    });
                    var template = new PopupTemplate({
                        title: copiedLayer?.title,
                        content: [new FieldsContent({
                            fieldInfos: fieldInfos,
                        })]
                    });
                    copiedLayer.popupTemplate = template;
                });
                view?.map.add(copiedLayer);

                view?.whenLayerView(copiedLayer).then((layerView) => {
                    // If loading, open the layer list.
                    if ($activeWidget.right !== "layers") {
                        openRightPanel($activeWidget, "layers");
                    }
                    copiedLayer.queryExtent().then((res) => {
                        res.extent ? view.goTo(res.extent, { duration: 4000 }) : null
                    })
                    reactiveUtils.whenOnce(() => !layerView.updating)
                    .then(() => {
                        // If adds successfully, add a success message
                        addAlertMessage(
                            "",
                            "Layer added to the map: " + copiedLayer.title,
                            "success",
                            "Success!",
                        );
                    }).catch((e) => {
                        console.error(e?.message ?? e);
                        addAlertMessage(
                            "Something went wrong",
                            "Failed to add layer to map: " + (e?.message ?? e)
                        );
                    });
                });
            } else if (mapServerTest.test(dataUrl) === true) {
                // map server URL
                let copiedMapLayer = new MapImageLayer();
                // If map layer ID is present, add it to the sublayers
                if (dataUrl.match(/\d+$/)) {
                    const maplayerId = parseInt(dataUrl.match(/\d+$/)[0], 10);
                    copiedMapLayer = new MapImageLayer({
                        url: dataUrl.replace(/\d+$/, ''),
                        sublayers: [{
                            id: maplayerId,
                            visible: true,
                        }]
                    });
                } else {
                    copiedMapLayer = new MapImageLayer({
                        url: dataUrl
                    });
                }
                copiedMapLayer.on('layerview-create', function () {
                    // Set up popup template for each sublayer
                    copiedMapLayer.sublayers?.forEach(function (sublayer) {
                        sublayer.load().then(function () {
                            sublayer.popupEnabled = true;
                            var fieldInfos = sublayer.fields.map(function (field) {
                                return new FieldInfo({
                                    fieldName: field.name,
                                    label: field.alias,
                                    visible: true,
                                });
                            });
                            var template = new PopupTemplate({
                                title: sublayer?.title,
                                content: [new FieldsContent({
                                    fieldInfos: fieldInfos,
                                })]
                            });
                            sublayer.popupTemplate = template;
                        });
                    });
                });
                view?.map.add(copiedMapLayer);
                                
                view?.whenLayerView(copiedMapLayer).then((layerView) => {
                    // If loading, open the layer list.
                    if ($activeWidget.right !== "layers") {
                        openRightPanel($activeWidget, "layers");
                    }
                    copiedMapLayer.queryExtent().then((res) => {
                        res.extent ? view.goTo(res.extent, { duration: 4000 }) : null
                    })
                    reactiveUtils.whenOnce(() => !layerView.updating)
                    .then(() => {
                        // If adds successfully, add a success message
                        addAlertMessage(
                            "",
                            "Layer added to the map: " + copiedMapLayer.title,
                            "success",
                            "Success!",
                        );
                    }).catch((e) => {
                        console.error(e?.message ?? e);
                        addAlertMessage(
                            "Something went wrong",
                            "Failed to add layer to map: " + (e?.message ?? e)
                        );
                    });
                });
            } else if (isImageService(dataUrl) === true) {
                let iLyr = addImageryLayer({"url": url}, view)
                view?.whenLayerView(iLyr).then((layerView) => {
                    // If loading, open the layer list.
                    if ($activeWidget.right !== "layers") {
                        openRightPanel($activeWidget, "layers");
                    }
                    const goToTarget = iLyr.fullExtent
                    goToTarget ? view.goTo(goToTarget.extent, { duration: 4000 }) : null
                    
                    reactiveUtils.whenOnce(() => !layerView.updating)
                    .then(() => {
                        // If adds successfully, add a success message
                        addAlertMessage(
                            "",
                            "Layer added to the map: " + iLyr.title,
                            "success",
                            "Success!",
                        );
                    }).catch((e) => {
                        console.error(e?.message ?? e);
                        addAlertMessage(
                            "Something went wrong",
                            "Failed to add layer to map: " + (e?.message ?? e)
                        ); 
                    });
                });
            } else {
                addAlertMessage('Data URL is invalid. ', 'Enter a valid URL.');
            }
        }
    }
</script>

<calcite-panel bind:this={urlPanel} hidden={isHidden}>
<div style="padding:8px; border-top: 1px solid #dedede; background-color:white">
<calcite-label scale="m" layout="inline">
    <strong>Service URL</strong>
    <calcite-icon
        id="service-url-required"
        class="required"
        icon="bullet-point"
        scale="s"
    ></calcite-icon>
    <calcite-tooltip reference-element="service-url-required"
        >Required</calcite-tooltip
    >
</calcite-label>
<calcite-input-text
    clearable
    bind:this={addLayerInput}
    required="true"
    placeholder="Enter service url"
    scale="m"
    on:calciteInputTextChange={function (e) {
        url = e.target.value;
    }}
    value={url}
>
    <calcite-button
        slot="action"
        scale="m"
        on:keydown={() => {
            getAddLayerURL();
        }}
        on:click={() => {
            getAddLayerURL();
        }}>Add</calcite-button
    >
</calcite-input-text>
</div>
</calcite-panel>

<style>
    calcite-icon.required {
        --calcite-ui-icon-color: var(--calcite-ui-danger);
    }
</style>
