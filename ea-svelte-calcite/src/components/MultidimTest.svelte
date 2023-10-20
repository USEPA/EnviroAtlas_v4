<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-tile-select-group";
    import "@esri/calcite-components/dist/components/calcite-tile-select";
    import "@esri/calcite-components/dist/components/calcite-slider";
    import "@esri/calcite-components/dist/components/calcite-fab";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-segmented-control";
    import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
    import "@esri/calcite-components/dist/components/calcite-list";
    import "@esri/calcite-components/dist/components/calcite-list-item";

    // Import from arcgis js api
    import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";

    // Import components and store
    import { viewState, mapState, ecat } from "../store";  

    const server = 'https://awseastaging.epa.gov' 
    const mdURL = "/arcgis/rest/services/test_services/precipMultiDim/ImageServer";
    let yearVal = [2040];

    // async function initSlider() {
    //     await customElements.whenDefined("calcite-slider");
    //     const yearSlider = document.getElementById("yearSlider");
    //     $ecat.yearThresholds = [
    //         yearSlider.value
    //         // yearSlider.minValue,
    //         // yearSlider.maxValue
    //     ]
    //     console.log(yearSlider);
    //     console.log($ecat.yearThresholds);

    //     yearSlider.addEventListener("calciteSliderChange", () => {
    //         $ecat.yearThresholds = [
    //             yearSlider.value
    //             // yearSlider.minValue,
    //             // yearSlider.maxValue
    //         ];
    //         console.log("update: ", $ecat.yearThresholds);
    //     });
    // }

    // initSlider();

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
        title: "RCP26AnnualTempMax2Dim" + $ecat.yearThresholds,
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

<calcite-panel heading="Multidim Test" data-panel-id="multidim-test" hidden>
    <calcite-tile-select-group
    id="bandTileSelectGroup"
    layout="vertical"
    >
    <calcite-block
    open
    heading="Climate Variable"
    description="Pick a climate variable to be analyzed."
    data-layerId="multidim-climate-var"
    >
    <calcite-icon scale="m" slot="icon" icon="partly-cloudy"></calcite-icon>         
        <calcite-combobox scale='s' placeholder=" Select one" selection-mode="single" max-items="0"
            overlay-positioning="absolute">
            <calcite-combobox-item value="Precip" text-label="Precipitation"></calcite-combobox-item>
            <calcite-combobox-item value="PET" text-label="PET"></calcite-combobox-item>
            <calcite-combobox-item value="Max Temp" text-label="Maximum Temperature"></calcite-combobox-item>
            <calcite-combobox-item value="Min Temp" text-label="Minimum Temperature"></calcite-combobox-item>
        </calcite-combobox>
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
        heading="Time Range"
        description="This is a description for five types of inputs available. "
        data-layerId="multidim-year"
        >
        <calcite-icon scale="m" slot="icon" icon="calendar"></calcite-icon>            
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
    </calcite-block>
    </calcite-tile-select-group>
</calcite-panel>

<style>
    calcite-combobox {
        margin-left: 38px;
    }
    calcite-block {
        margin-left: 9px;
        margin-right: 9px;
        margin-bottom: 0px;
    }
    /* calcite-slider {
        padding-left: 7px;
        padding-right: 7px;
        height: auto;
        display: block;
        position: relative;
        --calcite-ui-foreground-1: white;
    } */
    
</style>
