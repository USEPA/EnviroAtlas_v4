<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-segmented-control";
    import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
    import "@esri/calcite-components/dist/components/calcite-list";
    import "@esri/calcite-components/dist/components/calcite-list-item";
    import "@esri/calcite-components/dist/components/calcite-stepper";
    import "@esri/calcite-components/dist/components/calcite-stepper-item";
    import "@esri/calcite-components/dist/components/calcite-notice";
    import "@esri/calcite-components/dist/components/calcite-chip-group";
    import "@esri/calcite-components/dist/components/calcite-chip";
    import "@esri/calcite-components/dist/components/calcite-action";
    import "@esri/calcite-components/dist/components/calcite-action-group";
    import "@esri/calcite-components/dist/components/calcite-tooltip";

    // Import from arcgis js api
    import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";

    // Import components and store
    import { viewState, mapState, climate } from "../../store";
    import Bookmark from "./Bookmark.svelte";

    export let view;

    window.ea.climateChangeViewer = {};
    window.ea.climateChangeViewer.view = () => {
        return view;
    };

    const server = "https://awseastaging.epa.gov";
    const mdURL =
        "/arcgis/rest/services/test_services/precipMultiDim/ImageServer";
    let yearVal = [2040];

    async function initSelections() {
        //await customElements.whenDefined("calcite-combobox");
        const climateVarSelection = document.getElementById("climateVarSelect");
        $climate.climateVar = [
            //climateVarSelection.value
            //         // yearSlider.minValue,
            //         // yearSlider.maxValue
        ];
        console.log(climateVarSelection);
        console.log($climate.climateVar);

        climateVarSelection.addEventListener("calciteComboboxChange", () => {
            $climate.climateVar = [
                //climateVarSelection.value
                //             // yearSlider.minValue,
                //             // yearSlider.maxValue
            ];
            //         console.log("update: ", $ecat.yearThresholds);
        });
    }

    //Not sure what was going on with this function but not doing anything right now but causing errors
    //If we are trying to initialize dropdowns we can set most of the stuff in the markup
    //    initSelections();

    async function addMultidim() {
        $mapState.map.removeAll();
        // set initial year value
        const yearDefinition = new DimensionalDefinition({
            dimensionName: "Year",
            values: yearVal,
            isSlice: true,
        });

        const seasonDefinition = new DimensionalDefinition({
            dimensionName: "Season",
            values: [5],
            isSlice: true,
        });

        let mosaicRule = new MosaicRule({
            multidimensionalDefinition: [yearDefinition, seasonDefinition],
        });

        const stretchFunction = new RasterFunction({
            functionName: "Stretch",
            functionArguments: {
                StretchType: 5, // (0 = None, 3 = StandardDeviation, 4 = Histogram Equalization, 5 = MinMax, 6 = PercentClip, 9 = Sigmoid)
                Min: 0,
                Max: 255,
                Raster: "$$", // $$(default) refers to the entire image service, $2 refers to the second image of the image service
            },
            outputPixelType: "u8",
        });

        const colorFunction = new RasterFunction({
            functionName: "Colormap",
            functionArguments: {
                ColorrampName: "Precipitation", // other examples: "Slope", "Surface", "Blue Bright"....
                Raster: stretchFunction, // chaining multiple rasterfunctions
            },
        });

        const layer = new ImageryLayer({
            url: server + mdURL,
            format: "jpg",
            renderingRule: colorFunction,
            mosaicRule: mosaicRule,
            opacity: 0.9,
            title: "RCP26AnnualTempMax2Dim" + yearVal,
            popupTemplate: {
                title: "Max Temp value: {Raster.ItemPixelValue}",
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

        console.log($mapState.map);
        $mapState.map.add(layer);

        $viewState.view.whenLayerView(layer).then(() => {
            const multidimInfo = layer.multidimensionalInfo;
            console.log("layer: ", multidimInfo);
        });
    }

    export const handlePanelClose = function (e) {
        const target = e.target;
        const shellElement = target.parentElement;
        shellElement.collapsed = !shellElement.collapsed;
        document.querySelector(
            '[data-action-id="climate-data-viewer"]',
        ).active = false;
    };
</script>

<calcite-panel
    heading="Climate Change Data Viewer"
    data-panel-id="climate-data-viewer"
    hidden
    closable
    on:calcitePanelClose={handlePanelClose}
>
    <calcite-action-bar slot="action-bar" expand-disabled>
        <calcite-chip-group
            slot="actions-end"
            selection-mode="single"
            label="custom-criteria-chip-group"
        >
            <calcite-chip
                class="simple-or-adv"
                selected
                scale="s"
                value="global"
                kind="brand"
                appearance="solid">Simple</calcite-chip
            >
            <calcite-chip
                class="simple-or-adv"
                scale="s"
                value="advanced"
                kind="neutral">Advanced</calcite-chip
            >
        </calcite-chip-group>
        <calcite-action
            icon="extent-filter"
            text-enabled
            text="Filter options"
            slot="actions-end"
            id="popover-button"
        ></calcite-action>
    </calcite-action-bar>
    <calcite-button width="half" slot="footer" appearance="outline">
        Reset
    </calcite-button>
    <calcite-button width="half" slot="footer" icon-start="add-layer">
        Add Data
    </calcite-button>
    <Bookmark view={view}/>
    <calcite-block
        open
        heading="Climate Variable"
        data-layerId="multidim-climate-var"
    >
        <calcite-combobox
            id="climateVarSelect"
            scale="s"
            placeholder=" Select one"
            selection-mode="single"
            max-items="0"
            overlay-positioning="absolute"
        >
            <calcite-combobox-item value="Precip" text-label="Precipitation"
            ></calcite-combobox-item>
            <calcite-combobox-item value="PET" text-label="PET"
            ></calcite-combobox-item>
            <calcite-combobox-item
                value="Max Temp"
                text-label="Maximum Temperature"
            ></calcite-combobox-item>
            <calcite-combobox-item
                value="Min Temp"
                text-label="Minimum Temperature"
            ></calcite-combobox-item>
        </calcite-combobox>
    </calcite-block>
    <calcite-block
        open
        heading="Seasonal Interval"
        data-layerId="multidim-seasonal-interval"
    >
        <calcite-combobox
            scale="s"
            placeholder=" Select one"
            selection-mode="single"
            max-items="0"
            overlay-positioning="absolute"
        >
            {#each ["Spring", "Summer", "Fall", "Winter", "Annual"] as seasonalInterval}
                <calcite-combobox-item
                    value={seasonalInterval}
                    text-label={seasonalInterval}
                ></calcite-combobox-item>
            {/each}
        </calcite-combobox>
    </calcite-block>
    <calcite-block open heading="Time Range" data-layerId="multidim-year">
        <calcite-combobox
            scale="s"
            placeholder=" Select one"
            selection-mode="single"
            max-items="0"
            overlay-positioning="absolute"
        >
            {#each ["Near Term", "Medium Term", "Long Term", "XXI 2025-2054 to 2045-2074", "XXI 2025-2054 to 2070-2100"] as timeRange}
                <calcite-combobox-item value={timeRange} text-label={timeRange}
                ></calcite-combobox-item>
            {/each}
        </calcite-combobox>
    </calcite-block>
    <calcite-block
        open
        heading="Climate Scenario"
        data-layerId="multidim-climate-scenario"
    >
        <calcite-combobox
            scale="s"
            placeholder=" Select one"
            selection-mode="single"
            max-items="0"
            overlay-positioning="absolute"
        >
            <calcite-combobox-item value="RCP45" text-label="RCP 4.5"
            ></calcite-combobox-item>
            <calcite-combobox-item value="RCP85" text-label="RCP 8.5"
            ></calcite-combobox-item>
            <calcite-combobox-item value="SSP1" text-label="SSP Option 1"
            ></calcite-combobox-item>
            <calcite-combobox-item value="SSP2" text-label="SSP Option 2"
            ></calcite-combobox-item>
        </calcite-combobox>
    </calcite-block>
</calcite-panel>

<style>
    /* calcite-combobox {
        margin-left: 38px;
    } */
    /* calcite-segmented-control {
        width: 60%;
    } */

    calcite-block {
        margin-left: 2px;
        margin-right: 2px;
    }

    .simple-or-adv {
        margin-top: 9px;
        margin-bottom: 9px;
        margin-right: 5px;
    }
    /* 
    calcite-stepper-item {
        width: 90%;
        padding-right: 15px;
        --calcite-ui-focus-color: none !important;
    }

    calcite-stepper {
        flex: none !important;
    } */
</style>
