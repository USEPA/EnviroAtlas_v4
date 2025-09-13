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
    
    import { hasValueUndefined, largestAbsVal } from "src/shared/utilities.js";
    
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

    export let geography;
    export let view;

    let climRefs = [];
    let climateNotify;
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
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "A", label: "Annual"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "M", label: "Spring"},  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "J", label: "Summer"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "S", label: "Fall"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "D", label: "Winter"},
            
        ]}, 
        { name: "Period", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "HF1", label: "1976-2005 to 2025-2054"},  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "HF2", label: "1976-2005 to 2045-2074"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "HF3", label: "1976-2005 to 2070-2099"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "FF2", label: "2025-2054 to 2045-2074"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands,CONUS", value: "FF3", label: "2025-2054 to 2070-2099"}
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
        let fieldname = buildOconusField(selections);
        console.log(fieldname)
        let oconusUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/NEXGDDP_${selections['Scenario']}/FeatureServer/0`;
        let oLayerId = "NEXGDDP" + geography + selections['Scenario'] + fieldname;
        let oLayer = new FeatureLayer({url: oconusUrl, opacity: 0.6, id: oLayerId, definitionExpression: "domain = '" + `${geography}` + "' AND " + `${fieldname}` + " IS NOT NULL"});
        let oconusSelections = _buildOconusId();
    //     this.oLayer.name = domainText + ', ' + scenario + ', ' + oconusSelections;
    //     this.oLayer.title = domainText + ', ' + scenario + ', ' + oconusSelections;
    //     var popupTitle = scenario + ', ' + oconusSelections;
        //oLayer.setDefinitionExpression("domain = '" + `${geography}` + "' AND " + `${fieldname}` + " IS NOT NULL");
        view.map.add(oLayer);
    };
    
    function buildOconusField(selections) {
        // Need to build the field name from selections
        return ("ME" + selections['Season'] + selections['Variable'] + selections['Period'])
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
            console.log(climateNotify)
            climateNotify.removeAttribute("hidden")
            return
        } else {
            climateNotify.setAttribute("hidden", "")
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
        <calcite-notice hidden bind:this={climateNotify} scale="s" open kind="danger" icon>
            <div slot="title">Incomplete selections</div>
            <div slot="message">Please make selections.</div>
        </calcite-notice>
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
