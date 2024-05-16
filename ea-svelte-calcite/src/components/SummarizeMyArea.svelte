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
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";

    // Import store and configuration
    import { smaViewModel, smaInputs, viewState } from "src/store";
    import { smaConfig } from "../shared/smaConfig";

    // Store indicator inputs as view model values
    const updateIndicator = (e) => {
        console.log("event is: ", e);
        if (e.target.value == "nlcd") {
            $smaViewModel.indicator = "nlcd";
        } else {
            $smaViewModel.indicator = "nlcd-change";
        }
        console.log("view model indicator value is: ", $smaViewModel.indicator);
    };

    // Store indicator inputs as view model values and add the appropriate raster to the map 
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
            _initLayers($smaViewModel.indicator);
        }
    };

    // TO DO: update LC Change inputs and _initLayers to add the year to map  

    // Add the appropriate raster to the map
    const _initLayers = (indicator) => {

        // remove existing indicator from map and set values to null
        let toRemove = $viewState.view.map.layers.items?.filter(
            function (item) {
                return item.title.includes("Summarize My Area:");
            },
        );
        console.log(toRemove);
        $viewState.view.map.removeMany(toRemove);

        let mosaicRule = new MosaicRule({
            method: "lock-raster",
            lockRasterIds: [
                smaConfig.nlcd.OBJECTIDS[$smaViewModel.landcoverYear],
            ],
        });

        let indicatorUrl = smaConfig.nlcd.layer;

        const indicatorLayer = new ImageryLayer({
            url: indicatorUrl,
            blendMode: "multiply",
            format: "jpg",
            mosaicRule: mosaicRule,
            id: `sma-${indicator}-layer`,
            noData: 0, // set no data params
            opacity: 0.5,
            title:
                "Summarize My Area: " +
                $smaViewModel.indicator + // TO DO: format
                " , " +
                $smaViewModel.landcoverYear,
            popupTemplate: {
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

    export const handlePanelClose = function (e) {
        const target = e.target;
        const shellElement = target.parentElement;
        shellElement.collapsed = !shellElement.collapsed;
        document.querySelector('[data-action-id="summarize-my-area"]').active =
            false;
    };

    // TO DO: handle resets

    // TO DO: build out "Select a summary unit UI behavior and functionality"
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
    <calcite-button round width="half" slot="footer">
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
                    >
                        <calcite-combobox-item
                            value="County"
                            text-label="County"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="Congressional District"
                            text-label="Congressional District"
                        ></calcite-combobox-item>
                        <calcite-combobox-item value="HUC-8" text-label="HUC-8"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="HUC-12"
                            text-label="HUC-12"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="Draw a point"
                            text-label="Draw a point"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="Draw a line"
                            text-label="Draw a line"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="Draw an area"
                            text-label="Draw an area"
                        ></calcite-combobox-item>
                    </calcite-combobox>
                </calcite-label>
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
