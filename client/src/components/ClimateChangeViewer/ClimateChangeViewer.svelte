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
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
    import PopupTemplate from "@arcgis/core/PopupTemplate";
    import CustomContent from "@arcgis/core/popup/content/CustomContent.js";
    import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition.js";
    import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
    import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";

    export let geography;
    export let view;

    let climRefs = [];
    let climateNotify;
    let maxVal;
    let minVal;
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

    function loadOCONUS(selections) {
        let fieldname = buildOconusField(selections);
        console.log(fieldname)
        let oconusUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/NEXGDDP_${selections['Scenario'].value}/FeatureServer/0`;
        let oLayerId = "NEXGDDP" + geography + selections['Scenario'].value + fieldname;
        let oconusSelections = buildOconusId(selections);
        let oLayer = new FeatureLayer({
            url: oconusUrl, 
            opacity: 0.6, 
            id: oLayerId, 
            definitionExpression: "domain = '" + `${geography}` + "' AND " + `${fieldname}` + " IS NOT NULL",
            title: geography + ', ' + selections['Scenario'].value + ', ' + oconusSelections,
            //visible: false
        });
        let popupTitle = selections['Scenario'].value + ', ' + oconusSelections;
        view.map.add(oLayer);
        reactiveUtils.on(
            () => view,
            "arcgisViewClick",
            async (e) => {
                const opts = { include: oLayer}
                const res = await view.hitTest(e.detail, opts)
                if (res.results.length) {
                    executeQueryTask(res, oLayer, geography, fieldname, popupTitle);
                }         
        });
        let minfield = "MI" + fieldname.substring(2);
        let maxfield = "MX" + fieldname.substring(2);
        const dataMinQuery = oLayer.createQuery();
        dataMinQuery.returnGeometry = false;
        dataMinQuery.where = "domain = '" + `${geography}` + "'";
        dataMinQuery.outFields = ["HUC_12", minfield, fieldname, maxfield];
        // query outStatistics of the symbology field
        let statMinDef = new StatisticDefinition();
        statMinDef.statisticType = "min";
        statMinDef.onStatisticField = fieldname;
        statMinDef.outStatisticFieldName = "minValue";
        dataMinQuery.outStatistics = [statMinDef];
        oLayer.queryFeatures(dataMinQuery).then((resultsMn) => {
        // don't want to round yet, in case the value is a fraction.
            minVal = resultsMn.features[0].attributes.minValue;
            const dataMaxQuery = oLayer.createQuery();
            let statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = fieldname;
            statDef.outStatisticFieldName = "maxValue";
            dataMaxQuery.returnGeometry = false;
            dataMaxQuery.where = "domain = '" + `${geography}` + "'";
            dataMaxQuery.outStatistics = [statDef];
            return oLayer.queryFeatures(dataMaxQuery)
         }).then(resultsMx => {
            // don't want to round yet, in case the value is a fraction.
            maxVal = resultsMx.features[0].attributes.maxValue;
         }).then(() => {
            classBreaks(fieldname, selections['Variable'].value);
         });
    //     showLayerListWidget();
    };

    function classBreaks(field, clim) {
        console.log(maxVal, minVal);
    };

    async function executeQueryTask(res, layer, domain, fieldname, popupTitle) {
        let minfield = "MI" + fieldname.substring(2);
        let maxfield = "MX" + fieldname.substring(2);
        const mapPoint = res['results'][0].mapPoint;
        const query = layer.createQuery();
        query.geometry = mapPoint
        query.returnGeometry = true;
        query.where = "domain = '" + `${domain}` + "'";
        query.outFields = ["HUC_12", minfield, fieldname, maxfield];
        if (fieldname.includes("PRfr") || fieldname.includes("PEfr")) {
            const contentPromise = new CustomContent({
                outFields: ["*"],
                creator: () => {
                    return layer.queryFeatures(query).then((result) => {
                        const f = result.features.map((item) => {
                            return item.attributes
                        });
                    
                    return buildOconusPopupJson(
                        f[0]['HUC_12'], 
                        Number(((f[0][minfield]) * 100).toFixed(1)) + '%',
                        Number(((f[0][fieldname]) * 100).toFixed(1)) + '%', 
                        Number(((f[0][maxfield]) * 100).toFixed(1)) + '%', 
                        )
                    })
                } 
            })

            let popupTemplate = new PopupTemplate({
                title: popupTitle,
                content: [contentPromise]
            })

            layer.popupTemplate = popupTemplate
        } else {
            const contentPromise = new CustomContent({
                outFields: ["*"],
                creator: () => {
                    return layer.queryFeatures(query).then((result) => {
                        const f = result.features.map((item) => {
                            return item.attributes
                        });
                    
                    return buildOconusPopupJson(
                        f[0]['HUC_12'], 
                        Number((f[0][minfield]).toFixed(1)),
                        Number((f[0][fieldname]).toFixed(1)), 
                        Number((f[0][maxfield]).toFixed(1)), 
                        )
                    })
                } 
            })

            let popupTemplate = new PopupTemplate({
                title: popupTitle,
                content: [contentPromise]
            })

            layer.popupTemplate = popupTemplate
         }
    };

    function buildOconusPopupJson(huc12, min, mean, max) {
         let oTable = `<table id='Oconus'><tr id='Oconus'><td>HUC 12</td><td>${huc12}</td></tr><tr id='Oconus'><td>Ensemble Minimum of Changes</td><td>${min}</td></tr><tr id='Oconus'><td>Ensemble Median of Changes</td><td>${mean}</td></tr><tr id='Oconus'><td>Ensemble Maximum of Changes</td><td>${max}</td></tr></table>`
         return oTable
    };

    function buildOconusId(selections) {
        return ('Median ' + selections['Season'].label + ' ' + selections['Variable'].label + ', ' + selections['Period'].label)
    };

    function buildOconusField(selections) {
        // Need to build the field name from selections
        return ("ME" + selections['Season'].value + selections['Variable'].value + selections['Period'].value)
    };

    function getSelections() {
        // Get selections as a dictionary
        let selections = {}
        climRefs.forEach(elem => {
            let option = elem.placeholder
            let value = elem.selectedItems[0]?.value
            let label = elem.selectedItems[0]?.textLabel
            selections[option] = {value: value, label: label}
        });
        if (hasValueUndefined(selections)) {
            console.log(climateNotify)
            climateNotify.removeAttribute("hidden")
            return
        } else {
            climateNotify.setAttribute("hidden", "")
            loadOCONUS(selections)
            return
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
        <calcite-button on:click={getSelections}>Add to map</calcite-button>
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
