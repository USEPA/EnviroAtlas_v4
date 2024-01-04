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
    import '@esri/calcite-components/dist/components/calcite-chip-group';
    import '@esri/calcite-components/dist/components/calcite-chip';    

    // Import from arcgis js api
    import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";

    // Import components and store
    import { viewState, mapState, climate } from "../store";  

    const server = 'https://awseastaging.epa.gov' 
    const mdURL = "/arcgis/rest/services/test_services/precipMultiDim/ImageServer";
    let yearVal = [2040];

    async function initSelections() {
        //await customElements.whenDefined("calcite-combobox");
        const climateVarSelection = document.getElementById("climateVarSelect");
        $climate.climateVar = [
            //climateVarSelection.value
    //         // yearSlider.minValue,
    //         // yearSlider.maxValue
        ]
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

    initSelections();

    async function addMultidim() {

        $mapState.map.removeAll();
        // set initial year value
        const yearDefinition = new DimensionalDefinition({
        dimensionName: 'Year',
        values: yearVal,
        isSlice: true
        })

        const seasonDefinition = new DimensionalDefinition({
        dimensionName: 'Season',
        values: [5],
        isSlice: true
        })

        let mosaicRule = new MosaicRule({
            multidimensionalDefinition: [yearDefinition, seasonDefinition]
        });
        
        const stretchFunction = new RasterFunction({
            functionName: "Stretch",
            functionArguments: {
                StretchType: 5, // (0 = None, 3 = StandardDeviation, 4 = Histogram Equalization, 5 = MinMax, 6 = PercentClip, 9 = Sigmoid)
                Min: 0,
                Max: 255,
                Raster: "$$" // $$(default) refers to the entire image service, $2 refers to the second image of the image service
            },
            outputPixelType: "u8"
        });

        const colorFunction = new RasterFunction({
            functionName: "Colormap",
            functionArguments: {
                ColorrampName: "Precipitation", // other examples: "Slope", "Surface", "Blue Bright"....
                Raster: stretchFunction // chaining multiple rasterfunctions
            }
        });

        const layer = new ImageryLayer({
        url: server + mdURL,
        format: "jpg",
        renderingRule: colorFunction,
        mosaicRule: mosaicRule,
        opacity: 0.9,
        title: "RCP26AnnualTempMax2Dim" + yearVal,
        popupTemplate: {
                title: 'Max Temp value: {Raster.ItemPixelValue}',
                fieldInfos: [{
                        fieldName: 'Raster.ItemPixelValue',
                        format: {
                            places: 2,
                            digitSeparator: true
                        }
                }]
            },
        });

        console.log($mapState.map);
        $mapState.map.add(layer);

        $viewState.view.whenLayerView(layer).then(() => {
        const multidimInfo = layer.multidimensionalInfo;
        console.log('layer: ', multidimInfo);
        });
    }

</script>

<calcite-panel heading="Climate Change Data Viewer" data-panel-id="climate-data-viewer" hidden>
    <calcite-action-bar slot="action-bar" expand-disabled>
        <calcite-chip-group slot='actions-end' selection-mode="single" label="custom-criteria-chip-group">
            <calcite-chip class='simple-or-adv' selected scale='s' value='global' kind='brand' appearance='solid'>Simple</calcite-chip>
            <calcite-chip class='simple-or-adv' scale='s' value='advanced' kind='neutral'>Advanced</calcite-chip>
        </calcite-chip-group> 
    </calcite-action-bar>
    <calcite-button width="half" slot="footer" appearance="outline">
        Reset
    </calcite-button>
    <calcite-button width="half" slot="footer" icon-start="add-layer">
        Add Data
    </calcite-button>
    <calcite-stepper numbered layout="vertical" scale='s'>
        <calcite-stepper-item scale='s' heading="Climate Variable" selected>
            <calcite-combobox id='climateVarSelect' scale='m' placeholder=" Select one" selection-mode="single" max-items="0"
            overlay-positioning="absolute" validation-icon='information' validation-message='Note...'>
                <calcite-combobox-item value="Precip" text-label="Precipitation"></calcite-combobox-item>
                <calcite-combobox-item value="PET" text-label="PET"></calcite-combobox-item>
                <calcite-combobox-item selected value="Max Temp" text-label="Maximum Temperature"></calcite-combobox-item>
                <calcite-combobox-item value="Min Temp" text-label="Minimum Temperature"></calcite-combobox-item>
            </calcite-combobox>
        </calcite-stepper-item>
        <calcite-stepper-item scale='s' heading="Seasonal Interval">
            <calcite-segmented-control layout='vertical' width="full" scale='s'>
                <calcite-segmented-control-item checked value="Annual" ></calcite-segmented-control-item>
                <calcite-segmented-control-item value="Spring"></calcite-segmented-control-item>
                <calcite-segmented-control-item value="Summer"></calcite-segmented-control-item>
                <calcite-segmented-control-item value="Fall"></calcite-segmented-control-item>
                <calcite-segmented-control-item value="Winter"></calcite-segmented-control-item>
            </calcite-segmented-control>
        </calcite-stepper-item>
        <calcite-stepper-item scale='s' heading="Time Range">
            <calcite-chip-group scale='s' selection-mode="single" label="time-range-chip-group">
                <calcite-chip selected value='near-term' kind='brand' appearance='solid'>Near Term</calcite-chip>
                <calcite-chip value='m-term' kind='neutral'>Medium Term</calcite-chip>
                <calcite-chip value='l-term' kind='neutral'>Long Term</calcite-chip>
                <calcite-chip value='25/54-45/74' kind='neutral'>XXI 2025-2054 to 2045-2074</calcite-chip>
                <calcite-chip value='25/54-70/100' kind='neutral'>XXI 2025-2054 to 2070-2100</calcite-chip>
            </calcite-chip-group> 
        </calcite-stepper-item>
        <calcite-stepper-item scale='s' heading="Climate Scenario">
            <calcite-list selection-mode="single">
                <calcite-list-item selected label="RCP 2.6" value="RCP2.6">
                </calcite-list-item>
                <calcite-list-item label="RCP 4.5" value="RCP4.5">
                </calcite-list-item>
                <calcite-list-item label="RCP 6.0" value="RCP6.0">
                </calcite-list-item>
                <calcite-list-item label="RCP 8.5" value="RCP8.5">
                </calcite-list-item>
            </calcite-list>
        </calcite-stepper-item>
        <calcite-notice kind='success' open>
            <div slot="title">Your selections:</div>
            <div slot='message'>Maximum Temperature</div>
            <div slot='message'>Annual</div>
            <div slot='message'>Near Term</div>
            <div slot='message'>RCP 2.6</div>
        </calcite-notice>
    </calcite-stepper>
    <!-- <calcite-block
        open
        heading="Climate Variable"
        description="Pick a climate variable to be analyzed."
        data-layerId="multidim-climate-var"
    >
    <calcite-icon scale="m" slot="icon" icon="partly-cloudy"></calcite-icon>         
        <calcite-combobox id='climateVarSelect' scale='s' placeholder=" Select one" selection-mode="single" max-items="0"
            overlay-positioning="absolute">
            <calcite-combobox-item value="Precip" text-label="Precipitation"></calcite-combobox-item>
            <calcite-combobox-item value="PET" text-label="PET"></calcite-combobox-item>
            <calcite-combobox-item value="Max Temp" text-label="Maximum Temperature"></calcite-combobox-item>
            <calcite-combobox-item value="Min Temp" text-label="Minimum Temperature"></calcite-combobox-item>
        </calcite-combobox>
    </calcite-block>
    <calcite-block
    open
    heading="Seasonal Interval"
    description="Pick a seasonal interval to be analyzed."
    data-layerId="multidim-seasonal-interval"
    >
    <calcite-icon scale="m" slot="icon" icon="timer"></calcite-icon>         
        <calcite-combobox scale='s' placeholder=" Select one" selection-mode="single" max-items="0"
            overlay-positioning="absolute">
            <calcite-combobox-item value="Spring" text-label="Spring"></calcite-combobox-item>
            <calcite-combobox-item value="Summer" text-label="Summer"></calcite-combobox-item>
            <calcite-combobox-item value="Fall" text-label="Fall"></calcite-combobox-item>
            <calcite-combobox-item value="Winter" text-label="Winter"></calcite-combobox-item>
            <calcite-combobox-item value="Annual" text-label="Annual"></calcite-combobox-item>
        </calcite-combobox>
    </calcite-block>
    <calcite-block
    open
    heading="Time Range"
    description="This is a description for five types of inputs available. "
    data-layerId="multidim-year"
    >
    <calcite-icon scale="m" slot="icon" icon="calendar"></calcite-icon>            
    </calcite-block>
    <calcite-block
        open
        heading="Climate Scenario"
        description="Pick a climate scenario to be analyzed."
        data-layerId="multidim-climate-scenario"
    >
    <calcite-icon scale="m" slot="icon" icon="globe"></calcite-icon>         
        <calcite-combobox scale='s' placeholder=" Select one" selection-mode="single" max-items="0"
            overlay-positioning="absolute">
            <calcite-combobox-item value="RCP26" text-label="RCP 2.6"></calcite-combobox-item>
            <calcite-combobox-item value="RCP45" text-label="RCP 4.5"></calcite-combobox-item>
            <calcite-combobox-item value="RCP60" text-label="RCP 6.0"></calcite-combobox-item>
            <calcite-combobox-item value="RCP85" text-label="RCP 8.5"></calcite-combobox-item>
        </calcite-combobox>
    </calcite-block>
    <calcite-block
        open
        heading="Results"
        description="This is a description for the results shown on the map."
        data-layerId="analysis"
        width="full"
    >
        <calcite-icon scale="m" slot="icon" icon="analysis"></calcite-icon>
        <div id='buttonDiv' style="float:center; text-align:center;">
        <calcite-button
            round
            alignment='center'
            on:click={addMultidim}
        >Map it!</calcite-button>
    </div>           
    </calcite-block> -->
</calcite-panel>

<style>
    /* calcite-combobox {
        margin-left: 38px;
    } */
    calcite-segmented-control {
        width: 60%
    }

    calcite-notice {
        width: 80%
    }
    calcite-block {
        margin-left: 9px;
        margin-right: 9px;
        margin-bottom: 0px;
    }
    
    .simple-or-adv {
        margin-top: 9px;
        margin-bottom: 9px;
        margin-right: 5px;
    }

    calcite-stepper-item {
        width: 90%;
        padding-right: 15px;
        --calcite-ui-focus-color: none !important;
    }

    calcite-stepper {
        flex: none !important
    }
</style>