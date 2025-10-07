<script>
    //TODO: en-dash for minuses in legend...add labels

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-list";
    import "@esri/calcite-components/dist/components/calcite-list-item";
    import "@esri/calcite-components/dist/components/calcite-notice";
    import "@esri/calcite-components/dist/components/calcite-action";
    
    import { hasValueUndefined, largestAbsVal, openLayerList } from "src/shared/utilities.js";
    import { activeWidget } from "src/store.ts";
    import TimeSeriesDetails from "src/components/TimeSeriesViewer/TimeSeriesDetails.svelte";
    
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
    import PopupTemplate from "@arcgis/core/PopupTemplate";
    import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition.js";
    import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
    import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
    import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";

    export let geography;
    export let view;

    let climRefs = [];
    let climateNotify;
    let maxVal;
    let minVal;
    const options = [ 
        { name: "Variable", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PRin", label: "Change in Precipitation (in)",
                info: "Change in total precipitation in inches or as fraction for the season or annually.",
                pdf: "Supplemental/Climate_Precip_NEXGDDP_OCONUS.pdf"
            },  
            {domains: "AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PRfr", label: "Change in Precipitation (fraction as %)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PEin", label: "Change in PET (in)",
                info: "Change in total potential evapotranspiration in inches or as fraction for the season or annually.",
                pdf: "Supplemental/Climate_PET_NEXGDDP_OCONUS.pdf"
            },
            {domains: "AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PEfr", label: "Change in PET (fraction as %)"},
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "mxTF", label: "Change in Maximum Temperature (°F)",
                info: "Change in average maximum temperature in degrees Fahrenheit for the season or annually.",
                pdf: "Supplemental/Climate_Temp_NEXGDDP_OCONUS.pdf"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "miTF", label: "Change in Minimum Temperature (°F)",
                info: "Change in average minimum temperature in degrees Fahrenheit for the season or annually.",
                pdf: "Supplemental/Climate_Temp_NEXGDDP_OCONUS.pdf"
            }
        ], description: "All variables are presented as a median, minimum and maximum of the NEX-GDDP-CMIP6 Global Climate Model ensemble."
    }, 
        { name: "Scenario", options: [
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp126", label: "SSP1–2.6 (>3.6°F by 2100)", 
                info: "SSP1 (“Sustainability”) assumes widespread global climate change mitigation policies, clean energy technologies, and natural environment conservancy. This scenario assumes very low GHG concentration levels and reflects the international climate policy goal of limiting global warming below 3.6°F (2.0°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp245", label: "SSP2–4.5 (4.9 ± 1.6 °F by 2100)", 
                info: "SSP2 (“Middle of the Road”) assumes moderate global climate mitigation and adaptation and a slow progress in climate protection measures. This scenario is a medium pathway of future GHG concentrations. Global temperatures increase by 4.9±1.3°F (2.7±0.7°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp370", label: "SSP3–7.0 (6.5 ± 1.3 °F by 2100)",
                info: "SSP3 (“Regional Rivalry”) assumes high challenges to mitigation and adaptation. Here, nationalism drives policy, and regional and local take precedence over global issues. Global temperatures increase by 6.5±1.6°F (3.6±0.9°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp585", label: "SSP5–8.5 (7.9 ± 2.3 °F by 2100)",
                info: "SSP5 (“Fossil-fueled Development”) reflects high challenges to mitigation and low challenges to adaptation. It is characterized by steadily increasing GHG concentrations. It represents the upper boundary of the range of scenarios. Global temperatures increase by 7.9±2.2°F (4.4±1.2°C) at 2100 compared to PIA."
            },
            //{domains: "CONUS", value: "rcp45", label: "RCP-4.5 (Peak Emissions Year 2040"},
            //{domains: "CONUS", value: "rcp85", label: "RCP-8.5 (Peak Emissions After 2100"}
        ], description: "Shared Socioeconomic Pathways (SSPs) reflect global trends in human activities and changes in radiative forcing that result from changes in atmospheric greenhouse gases (GHGs) and aerosol concentrations. In the SSP labels (like SSP1-2.6), the first number refers to a defined socioeconomic pathway (trends in population, policy, and economic growth), and the second refers to an increase in radiative forcing (W/m2) relative to pre-industrial (1850-1900) average (PIA)."
    },
        { name: "Season", options: [
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "A", label: "Annual", 
                info: "January through December of the same calendar year"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "M", label: "Spring",
                info: "March, April, May"
            },  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "J", label: "Summer",
                info: "June, July, August"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "S", label: "Fall",
                info: "September, October, November"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "D", label: "Winter",
                info: "December of previous year, January, February"
            },
            
        ]}, 
        { name: "Period", options: [ 
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF1", label: "1976–2005 to 2025–2054", 
                info: "Recent history (1976–2005) to near-term future (2025–2054)"
            },  
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF2", label: "1976–2005 to 2045–2074",
                info: "Recent history (1976–2005) to mid-century (2045–2074)"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF3", label: "1976–2005 to 2070–2099",
                info: "Recent history (1976–2005) to end-of-century (2070–2099)"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "FF2", label: "2025–2054 to 2045–2074",
                info: "Near-term future (2025–2054) to mid-century (2045–2074)"
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "FF3", label: "2025–2054 to 2070–2099",
                info: "Near-term future (2025–2054) to end-of-century (2070–2099)"
            }
        ], description: "Climate change variables were computed using 30–year periods: recent history (1976–2005), near-term future (2025–2054), mid-century (2045–2074), and end-of-century (2070–2099). Climate change variables are expressed as a change between different periods:"
    }];

    const domainMap = {
        "Puerto Rico,Virgin Islands": "VIPR",
        "Guam": "GUAM",
        "AmericanSamoa": "AMSAM",
        "Hawaii": "HAWAII",
        "Alaska": "ALASKA"
    }

    /**
     * Filters selections in the Climate dropdowns based on selected geography.
     */
    $: options_filtered = options.map(obj => {
        return {...obj, options: obj.options.filter(opt => opt.domains.includes(geography))}
    });

    /**
     * Transforms the selected geography using domainMap that aligns with the 'domain' field of OCONUS dataset.
     * The transformed string is used to build feature layer definitionExpression and queries. 
    */
    $: domain = domainMap[geography]

    /**
     * Main process function to add OCONUS data to map, set up custom class breaks, and set up popups.
     * @param selections - object returned from getSelections()
     */
    function loadOCONUS(selections) {
        let fieldname = buildOconusField(selections);
        let oconusUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/NEXGDDP_${selections['Scenario'].value}/FeatureServer/0`;
        let oLayerId = "NEXGDDP" + domain + selections['Scenario'].value + fieldname;
        let oconusSelections = buildOconusId(selections);
        let oLayer = new FeatureLayer({
            url: oconusUrl, 
            opacity: 0.6, 
            id: oLayerId, 
            definitionExpression: "domain = '" + `${domain}` + "' AND " + `${fieldname}` + " IS NOT NULL",
            title: geography.replaceAll(",", " & ").replace(/([a-z])([A-Z])/g, '$1 $2') + ', ' + selections['Scenario'].value.toUpperCase() + ', ' + oconusSelections,
            visible: false
        });
        let popupTitle = selections['Scenario'].value.toUpperCase() + ', ' + oconusSelections;
        view.map.add(oLayer);
        reactiveUtils.on(
            () => view,
            "arcgisViewClick",
            async (e) => {
                const res = await view.hitTest(e.detail, { include: oLayer })
                if (res.results.length) {
                    executeQueryTask(res, oLayer, domain, fieldname, popupTitle);
                }         
        });
        let minfield = "MI" + fieldname.substring(2);
        let maxfield = "MX" + fieldname.substring(2);
        const dataMinQuery = oLayer.createQuery();
        dataMinQuery.returnGeometry = false;
        dataMinQuery.where = "domain = '" + `${domain}` + "'";
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
            dataMaxQuery.where = "domain = '" + `${domain}` + "'";
            dataMaxQuery.outStatistics = [statDef];
            return oLayer.queryFeatures(dataMaxQuery)
        }).then(resultsMx => {
            // don't want to round yet, in case the value is a fraction.
            maxVal = resultsMx.features[0].attributes.maxValue;
        }).then(() => {
            classBreaks(fieldname, selections['Variable'], oLayer);
        });
        openLayerList($activeWidget);
    };

    /**
     * Creates custom renderer based on conditions of dataset, including climate variable, 
     * and the statistical min and max value of the feature layer. Also, applies the rendererer 
     * and makes the layer visible.
     * @param field - specific field from feature layer to render
     * @param clim - climate variable (label and value) from selections
     * @param layer - feature layer object created in loadOCONUS()
     */
    function classBreaks(field, clim, layer) {
        let sls = new SimpleLineSymbol({style: 'none'});
        let renderer = new ClassBreaksRenderer({field: field, legendOptions: {title: clim.label}});
        // when there are negative and positive values, create 9 value diverging color classification 
        if (minVal < 0 && maxVal > 0) {
            if (clim.value == "PRfr" || clim.value == "PEfr") {
                // compare the min and max of to domain, then whichever is largest number, the other side of break is max/min (9 total classes)
                var largestVal = largestAbsVal(maxVal, minVal); // don't round fractions until the end
                var smallestVal = (-1 * largestVal);
                var positiveBreakDiff = (largestVal / 5);
                var negativeBreakDiff = (largestVal / 3);
                // negative (3 classes)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(3)),
                    maxValue: Number((smallestVal + negativeBreakDiff).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [133, 46, 4, 0.6], outline: sls}),
                    label: Number((smallestVal * 100).toFixed(1)) + ' – ' + Number(((smallestVal + negativeBreakDiff) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + negativeBreakDiff).toFixed(3)),
                    maxValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [218, 92, 10, 0.6], outline: sls}),
                    label: Number(((smallestVal + negativeBreakDiff) * 100).toFixed(1)) + ' – ' + Number(((smallestVal + (2 * negativeBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(3)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [254, 230, 151, 0.6], outline: sls}),
                    label: Number(((smallestVal + (2 * negativeBreakDiff)) * 100).toFixed(1)) + ' – <' + 0 + '%'
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0%'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [185, 231, 248, 0.6], outline: sls}),
                    label: '>0 – ' + Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls}),
                    label: Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}),
                    label: Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls}),
                    label: Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(3)),
                    maxValue: Number(largestVal.toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls}),
                    label: Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + ' – ' + Number((largestVal * 100).toFixed(1)) + '%'
                });
            }
            if (clim.value == "miTF" || clim.value == "mxTF") {
                // compare the min and max of to domain, then whichever is largest number, the other side of break is max/min (9 total classes)
                var largestVal = largestAbsVal(Math.ceil(maxVal), Math.floor(minVal));
                var smallestVal = (-1 * largestVal);
                var positiveBreakDiff = (largestVal / 5);
                var negativeBreakDiff = (largestVal / 3);
                // negative (3 classes)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)), 
                    maxValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [61, 92, 164, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [104, 159, 201, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [165, 210, 229, 0.6], outline: sls}),
                    label: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)) + ' – <' + 0
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [252, 219, 143, 0.6], outline: sls}),
                    label: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [250, 157, 91, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [233, 92, 59, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [206, 45, 43, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [165, 0, 38, 0.6], outline: sls})
                });
            }
            if (clim.value == "PRin" || clim.value == "PEin") {
                // compare the min and max of to domain, then whichever is largest number, the other side of break is max/min (9 total classes)
                var largestVal = largestAbsVal(Math.ceil(maxVal), Math.floor(minVal));
                var smallestVal = (-1 * largestVal);
                var positiveBreakDiff = (largestVal / 5);
                var negativeBreakDiff = (largestVal / 3);
                // negative (3 classes)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)), 
                    maxValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [133, 46, 4, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [218, 92, 10, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), 
                    maxValue: -0.001, 
                    symbol: new SimpleFillSymbol({color: [254, 230, 151, 0.6], outline: sls}),
                    label: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)) + ' – <' + 0    
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [185, 231, 248, 0.6], outline: sls}),
                    label: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls})
                });
            }
        } else if (minVal > 0 && maxVal > 0) { // when the max and min value is greater than 0
            if (clim.value == "PRfr" || clim.value == "PEfr") {
                // max is the largest number, the min is -1 (7 total classes)
                var largestVal = maxVal; // don't round fractions until the end
                var smallestVal = -1;
                var positiveBreakDiff = (largestVal / 5);
                // negative (1 class)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(3)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [133, 46, 4, 0.6], outline: sls}),
                    label: '<0%'
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0%'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [185, 231, 248, 0.6], outline: sls}),
                    label: '>0 – ' + Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls}),
                    label: Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}),
                    label: Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(3)),
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls}),
                    label: Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(3)),
                    maxValue: Number(largestVal.toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls}),
                    label: Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + ' – ' + Number((largestVal * 100).toFixed(1)) + '%'
                });
            }
            if (clim.value == "miTF" || clim.value == "mxTF") {
                // max is the largest number, the min is -1 (7 total classes)
                var largestVal = Math.ceil(maxVal);
                var smallestVal = -1;
                var positiveBreakDiff = (largestVal / 5);
                // negative (1 class)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [61, 92, 164, 0.6], outline: sls}),
                    label: '<0'
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [252, 219, 143, 0.6], outline: sls}),
                    label: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [250, 157, 91, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [233, 92, 59, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [206, 45, 43, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [165, 0, 38, 0.6], outline: sls})
                });
            }
            if (clim.value == "PRin" || clim.value == "PEin") {
                // max is the largest number, the min is -1 (7 total classes)
                var largestVal = Math.ceil(maxVal);
                var smallestVal = -1;
                var positiveBreakDiff = (largestVal / 5);
                // negative (1 class)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [133, 46, 4, 0.6], outline: sls}),
                    label: '<0'
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (5 classes)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [185, 231, 248, 0.6], outline: sls}),
                    label: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls})
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls})
                });
            }
        } else { // all negative
            if (clim.value == "PRfr" || clim.value == "PEfr") {
                // min is the smallest number, the max is 1 (7 total classes)
                var largestVal = 1;
                var smallestVal = minVal; // don't round fractions until the end
                var negativeBreakDiff = (smallestVal / 5);
                // negative (5 classes)
                renderer.addClassBreakInfo({
                    minValue: Number(smallestVal.toFixed(3)),
                    maxValue: Number((smallestVal - negativeBreakDiff).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [102, 37, 6, 0.6], outline: sls}), // dark brown
                    label: Number(((smallestVal - negativeBreakDiff) * 100).toFixed(1)) + ' – ' + Number((smallestVal * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - negativeBreakDiff).toFixed(3)),
                    maxValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [196, 72, 2, 0.6], outline: sls}), // dark orange
                    label: Number(((smallestVal - (2 * negativeBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((smallestVal - negativeBreakDiff) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(3)),
                    maxValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [251, 166, 52, 0.6], outline: sls}), //orange
                    label: Number(((smallestVal - (3 * negativeBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((smallestVal - (2 * negativeBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(3)),
                    maxValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [253, 192, 76, 0.6], outline: sls}),  //light orange
                    label: Number(((smallestVal - (4 * negativeBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((smallestVal - (3 * negativeBreakDiff)) * 100).toFixed(1)) + '%'
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(3)),
                    maxValue: -0.001,
                    symbol: new SimpleFillSymbol({color: [254, 230, 151, 0.6], outline: sls}), // yellow
                    label: '<0 – ' + Number(((smallestVal - (4 * negativeBreakDiff)) * 100).toFixed(1)) + '%'
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0,
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0%'
                });
                // positive (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: Number((largestVal).toFixed(3)),
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}), //blue
                    label: '>0%'
                });
            }
            if (clim.value == "miTF" || clim.value == "mxTF") {
                // min is the smallest number, the max is 1 (7 total classes)
                var largestVal = 1;
                var smallestVal = Math.floor(minVal);
                var negativeBreakDiff = (smallestVal / 5);
                // negative (5 classes)
                renderer.addClassBreakInfo(
                    Number(smallestVal.toFixed(1)), 
                    Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    new SimpleFillSymbol({color: [54, 75, 38, 0.6], outline: sls})
                ); //blue
                renderer.addClassBreakInfo(
                    Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [61, 92, 164, 0.6], outline: sls})
                ); //blue
                renderer.addClassBreakInfo(
                    Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [104, 159, 201, 0.6], outline: sls})
                ); //blue
                renderer.addClassBreakInfo(
                    Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [165, 210, 229, 0.6], outline: sls})
                ); //blue
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)),
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [196, 228, 236, 0.6], outline: sls}),
                    label: '<0 – ' + Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1))
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: 0,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (1 class)
                renderer.addClassBreakInfo({
                    minValue: -0.001,
                    maxValue: Number((smallestVal).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [206, 45, 43, 0.6], outline: sls}), //red
                    label: '>0'
                });
            }
            if (clim.value == "PRin" || clim.value == "PEin") {
                // min is the smallest number, the max is 1 (7 total classes)
                var largestVal = 1;
                var smallestVal = Math.floor(minVal);
                var negativeBreakDiff = (smallestVal / 5);
                // negative (5 classes)
                renderer.addClassBreakInfo(
                    Number(smallestVal.toFixed(1)), 
                    Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    new SimpleFillSymbol({color: [102, 37, 6, 0.6], outline: sls})
                ); //dark brown
                renderer.addClassBreakInfo(
                    Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [196, 72, 2, 0.6], outline: sls})
                ); //dark orange
                renderer.addClassBreakInfo(
                    Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [251, 166, 52, 0.6], outline: sls})
                ); //orange
                renderer.addClassBreakInfo(
                    Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)), 
                    new SimpleFillSymbol({color: [253, 192, 76, 0.6], outline: sls})
                ); //light orange
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)),
                    maxValue: 0.001,
                    symbol: new SimpleFillSymbol({color: [254, 230, 151, 0.6], outline: sls}), //yellow
                    label: '<0 – ' + Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1))
                });
                // zero (1 class)
                renderer.addClassBreakInfo({
                    minValue: 0.001,
                    maxValue: 0,
                    symbol: new SimpleFillSymbol({color: [128, 128, 128, 0.6], outline: sls}),
                    label: '0'
                });
                // positive (1 class)
                renderer.addClassBreakInfo({
                    minValue: -0.001,
                    maxValue: Number((smallestVal).toFixed(1)),
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}), //blue
                    label: '>0'
                });
            }
        };
       layer.renderer = renderer
       layer.visible = true
    };

    /**
     * Asynchronously builds popup template for OCONUS feature layer. Called in loadOCONUS()
     * function. Contains conditions for climate variable selected. Pulls in specific fields
     * and builds dynamic arcade expressions.
     * @param res
     * @param layer
     * @param domain
     * @param fieldname
     * @param popupTitle
     */
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
            let popupTemplate = new PopupTemplate({
                title: popupTitle,
                content: [{
                    type: "fields",
                    fieldInfos: [{
                        fieldName: "HUC_12",
                        label: "HUC 12"
                    },{
                        fieldName: "expression/minfield",
                    },{
                        fieldName: "expression/fieldname"
                    },{
                        fieldName: "expression/maxfield"
                    }]
                }],
                expressionInfos: [{
                    name: "minfield",
                    title: "Ensemble Minimum of Changes",
                    expression: `var val = $feature.${minfield};
                        return Round(val * 100, 1) + " %"`
                },{
                    name: "fieldname",
                    title: "Ensemble Median of Changes",
                    expression: `var val = $feature.${fieldname};
                        return Round(val * 100, 1) + " %"`
                },{
                    name: "maxfield",
                    title: "Ensemble Maximum of Changes",
                    expression: `var val = $feature.${maxfield};
                        return Round(val * 100, 1) + " %"`
                }]
            })

            layer.popupTemplate = popupTemplate
        } else {
            let popupTemplate = new PopupTemplate({
                title: popupTitle,
                content: [{
                    type: "fields",
                    fieldInfos: [{
                        fieldName: "HUC_12",
                        label: "HUC 12"
                    },{
                        fieldName: minfield,
                        label: "Ensemble Minimum of Changes",
                        format: {places: 1}
                    },{
                        fieldName: fieldname, 
                        label: "Ensemble Median of Changes",
                        format: {places: 1}
                    },{
                        fieldName: maxfield,
                        label: "Ensemble Maximum of Changes",
                        format: {places: 1}
                    }]
                }]
            })
            layer.popupTemplate = popupTemplate
         }
    };

    /**
     * Builds a readable string to describe selections represented in feature layer.
     * @param selections - object returned from getSelections()
     */
    function buildOconusId(selections) {
        return ('Median ' + selections['Season'].label + ' ' + selections['Variable'].label + ', ' + selections['Period'].label)
    };

    /**
     * Builds a string that aligns with OCONUS field for queries, definitionExpression, popup fields, etc.
     * @param selections - object returned from getSelections()
     */
    function buildOconusField(selections) {
        return ("ME" + selections['Season'].value + selections['Variable'].value + selections['Period'].value)
    };

    /**
     * Controlling function when 'Add to map' button is clicked.
     * Collects relevant selection data. Checks for missing selections.
     * If selections are missing, opens a calcite-notify component.
     * If not, runs the loadOCONUS() function. 
     */
    function getSelections() {
        let selections = {}
        climRefs.forEach(elem => {
            let option = elem.placeholder
            let value = elem.selectedItems[0]?.value
            let label = elem.selectedItems[0]?.textLabel
            selections[option] = {value: value, label: label}
        });
        if (hasValueUndefined(selections)) {
            climateNotify.removeAttribute("hidden")
            return
        } else {
            climateNotify.setAttribute("hidden", "")
            loadOCONUS(selections)
            return
        }
    }

    async function openDetails(option_name) {
        let optionsObj = options.filter((opt => opt.name == option_name))[0]
        let findPopover = document.querySelector(`[reference-element="${optionsObj.name}-details-popover-button"]`);
        if (!findPopover) {
            new TimeSeriesDetails({
                target: document.body,
                props: { optionsObj },
            });
        }
        let popover = document.querySelector(`[reference-element="${optionsObj.name}-details-popover-button"]`);
        popover.setAttribute("open", "");
        return optionsObj
    }
</script>

<calcite-panel
    data-testid="time-series-viewer"
    data-panel-id="time-series-viewer"
    heading="Time Series Layers"
    description="Explore changing landscapes and environment"
    open
    hidden
>
    <calcite-block expanded>
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
            <calcite-button 
                appearance="transparent"
                iconEnd="information"
                on:click={openDetails(clim.name)}
                id="{clim.name}-details-popover-button"
                class="info-button"
            />
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
    calcite-button.info-button {
        --calcite-ui-icon-color: #6a6a6a
    }
    calcite-combobox {
        margin-bottom: 8px;
    }

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
