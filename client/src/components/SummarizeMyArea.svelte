<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-shell-panel";
    import "@esri/calcite-components/dist/components/calcite-action";
    import "@esri/calcite-components/dist/components/calcite-tab-nav";
    import "@esri/calcite-components/dist/components/calcite-tabs";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-tab-title";
    import "@esri/calcite-components/dist/components/calcite-block";
    import "@esri/calcite-components/dist/components/calcite-icon";
    import "@esri/calcite-components/dist/components/calcite-segmented-control";
    import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
    import "@esri/calcite-components/dist/components/calcite-combobox";
    import "@esri/calcite-components/dist/components/calcite-combobox-item";
    import "@esri/calcite-components/dist/components/calcite-notice";
    import "@esri/calcite-components/dist/components/calcite-input-number";

    // Import from arcgis js api
    import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
    import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
    import Graphic from "@arcgis/core/Graphic";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

    // Import store and configuration
    import { smaConfig } from "../shared/smaConfig";
    import { addLayer, getEALayerObject } from "src/shared/utilities.js";
    import { geography } from "../store";

    export let view;

    let indicatorElem;
    $: indicatorValue = ''
    let nlcdYearCombobox;
    $: landcoverYear = null;
    let nlcdChange1Combo;
    $: nlcdChange1Combobox = '';
    let nlcdChange2Combo;
    $: nlcdChange2Combobox = '';
    let summaryUnitCombobox;
    let sumUnit = '';
    let geographyLabel = '';

    const indicatorsDict = [
        {name: "Land Cover", value: "nlcd"}, 
        {name: "Land Cover Change", value: "nlcd-change"}, 
        {name: "Permafrost Probability", value: "permafrost"}
    ]
    
    const updateIndicator = () => {
        //TODO: If indicator value is empty, remove sma indicator layer from map
        indicatorValue = indicatorElem.value
        console.log("sma indicator value is: ", indicatorValue);
        if (indicatorValue == 'permafrost') {
            $geography = 'Alaska'
            document.getElementById("Alaska-bookmark").click()
            _initIndicatorLayer(indicatorValue)
        } else if (indicatorValue = '') {
            removeIndicator()
        }
    };

    function removeIndicator() {
        // Remove existing indicator from map and set values to null
        let toRemove = view.map.layers.items?.filter(
            function (item) {
                return item.title.includes("Summarize My Area Indicator:");
            },
        );

        view.map.removeMany(toRemove);
    }

    // Store indicator year as view model value and add the appropriate raster to the map
    const updateLCYear = (e) => {
        console.log("event is: ", e);
        landcoverYear = e.target.value;
        if (landcoverYear) {
            console.log("target year is: ", e.target.value);
            // load the imagery on the map
            _initIndicatorLayer(indicatorValue);
        }
    };

    // Update LC Change inputs and add NLCD Year 2 to map
    const updateLCChangeYears = (e) => {
        console.log("event is: ", e);
        if (e.target.id == "nlcd-change-year-1") {
            nlcdChange1Combobox = e.target.value;
        }
        if (e.target.id == "nlcd-change-year-2") {
            nlcdChange2Combobox = e.target.value;
            _initIndicatorLayer(indicatorValue);
        }
        console.log("year1: ", nlcdChange1Combobox);
        console.log("year2: ", nlcdChange2Combobox);
    };

    // Add the appropriate raster to the map
    async function _initIndicatorLayer(indicator) {
        removeIndicator()
        // Make mosaic rule work for land cover and land cover change variables
        let mosaicRule = new MosaicRule({
            method: "lock-raster",
        });

        let indicatorUrl;

        switch (indicator) {
            case "nlcd":
                mosaicRule.lockRasterIds =
                    smaConfig.nlcd.OBJECTIDS[landcoverYear];
                indicatorUrl = smaConfig.nlcd.layer;
                break;
            case "nlcd-change":
                mosaicRule.lockRasterIds = [
                    smaConfig.nlcd.OBJECTIDS[nlcdChange1Combobox],
                    smaConfig.nlcd.OBJECTIDS[nlcdChange2Combobox],
                ];
                indicatorUrl = smaConfig.nlcd.layer;
            case "permafrost":
                let lObject = await getEALayerObject(552);
                // TODO: error handle if lObject is empty 
                console.log(lObject)
                lObject.name = "Summarize My Area Indicator: Near-surface permafrost probability";
                addLayer(lObject, view);
        }

        // //TODO: Fix legend appearance
        // const indicatorLayer = new ImageryLayer({
        //     url: indicatorUrl,
        //     mosaicRule: mosaicRule,
        //     id: `sma-${indicator}-layer`,
        //     noData: 0, // set no data params
        //     opacity: 0.6,
        //     title:
        //         "Summarize My Area Indicator: " +
        //         indicator + // TO DO: format
        //         ", " +
        //         landcoverYear,
        //     popupEnabled: false,
        // });

        // view.map.add(indicatorLayer);
    };

    // Store summary unit input as view model value
    const updateSumUnit = (e) => {
        // Remove existing summary unit geometry from map
        let toRemove = view.map.layers.items?.filter(
            function (item) {
                return item.title.includes("Summarize My Area Unit:");
            },
        );

        view.map.removeMany(toRemove);

        console.log("event is: ", e);
        sumUnit = e.target.value;
        console.log("sumUnit is ", sumUnit)
        //TODO: Add Draw functionality
        if (sumUnit != '') {
            _initGeometryLayer(sumUnit);
        } else {
            view.graphics.removeAll()
            geographyLabel = ''
        }
    };

    // Add summary unit geometry to the map based on configurations
    const _initGeometryLayer = (sumUnit) => {
        // Get unitMinScale, url, outfields from the smaConfig
        let unitMinScale = smaConfig.sum_units[`${sumUnit}`].minScale;
        let url = smaConfig.sum_units[`${sumUnit}`].url;
        let outfields = smaConfig.sum_units[`${sumUnit}`].outfields;

        let unitRenderer = new SimpleRenderer({
            symbol: new SimpleFillSymbol({
                color: [0, 0, 0, 0],
                outline: {
                    color: [255, 255, 255],
                    width: 1,
                }
            })
        });

        let geometryLayer = new FeatureLayer({
            url: url,
            opacity: 0.7,
            id: `${sumUnit}Layer`, //TODO: name id and title similar to indicator layer
            minScale: unitMinScale,
            title:
                "Summarize My Area Unit: " +
                smaConfig.sum_units[`${sumUnit}`].name,
            outFields: smaConfig.sum_units[`${sumUnit}`].outfields,
            renderer: unitRenderer
        });

        console.log(geometryLayer);
        view.map.add(geometryLayer);

        //TODO: Create zoom service message based on scale of layer...see lines 1250-1259 of old widget code

        // Add mapClickEvent functionality
        // Only propogate event when geometry layer is added
        reactiveUtils.on(
        () => view,
        "arcgisViewClick",
        async (e) => {
            const eMapPoint = e.detail.screenPoint;
            // Invoke option to only include graphics from geometryLayer in the hitTest
            const opts = {
                include: geometryLayer,
            };
            // The hitTest() checks to see if any graphics from the geometryLayer
            view.hitTest(eMapPoint, opts).then((res) => {
                if (res.results.length) {
                    view.graphics.removeAll()
                    let query = geometryLayer.createQuery();
                    query.geometry = res['results'][0].mapPoint;
                    query.outFields = outfields;
                    query.returnGeometry = true;
                    geometryLayer
                        .queryFeatures(query)
                        .then((result) => {
                            let geometry = result.features[0].geometry;
                            let geographyAttributes =
                                result.features[0].attributes;
                            buildGeographyLabel(geographyAttributes);
                            const symbol = new SimpleFillSymbol({
                                outline: {color: [23, 203, 232, 0.4], width: 2}
                            });
                            _addGraphicToMap(symbol, geometry);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            });
        });

        // Build string that displays attributes of the summary unit selection geography
        function buildGeographyLabel(geographyAttributes) {
            switch (sumUnit) {
                case "County":
                    geographyLabel =
                        geographyAttributes.CountyName +
                        ", " +
                        geographyAttributes.STATE_NAME;
                    break;
                case "Congressional District":
                    geographyLabel =
                        "Congressional District " +
                        geographyAttributes.STATE_ABBR +
                        geographyAttributes.DISTRICTID;
                    break;
                case "HUC-12":
                    geographyLabel =
                        geographyAttributes.HU_12_Name +
                        " (" +
                        geographyAttributes.HUC_12 +
                        ")";
                    break;
                case "HUC-8":
                    geographyLabel =
                        geographyAttributes.HU_8_Name +
                        " (" +
                        geographyAttributes.HUC8 +
                        ")";
                    break;
            }
        }
    };

    //TODO: Add buffer functionality

    //TODO: ClipLayer to Geometry
    // const _clipLayerToGeometry = (indicatorLayer, geometry) => {
    //     let renderingrule;

    //     const clipFunction = new RasterFunction();
    //     clipFunction.functionName = "Clip";
    //     clipFunction.outputPixelType = "U8";
    //     clipFunction.functionArguments = {
    //         ClippingGeometry: geometry,
    //         ClippingType: 1,
    //     };

    //     switch (this.indicator) {
    //         case "nlcd":
    //         case "nlcd-change":
    //         default:
    //             renderingrule = clipFunction;
    //             clipFunction.functionArguments.Raster = "$$";
    //             break;
    //     }

    //     indicatorLayer.setRenderingRule(renderingrule);
    //     var extent = geometry.getExtent();
    //     //this._customZoomExtent(extent);
    //     this.map.setExtent(extent, true);
    //     this.calculateButton.disabled = false;
    //     this.areaSelected = true;
    // };

    //TODO: Clear graphic from the map if a new one is clicked, or if the sum unit changes.

    const _addGraphicToMap = (symbol, geometry, isBuffer = false) => {
        const graphic = new Graphic({ geometry, symbol });
        // if (this.drawLayer.graphics.length > 0 && !isBuffer) {
        //     this.drawLayer.clear(); //clear graphic if needs be, so only 1 on map at a time
        // }

        view.graphics.add(graphic);

        // if (this.indicatorLayer) {
        //     this._clipLayerToGeometry(this.indicatorLayer, geometry);
        // }

        // if (this.layer) {
        //     this._clipLayer(geometry);
        // }
    };
</script>

<calcite-panel
    heading="Summarize My Area"
    data-panel-id="sma"
    hidden
    overlayPositioning="fixed"
>
    <calcite-button
        tabindex="0"
        role="button"
        width="full"
        slot="footer"
    >
        Calculate
    </calcite-button>
    <calcite-tabs layout="center">
        <calcite-tab-nav slot="title-group">
            <calcite-tab-title selected tab="selectionsTab">
                Select Layer Area
            </calcite-tab-title>
            <calcite-tab-title tab="resultsTab">Results</calcite-tab-title>
        </calcite-tab-nav>
        <calcite-tab selected tab="selectionsTab">
            <calcite-block open heading="Select an indicator">
                <calcite-icon scale="m" slot="icon" icon="number-circle-1"
                ></calcite-icon>
                <calcite-label layout="inline">
                    <calcite-combobox
                        scale="s"
                        placeholder-icon="calendar"
                        placeholder=" Select one"
                        selection-mode="single"
                        max-items="0"
                        overlay-positioning="absolute"
                        value="nlcd"
                        bind:this={indicatorElem}
                        on:calciteComboboxChange={updateIndicator}
                    >
                        {#each indicatorsDict as ind}
                            <calcite-combobox-item
                                value={ind.value}
                                heading={ind.name}
                            ></calcite-combobox-item>
                        {/each}
                    </calcite-combobox>
                </calcite-label>
                {#if indicatorValue == "nlcd"}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year:
                        <calcite-combobox
                            scale="s"
                            placeholder-icon="calendar"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            bind:this={nlcdYearCombobox}
                            on:calciteComboboxChange={updateLCYear}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcYear}
                                <calcite-combobox-item
                                    value={lcYear}
                                    heading={lcYear}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                {:else if indicatorValue == "nlcd-change"}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year 1:
                        <calcite-combobox
                            scale="s"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            id="nlcd-change-year-1"
                            bind:this={nlcdChange1Combo}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc1Year}
                                <calcite-combobox-item
                                    value={lcc1Year}
                                    heading={lcc1Year}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                    <calcite-label layout="inline" scale="s">
                        NLCD Year 2:
                        <calcite-combobox
                            scale="s"
                            placeholder-icon="calendar"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            id="nlcd-change-year-2"
                            bind:this={nlcdChange2Combo}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc2Year}
                                <calcite-combobox-item
                                    value={lcc2Year}
                                    heading={lcc2Year}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                {/if}
            </calcite-block>
            <calcite-block open heading="Select a summary unit">
                <calcite-icon scale="m" slot="icon" icon="number-circle-2"
                ></calcite-icon>
                <calcite-label layout="inline">
                    <calcite-combobox
                        scale="s"
                        placeholder-icon="calendar"
                        placeholder=" Select one"
                        selection-mode="single"
                        overlay-positioning="fixed"
                        bind:this={summaryUnitCombobox}
                        on:calciteComboboxChange={updateSumUnit}
                    >
                        {#each ["County", "Congressional District", "HUC-8", "HUC-12", "Draw a point", "Draw a line", "Draw an area"] as sumUnit}
                            <calcite-combobox-item
                                value={sumUnit}
                                heading={sumUnit}
                            ></calcite-combobox-item>
                        {/each}
                    </calcite-combobox>
                </calcite-label>
                {#if sumUnit == "Draw a point" || sumUnit == "Draw a line" || sumUnit == "Draw an area"}
                    <calcite-label layout="inline" scale="s"
                        >Buffer distance:
                        <calcite-input-number
                            min="0"
                            placeholder="0.5"
                            step="1"
                            scale="s"
                            number-button-type="vertical"
                        ></calcite-input-number>
                    </calcite-label>
                {/if}
            </calcite-block>
            <calcite-block open heading="Select your geography">
                <calcite-icon scale="m" slot="icon" icon="number-circle-3"
                ></calcite-icon>
                {#if sumUnit == "HUC-8" || sumUnit == "HUC-12"}
                    <calcite-notice
                        open
                        icon="exclamation-mark-triangle"
                        kind="danger"
                    >
                        <div slot="message">Zoom in to see HUC boundaries</div>
                    </calcite-notice>
                {/if}
                {#if geographyLabel}
                    <calcite-notice open kind="success">
                        <div slot="message">{geographyLabel}</div>
                    </calcite-notice>
                {/if}
            </calcite-block>
        </calcite-tab>
        <calcite-tab tab="resultsTab">
            <calcite-notice icon="car" open>
                <div slot="message">Results!</div>
            </calcite-notice>
        </calcite-tab>
    </calcite-tabs>
</calcite-panel>

<style>
    calcite-block {
        margin-left: 2px;
        margin-right: 2px;
    }

    calcite-tab {
        overflow: hidden;
    }
</style>
