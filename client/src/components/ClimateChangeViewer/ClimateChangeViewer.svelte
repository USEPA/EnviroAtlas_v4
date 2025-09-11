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
    import { hasValueUndefined } from "src/shared/utilities.js";
    
    export let geography;

    let climRefs = [];
    let options = [ 
        { name: "Variable", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "PRin", label: "Change in Precipitation (in)"},  
            {domains: "AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "PRfr", label: "Change in Precipitation (fraction as %)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "PEin", label: "Change in PET (in)"},
            {domains: "AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "PEfr", label: "Change in PET (fraction as %)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "mxTF", label: "Change in Maximum Temperature (°F)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "miTF", label: "Change in Minimum Temperature (°F)"}
        ]}, 
        { name: "Scenario", options: [
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp126", label: "SSP1-2.6 (>3.6°F by 2100)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "ssp245", label: "SSP2-4.5 (4.9 ± 1.6 °F by 2100)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp370", label: "SSP3-7.0 (6.5 ± 1.3 °F by 2100)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "ssp585", label: "SSP5-8.5 (7.9 ± 2.3 °F by 2100)"},
            {domains: "CONUS", value: "rcp45", label: "RCP-4.5 (Peak Emissions Year 2040"},
            {domains: "CONUS", value: "rcp85", label: "RCP-8.5 (Peak Emissions After 2100"}
        ]},
        { name: "Season", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Spring", label: "Spring"},  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Summer", label: "Summer"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Fall", label: "Fall"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Winter", label: "Winter"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "A", label: "Annual"}
        ]}, 
        { name: "Period", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Near Term", label: "Near Term"},  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Medium Term", label: "Medium Term"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "Long Term", label: "Long Term"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "XXI 2025-2054 to 2045-2074", label: "XXI 2025-2054 to 2045-2074"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "XXI 2025-2054 to 2070-2100", label: "XXI 2025-2054 to 2070-2100"}
        ]}, 
    ];

    $: options_filtered = options.map(obj => {
        return {...obj, options: obj.options.filter(opt => opt.domains.includes(geography))}
    })

    //Code to adapt from v3
    function loadOCONUS() {
        let selections = getSelections()
    //     var domainText = this.domainOCONUS.options[this.domainOCONUS.selectedIndex].text;
    //     var scenario = dojo.byId("modelSelectionOCONUS").value;
    //     map.setExtent(this._zoomToOCONUSArea(domain));
        var fieldname = _buildOconusField(selections);
    };

    function _buildOconusField(selections) {
        // Need to build the field name from selections
        //return ("ME" + dojo.byId("seasonSelectionOCONUS").value + dojo.byId("climateSelectionOCONUS").value + dojo.byId("periodSelectionOCONUS").value)
    };

    function getSelections() {
        // Get selections as a dictionary
        let selections = {}
        climRefs.forEach(elem => {
            let option = elem.placeholder
            let value = elem.selectedItems[0]?.value
            selections[option] = value
        });
        if (hasValueUndefined(selections)) {
            console.log('give user notify')
        } else {
            return selections
        }
    }
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
        {#each options_filtered as clim, c (clim.name)}
        <div id="combobox-div">
            <calcite-combobox
                bind:this={climRefs[c]}
                id="climateVarSelect"
                scale="m"
                placeholder={clim.name}
                selection-mode="single"
                max-items="0"
                overlay-positioning="absolute"
            >
            {#each clim.options as o}
                <calcite-combobox-item value={o.value} text-label={o.label}/>
            {/each}
            </calcite-combobox>
            <calcite-button appearance="transparent" iconEnd="information"
            ></calcite-button>
        </div>
        {/each}
        <calcite-button on:click={loadOCONUS}>Add to map</calcite-button>
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
