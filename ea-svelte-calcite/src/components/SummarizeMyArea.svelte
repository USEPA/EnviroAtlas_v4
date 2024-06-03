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
    import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";

    // Import store and configuration
    import { smaViewModel, smaInputs, viewState, resetSMA } from "src/store";
    import { smaConfig } from "../shared/smaConfig";

    // Store indicator inputs as view model values
    const updateIndicator = (e) => {
        //console.log("event is: ", e);
        e.target.value == "nlcd"
            ? ($smaViewModel.indicator = "nlcd")
            : ($smaViewModel.indicator = "nlcd-change");
        //console.log("view model indicator value is: ", $smaViewModel.indicator);
    };

    // Store indicator year as view model value and add the appropriate raster to the map
    const updateLCYear = (e) => {
        console.log("event is: ", e);
        $smaViewModel.landcoverYear = e.target.value;
        if ($smaViewModel.landcoverYear) {
            console.log("target year is: ", e.target.value);
            console.log(
                "target year from VM is: ",
                $smaViewModel.landcoverYear,
            );
            // load the imagery on the map
            _initIndicatorLayer($smaViewModel.indicator);
        }
    };

    // Update LC Change inputs and add NLCD Year 2 to map
    const updateLCChangeYears = (e) => {
        console.log("event is: ", e);
        if (e.target.id == "nlcd-change-year-1") {
            $smaViewModel.nlcdChange1Combobox = e.target.value;
        }
        if (e.target.id == "nlcd-change-year-2") {
            $smaViewModel.nlcdChange2Combobox = e.target.value;
            _initIndicatorLayer($smaViewModel.indicator);
        }
        console.log("year1: ", $smaViewModel.nlcdChange1Combobox);
        console.log("year2: ", $smaViewModel.nlcdChange2Combobox);
    };

    // Add the appropriate raster to the map
    const _initIndicatorLayer = (indicator) => {
        // Remove existing indicator from map and set values to null
        let toRemove = $viewState.view.map.layers.items?.filter(
            function (item) {
                return item.title.includes("Summarize My Area Indicator:");
            },
        );

        $viewState.view.map.removeMany(toRemove);

        // Make mosaic rule work for land cover and land cover change variables
        let mosaicRule = new MosaicRule({
            method: "lock-raster",
        });

        let indicatorUrl;

        switch (indicator) {
            case "nlcd":
                mosaicRule.lockRasterIds =
                    smaConfig.nlcd.OBJECTIDS[$smaViewModel.landcoverYear];
                indicatorUrl = smaConfig.nlcd.layer;
                break;
            case "nlcd-change":
                mosaicRule.lockRasterIds = [
                    smaConfig.nlcd.OBJECTIDS[$smaViewModel.nlcdChange1Combobox],
                    smaConfig.nlcd.OBJECTIDS[$smaViewModel.nlcdChange2Combobox],
                ];
                indicatorUrl = smaConfig.nlcd.layer;
        }

        //TODO: Fix legend appearance
        const indicatorLayer = new ImageryLayer({
            url: indicatorUrl,
            blendMode: "multiply",
            format: "jpg",
            mosaicRule: mosaicRule,
            id: `sma-${indicator}-layer`,
            noData: 0, // set no data params
            opacity: 0.5,
            title:
                "Summarize My Area Indicator: " +
                $smaViewModel.indicator + // TO DO: format
                " , " +
                $smaViewModel.landcoverYear,
            popupTemplate: {
                // TODO: Classify popup by color / name
                title: "{Raster.ItemPixelValue}",
                fieldInfos: [
                    {
                        fieldName: "Raster.ItemPixelValue",
                        format: {
                            places: 2,
                            digitSeparator: true,
                        },
                    },
                ],
            },
        });

        $viewState.view.map.add(indicatorLayer);
    };

    // Store summary unit input as view model value
    const updateSumUnit = (e) => {
        // Remove existing summary unit geometry from map
        let toRemove = $viewState.view.map.layers.items?.filter(
            function (item) {
                return item.title.includes("Summarize My Area Unit:");
            },
        );

        $viewState.view.map.removeMany(toRemove);

        console.log("event is: ", e);
        $smaViewModel.sumUnit = e.target.value;
        console.log("Input sumUnit: ", $smaInputs.summaryUnitCombobox);
        console.log("VM sumUnit: ", $smaViewModel.sumUnit);

        //TODO: Add Draw functionality

        _initGeometryLayer($smaViewModel.sumUnit);
    };

    // Add summary unit geometry to the map based on configurations
    const _initGeometryLayer = (sumUnit) => {
        let unitMinScale = smaConfig.sum_units[`${sumUnit}`].minScale;
        let url = smaConfig.sum_units[`${sumUnit}`].url;

        let unitSymbol = new SimpleLineSymbol({
            color: [0, 0, 0],
            width: 1,
            style: "solid",
        });

        let unitRenderer = new SimpleRenderer({
            symbol: unitSymbol,
            label: `${sumUnit}`,
        });

        let geometryLayer = new FeatureLayer({
            url: url,
            opacity: 0.5,
            id: `${sumUnit}Layer`, //TODO: name id and title similar to indicator layer
            minScale: unitMinScale,
            title:
                "Summarize My Area Unit: " + smaConfig.sum_units[`${sumUnit}`].name,
            outFields: smaConfig.sum_units[`${sumUnit}`].outfields,
            renderer: unitRenderer,
        });

        console.log(geometryLayer);
        $viewState.view.map.add(geometryLayer);

        //TODO: Create zoom service message based on scale of layer...see lines 1250-1259 of old widget code

        console.log("initiate geometry: ", sumUnit);
        console.log("initiate geometry unitMinScale: ", unitMinScale);
        console.log("initiate geometry url: ", url);
    };

    //TODO: Add mapClickEvent functionality

    //TODO: Add buffer functionality

    //TODO: ClipLayer to Geometry

    export const handlePanelClose = function (e) {
        const target = e.target;
        const shellElement = target.parentElement;
        shellElement.collapsed = !shellElement.collapsed;
        document.querySelector('[data-action-id="summarize-my-area"]').active =
            false;
    };

    // TODO: handle resets
    const resetSMAInputs = () => {
        resetSMA();
    };
</script>

<calcite-panel
    heading="Summarize My Area"
    data-panel-id="summarize-my-area"
    hidden
    closable
    overlayPositioning="fixed"
    on:calcitePanelClose={handlePanelClose}
>
    <calcite-action icon="information" text="Favorite" slot="header-actions-end"
    ></calcite-action>
    <calcite-button
        round
        width="half"
        slot="footer"
        on:click={resetSMAInputs}
        on:keypress={resetSMAInputs}
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
                <calcite-segmented-control
                    width="full"
                    scale="s"
                    on:calciteSegmentedControlChange={updateIndicator}
                >
                    <calcite-segmented-control-item
                        bind:this={$smaInputs.landcover}
                        role="radio"
                        aria-checked="true"
                        checked
                        value="nlcd">Land Cover</calcite-segmented-control-item
                    >
                    <calcite-segmented-control-item
                        bind:this={$smaInputs.landcoverChange}
                        role="radio"
                        aria-checked="true"
                        value="nlcd-change"
                        >Land Cover Change</calcite-segmented-control-item
                    >
                </calcite-segmented-control>
                <br />
                {#if $smaViewModel.indicator == "nlcd"}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year:
                        <calcite-combobox
                            scale="s"
                            placeholder-icon="calendar"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            bind:this={$smaInputs.nlcdYearCombobox}
                            on:calciteComboboxChange={updateLCYear}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcYear}
                                <calcite-combobox-item
                                    value={lcYear}
                                    text-label={lcYear}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                {:else}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year 1:
                        <calcite-combobox
                            scale="s"
                            placeholder-icon="calendar"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            id="nlcd-change-year-1"
                            bind:this={$smaInputs.nlcdChange1Combobox}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc1Year}
                                <calcite-combobox-item
                                    value={lcc1Year}
                                    text-label={lcc1Year}
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
                            bind:this={$smaInputs.nlcdChange2Combobox}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc2Year}
                                <calcite-combobox-item
                                    value={lcc2Year}
                                    text-label={lcc2Year}
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
                        max-items="0"
                        overlay-positioning="absolute"
                        bind:this={$smaInputs.summaryUnitCombobox}
                        on:calciteComboboxChange={updateSumUnit}
                    >
                        {#each ["County", "Congressional District", "HUC-8", "HUC-12", "Draw a point", "Draw a line", "Draw an area"] as sumUnit}
                            <calcite-combobox-item
                                value={sumUnit}
                                text-label={sumUnit}
                            ></calcite-combobox-item>
                        {/each}
                    </calcite-combobox>
                </calcite-label>
                {#if $smaViewModel.sumUnit == "Draw a point" || $smaViewModel.sumUnit == "Draw a line" || $smaViewModel.sumUnit == "Draw an area"}
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
                <calcite-notice
                    open
                    icon="exclamation-mark-triangle"
                    kind="danger"
                >
                    <div slot="message">Zoom in to see HUC boundaries</div>
                </calcite-notice>
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
