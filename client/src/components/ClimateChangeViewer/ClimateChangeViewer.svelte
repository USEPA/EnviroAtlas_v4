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

    let options = [ 
        { name: "Variable", options: [ 
            {value: "Precip", label: "Precipitation"},  
            {value: "PET", label: "PET"},
            {value: "Max Temp", label: "Maximum Temperature"},
            {value: "Min Temp", label: "Minimum Temperature"}
        ]}, 
        { name: "Season", options: [ 
            {value: "Spring", label: "Spring"},  
            {value: "Summer", label: "Summer"},
            {value: "Fall", label: "Fall"},
            {value: "Winter", label: "Winter"},
            {value: "Annual", label: "Annual"}
        ]}, 
        { name: "Period", options: [ 
            {value: "Near Term", label: "Near Term"},  
            {value: "Medium Term", label: "Medium Term"},
            {value: "Long Term", label: "Long Term"},
            {value: "XXI 2025-2054 to 2045-2074", label: "XXI 2025-2054 to 2045-2074"},
            {value: "XXI 2025-2054 to 2070-2100", label: "XXI 2025-2054 to 2070-2100"}
        ]}, 
        { name: "Scenario", options: [
            {value: "RCP45", label: "RCP 4.5"},
            {value: "RCP85", label: "RCP 8.5"},
            {value: "SSP1", label: "SSP Option 1"},
            {value: "SSP2", label: "SSP Option 2"}
        ]}
    ];

</script>

<calcite-panel
    data-testid="climate-data-viewer-2"
    data-panel-id="climate-data-viewer-2"
    heading="Time Series Layers"
    description="Explore changing landscapes and environment"
    open
    hidden
>
    <calcite-block open heading="Climate">
        {#each options as c}
        <div id="combobox-div">
            <calcite-combobox
                id="climateVarSelect"
                scale="m"
                placeholder={c.name}
                selection-mode="single"
                max-items="0"
                overlay-positioning="absolute"
            >
            {#each c.options as o}
                <calcite-combobox-item value={o.value} text-label={o.label}/>
            {/each}
            </calcite-combobox>
            <calcite-button appearance="transparent" iconEnd="information"
            ></calcite-button>
        </div>
        {/each}
        <calcite-button>Add to map</calcite-button>
    </calcite-block>
</calcite-panel>

<style>
    calcite-combobox {
        margin-bottom: 8px;
    }
    /* calcite-segmented-control {
        width: 60%;
    } */

    calcite-button {
        float: right;
    }
    calcite-block {
        margin-left: 2px;
        margin-right: 2px;
    }

    #combobox-div {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-gap: 5px;
    }
</style>
