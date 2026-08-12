<script>
    //TODO: en-dash for minuses in legend...add labels

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-list";
    import "@esri/calcite-components/dist/components/calcite-list-item";
    import "@esri/calcite-components/dist/components/calcite-notice";
    import "@esri/calcite-components/dist/components/calcite-action";
    
    import { 
        hasValueUndefined,
        largestAbsVal,
        openRightPanel,
        fetchData,
        isLayerTitleInMap,
        addLayer,
        getEALayerObject
    } from "src/shared/utilities.js";
    import { activeWidget } from "src/store.ts";
    import TimeSeriesDetails from "src/components/TimeSeriesViewer/TimeSeriesDetails.svelte";
    
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
    import PopupTemplate from "@arcgis/core/PopupTemplate";
    import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition.js";
    import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
    import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
    import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
    import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
    import MultidimensionalSubset from "@arcgis/core/layers/support/MultidimensionalSubset.js";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import Query from "@arcgis/core/rest/support/Query";
    import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
    import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";
    import { mount } from "svelte";
    import { addAlertMessage } from 'src/shared/addLayers.ts';

    export let geography;
    export let view;

    let climRefs = [];
    let cmaqRefs = [];
    let lcluPastRefs = [];
    let climateNotify;
    let cmaqNotify;
    let lcluPastNotify;
    let maxVal;
    let minVal;
    let timeSeriesDetailsTarget;
    const options = [ 
        { name: "Variable", options: [ 
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PRin", label: "Change in Precipitation (in)",
                info: "Change in total precipitation in inches or as fraction for the season or annually.",
                pdf: "Supplemental/Climate_Precip_NEXGDDP_OCONUS.pdf", d: "RAIN"
            },  
            {domains: "CONUS,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PRfr", label: "Change in Precipitation (fraction as %)", d: "RAINfr"},
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PEin", label: "Change in PET (in)",
                info: "Change in total potential evapotranspiration in inches or as fraction for the season or annually.",
                pdf: "Supplemental/Climate_PET_NEXGDDP_OCONUS.pdf", d: "PET"
            },
            {domains: "CONUS,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "PEfr", label: "Change in PET (fraction as %)", d: "PETfr"},
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "mxTF", label: "Change in Maximum Temperature (°F)",
                info: "Change in average maximum temperature in degrees Fahrenheit for the season or annually.",
                pdf: "Supplemental/Climate_Temp_NEXGDDP_OCONUS.pdf", d: "MAX_TEMP"
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "miTF", label: "Change in Minimum Temperature (°F)",
                info: "Change in average minimum temperature in degrees Fahrenheit for the season or annually.",
                pdf: "Supplemental/Climate_Temp_NEXGDDP_OCONUS.pdf", d: "MIN_TEMP"
            }
        ], description: "All variables are presented as a median, minimum and maximum of the NEX-GDDP-CMIP6 Global Climate Model ensemble."
    }, 
        { name: "Scenario by 2100", options: [
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp126", label: "Global mean: ↑ ≤3.6°F (SSP1-2.6)", 
                info: "SSP1 (“Sustainability”) assumes widespread global climate change mitigation policies, clean energy technologies, and natural environment conservancy. This scenario assumes very low GHG concentration levels and reflects the international climate policy goal of limiting global warming below 3.6°F (2.0°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp245", label: "Global mean: ↑4.9±1.3°F (SSP2-4.5)", 
                info: "SSP2 (“Middle of the Road”) assumes moderate global climate mitigation and adaptation and a slow progress in climate protection measures. This scenario is a medium pathway of future GHG concentrations. Global temperatures increase by 4.9±1.3°F (2.7±0.7°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp370", label: "Global mean: ↑6.5±1.6°F (SSP3-7.0)",
                info: "SSP3 (“Regional Rivalry”) assumes high challenges to mitigation and adaptation. Here, nationalism drives policy, and regional and local take precedence over global issues. Global temperatures increase by 6.5±1.6°F (3.6±0.9°C) at 2100 compared to PIA."
            },
            {domains: "Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "ssp585", label: "Global mean: ↑7.9 ±2.2°F (SSP5-8.5)",
                info: "SSP5 (“Fossil-fueled Development”) reflects high challenges to mitigation and low challenges to adaptation. It is characterized by steadily increasing GHG concentrations. It represents the upper boundary of the range of scenarios. Global temperatures increase by 7.9±2.2°F (4.4±1.2°C) at 2100 compared to PIA."
            },
            {domains: "CONUS", value: "rcp26", label: "Global mean: ↑2.9±0.8°F (RCP 2.6)", d: 1},
            {domains: "CONUS", value: "rcp45", label: "Global mean: ↑4.3±1.0°F (RCP 4.5)", d: 2},
            {domains: "CONUS", value: "rcp60", label: "Global mean: ↑5.1±1.0°F (RCP 6.0)", d: 3},
            {domains: "CONUS", value: "rcp85", label: "Global mean: ↑7.8±1.4°F (RCP 8.5)", d: 5}
        ], description: "Shared Socioeconomic Pathways (SSPs) reflect global trends in human activities and changes in radiative forcing that result from changes in atmospheric greenhouse gases (GHGs) and aerosol concentrations. In the SSP labels (like SSP1-2.6), the first number refers to a defined socioeconomic pathway (trends in population, policy, and economic growth), and the second refers to an increase in radiative forcing (W/m2) relative to pre-industrial (1850-1900) average (PIA)."
    },
        { name: "Season", options: [
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "A", label: "Annual", 
                info: "January through December of the same calendar year", d: 1
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "M", label: "Spring",
                info: "March, April, May", d: 3
            },  
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "J", label: "Summer",
                info: "June, July, August", d: 4
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "S", label: "Fall",
                info: "September, October, November", d: 5
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "D", label: "Winter",
                info: "December of previous year, January, February", d: 2
            },
            
        ]}, 
        { name: "Change Between Periods", options: [ 
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF1", label: "1976–2005 to 2025–2054", 
                info: "Recent history (1976–2005) to near-term future (2025–2054)", d: 1
            },  
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF2", label: "1976–2005 to 2045–2074",
                info: "Recent history (1976–2005) to mid-century (2045–2074)", d: 2
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "HF3", label: "1976–2005 to 2070–2099",
                info: "Recent history (1976–2005) to end-of-century (2070–2099)", d: 3
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "FF2", label: "2025–2054 to 2045–2074",
                info: "Near-term future (2025–2054) to mid-century (2045–2074)", d: 4
            },
            {domains: "CONUS,Alaska,AmericanSamoa,Guam,Hawaii,Puerto Rico,Virgin Islands", value: "FF3", label: "2025–2054 to 2070–2099",
                info: "Near-term future (2025–2054) to end-of-century (2070–2099)", d: 5
            }
        ], description: "Climate change variables were computed using 30–year periods: recent history (1976–2005), near-term future (2025–2054), mid-century (2045–2074), and end-of-century (2070–2099). Climate change variables are expressed as a change between different periods:"
    }];

    const popProjectedOptions = [
        { name: 'Scenario by 2100', options: [
            {label: "Global mean: ↑4.3±1.0°F (RCP 4.5 & SSP2)", value: "Global mean: ↑4.3±1.0°F (RCP 4.5 & SSP2)"},
            {label: "Global mean: ↑7.8±1.4°F (RCP 8.5 & SSP5)", value: "Global mean: ↑7.8±1.4°F (RCP 8.5 & SSP5)"}
        ]},
        { name: 'Model', options: [
            {label: "GISS-E2-R", value: "GISS-E2-R"},
            {label: "HadGEM2-ES", value: "HadGEM2-ES"}
        ]},
        { name: 'Change Between Periods', options: [
            {label: "2000 vs. 2040", value: "2000 vs. 2040"},
            {label: "2000 vs. 2060", value: "2000 vs. 2060"},
            {label: "2000 vs. 2080", value: "2000 vs. 2080"},
            {label: "2000 vs. 2100", value: "2000 vs. 2100"},
        ]},
    ]

    const lcluProjectedOptions = [
        { name: 'Scenario by 2100', options: [
            {label: "Global mean: ↑4.3±1.0°F (RCP 4.5 & SSP2)", value: "Global mean: ↑4.3±1.0°F (RCP 4.5 & SSP2)"},
            {label: "Global mean: ↑7.8±1.4°F (RCP 8.5 & SSP5)", value: "Global mean: ↑7.8±1.4°F (RCP 8.5 & SSP5)"}
        ]},
        { name: 'Model', options: [
            {label: "GISS-E2-R", value: "GISS-E2-R"},
            {label: "HadGEM2-ES", value: "HadGEM2-ES"}
        ]},
        { name: 'Period', options: [
            {label: "2000 (Historical)", value: "2000 (Historical)"},
            {label: "2040 (Near Term Future)", value: "2040 (Near Term Future)"},
            {label: "2060 (Mid-Century)", value: "2060 (Mid-Century)"},
            {label: "2080 (Late Century)", value: "2080 (Late Century)"},
            {label: "2100 (End of Century)", value: "2100 (End of Century)"},
        ]},
    ]

    const lcluPastOptions = [
        { name: 'LC/LU Class', options: [
            {domains: "CONUS", label: "All Classes", value: "all"},
            //{label: "Forest", value: "Forest"},
            //{label: "Change Forest (compared to 2024)", value: "Change Forest (compared to 2024)"},
        ]},
        { name: 'Year', options: [
            {domains: "CONUS", label: "1985", value: "1985", d: 599},
            {domains: "CONUS", label: "1995", value: "1995", d: 598},
            {domains: "CONUS", label: "2005", value: "2005", d: 597},
            {domains: "CONUS", label: "2015", value: "2015", d: 596},
            {domains: "CONUS", label: "2025", value: "2025", d: 588},
        ]},
    ]

    const cmaqPastOptions = [
        { name: 'Variable', options: [
            {domains: "CONUS", label: "Total Nitrogen Deposition", value: "Total Nitrogen Deposition",
                pdf: "Supplemental/Total_Nitrogen_Deposition_CMAQ.pdf",
                info: "This dataset portrays the 3-year annual average of total nitrogen deposition, for chosen period."
            },
            {domains: "CONUS", label: "Total Sulfur Deposition", value: "Total Sulfur Deposition",
                pdf: "Supplemental/Total_Sulfur_Deposition_CMAQ.pdf",
                info: "This dataset portrays the 3-year annual of total sulfur deposition kilograms per hectare per year, for chosen period."
            },
            {domains: "CONUS", label: "Ambient Sulfur Dioxide (SO2)", value: "Ambient Sulfur Dioxide (SO2)",
                pdf: "Supplemental/SO2_CMAQ.pdf",
                info: "This dataset portrays the 3-year average ambient concentration of sulfur dioxide (SO2) for chosen season and period."
            },
            {domains: "CONUS", label: "Tropospheric Ozone (O3)", value: "Tropospheric Ozone (O3)",
                pdf: "Supplemental/Tropospheric_Ozone_CMAQ.pdf",
                info: "This dataset portrays the 3-year average ambient ozone concentration for chosen season and period, expressed as the maximum daily 8-hour average (MDA8) in parts per billion by volume (ppbV)."
            },
            {domains: "CONUS", label: "Particulate Matter (PM2.5)", value: "Particulate Matter (PM2.5)",
                pdf: "Supplemental/PM2.5_CMAQ.pdf",
                info: "This dataset portrays the 3-year average ambient concentration of fine particulate matter with a diameter of 2.5 micrometers (µm) or smaller (PM2.5) for chosen season and period."
            },
            {domains: "CONUS", label: "Particulate Matter (PM10)", value: "Particulate Matter (PM10)",
                pdf: "Supplemental/PM10_CMAQ.pdf",
                info: "This dataset portrays the 3-year average ambient concentration of coarse particulate matter with a diameter between 2.5 and 10 micrometers (µm) (PM10) for chosen season and period."
            }
        ]},
        { name: 'Season', options: [
            {domains: "CONUS", value: "A", label: "Annual", info: "January through December of the same calendar year"},
            {domains: "CONUS", value: "M", label: "Spring", info: "March, April, May"},
            {domains: "CONUS", value: "J", label: "Summer", info: "June, July, August"},
            {domains: "CONUS", value: "S", label: "Fall", info: "September, October, November"},
            {domains: "CONUS", value: "D", label: "Winter", info: "December of previous year, January, February"},
            {domains: "CONUS", value: "Ozone Season (for tropospheric ozone only)", label: "Ozone Season (for tropospheric ozone only)",
                info: "April, May, June, July, August, September"
            }
        ]},
        { name: 'Period', options: [
            {domains: "CONUS", label: "2005–2007", value: "2005–2007"},
            {domains: "CONUS", label: "2008–2010", value: "2008–2010"},
            {domains: "CONUS", label: "2011–2013", value: "2011–2013"},
            {domains: "CONUS", label: "2014–2016", value: "2014–2016"},
            {domains: "CONUS", label: "2017–2019", value: "2017–2019"}
        ], description: "Choose 3-yr period."},
    ]

    const domainMap = {
        "Puerto Rico,Virgin Islands": "VIPR",
        "Guam": "GUAM",
        "AmericanSamoa": "AMSAM",
        "Hawaii": "HAWAII",
        "Alaska": "ALASKA",
        "CONUS": "CONUS"
    }

    /**
     * Filters selections in the Climate dropdowns based on selected geography.
     */
    $: options_filtered = options.map(obj => {
        return {...obj, options: obj.options.filter(opt => opt.domains.includes(geography))}
    });

    $: cmaqPastOptions_filtered = cmaqPastOptions.map(obj => {
        return {...obj, options: obj.options.filter(opt => opt.domains.includes(geography))}
    });

    $: lcluPastOptions_filtered = lcluPastOptions.map(obj => {
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
        openRightPanel($activeWidget, "layers");
        console.log('OCONUS selections: ', selections)
        let fieldname = buildOconusField(selections);
        let oconusUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/NEXGDDP_${selections['Scenario by 2100'].value}/FeatureServer/0`;
        let oLayerId = "NEXGDDP" + domain + selections['Scenario by 2100'].value + fieldname;
        let oconusSelections = buildOconusId(selections);
        let oLayer = new FeatureLayer({
            url: oconusUrl, 
            //opacity: 0.6, 
            id: oLayerId, 
            definitionExpression: "domain = '" + `${domain}` + "' AND " + `${fieldname}` + " IS NOT NULL",
            title: geography.replaceAll(",", " & ").replace(/([a-z])([A-Z])/g, '$1 $2') + ', ' + selections['Scenario by 2100'].value.toUpperCase() + ', ' + oconusSelections,
            visible: false
        });
        let popupTitle = selections['Scenario by 2100'].value.toUpperCase() + ', ' + oconusSelections;

        let drawCheck = isLayerTitleInMap(oLayer.title, view);
        if (drawCheck) {
            addAlertMessage('', 'This layer is already in the map: ' + oLayer.title, 'warning', 'Layer is already in the map');
        } else {
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
        }
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
                let largestVal = largestAbsVal(maxVal, minVal); // don't round fractions until the end
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
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
                let largestVal = largestAbsVal(Math.ceil(maxVal), Math.floor(minVal));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                // negative (3 classes)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)), 
                    maxValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [61, 92, 164, 0.6], outline: sls}),
                    label: Number((smallestVal).toFixed(1)) + ' – ' + Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [104, 159, 201, 0.6], outline: sls}),
                    label: Number((smallestVal + negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1))
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
                    symbol: new SimpleFillSymbol({color: [250, 157, 91, 0.6], outline: sls}),
                    label: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [233, 92, 59, 0.6], outline: sls}),
                    label: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [206, 45, 43, 0.6], outline: sls}),
                    label: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [165, 0, 38, 0.6], outline: sls}),
                    label: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1))
                });
            }
            if (clim.value == "PRin" || clim.value == "PEin") {
                // compare the min and max of to domain, then whichever is largest number, the other side of break is max/min (9 total classes)
                let largestVal = largestAbsVal(Math.ceil(maxVal), Math.floor(minVal));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                // negative (3 classes)
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal).toFixed(1)), 
                    maxValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [133, 46, 4, 0.6], outline: sls}),
                    label: Number((smallestVal).toFixed(1)) + ' – ' + Number((smallestVal + negativeBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal + negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [218, 92, 10, 0.6], outline: sls}),
                    label: Number((smallestVal + negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1))
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
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls}),
                    label: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}),
                    label: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls}),
                    label: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls}),
                    label: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1))
                });
            }
        } else if (minVal > 0 && maxVal > 0) { // when the max and min value is greater than 0
            if (clim.value == "PRfr" || clim.value == "PEfr") {
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = maxVal; // don't round fractions until the end
                let smallestVal = -1;
                let positiveBreakDiff = (largestVal / 5);
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
                let largestVal = Math.ceil(maxVal);
                let smallestVal = -1;
                let positiveBreakDiff = (largestVal / 5);
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
                    symbol: new SimpleFillSymbol({color: [250, 157, 91, 0.6], outline: sls}),
                    label: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [233, 92, 59, 0.6], outline: sls}),
                    label: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [206, 45, 43, 0.6], outline: sls}),
                    label: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [165, 0, 38, 0.6], outline: sls}),
                    label: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1))
                });
            }
            if (clim.value == "PRin" || clim.value == "PEin") {
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = Math.ceil(maxVal);
                let smallestVal = -1;
                let positiveBreakDiff = (largestVal / 5);
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
                    symbol: new SimpleFillSymbol({color: [79, 280, 252, 0.6], outline: sls}),
                    label: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 127, 216, 0.6], outline: sls}),
                    label: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), 
                    maxValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [0, 0, 139, 0.6], outline: sls}),
                    label: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((largestVal - positiveBreakDiff).toFixed(1)), 
                    maxValue: Number(largestVal.toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [175, 21, 137, 0.6], outline: sls}),
                    label: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1))
                });
            }
        } else { // all negative
            if (clim.value == "PRfr" || clim.value == "PEfr") {
                // min is the smallest number, the max is 1 (7 total classes)
                let largestVal = 1;
                let smallestVal = minVal; // don't round fractions until the end
                let negativeBreakDiff = (smallestVal / 5);
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
                let largestVal = 1;
                let smallestVal = Math.floor(minVal);
                let negativeBreakDiff = (smallestVal / 5);
                // negative (5 classes)
                renderer.addClassBreakInfo({
                    minValue: Number(smallestVal.toFixed(1)), 
                    maxValue: Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [54, 75, 38, 0.6], outline: sls}),
                    label: Number(smallestVal.toFixed(1)) + ' – ' + Number((smallestVal - negativeBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [61, 92, 164, 0.6], outline: sls}),
                    label: Number((smallestVal - negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    maxValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [104, 159, 201, 0.6], outline: sls}),
                    label: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)) + ' – ' + Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    maxValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [165, 210, 229, 0.6], outline: sls}),
                    label: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)) + ' – ' + Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1))
                });
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
                let largestVal = 1;
                let smallestVal = Math.floor(minVal);
                let negativeBreakDiff = (smallestVal / 5);
                // negative (5 classes)
                renderer.addClassBreakInfo({
                    minValue: Number(smallestVal.toFixed(1)), 
                    maxValue: Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [102, 37, 6, 0.6], outline: sls}),
                    label: Number(smallestVal.toFixed(1)) + ' – ' + Number((smallestVal - negativeBreakDiff).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - negativeBreakDiff).toFixed(1)), 
                    maxValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [196, 72, 2, 0.6], outline: sls}),
                    label: Number((smallestVal - negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)), 
                    maxValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [251, 166, 52, 0.6], outline: sls}),
                    label: Number((smallestVal - (2 * negativeBreakDiff)).toFixed(1)) + ' – ' + Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1))
                });
                renderer.addClassBreakInfo({
                    minValue: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)), 
                    maxValue: Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1)), 
                    symbol: new SimpleFillSymbol({color: [253, 192, 76, 0.6], outline: sls}),
                    label: Number((smallestVal - (3 * negativeBreakDiff)).toFixed(1)) + ' – ' + Number((smallestVal - (4 * negativeBreakDiff)).toFixed(1))
                });
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
        return ('Median ' + selections['Season'].label + ' ' + selections['Variable'].label + ', ' + selections['Change Between Periods'].label)
    };

    /**
     * Builds a string that aligns with OCONUS field for queries, definitionExpression, popup fields, etc.
     * @param selections - object returned from getSelections()
     */
    function buildOconusField(selections) {
        return ("ME" + selections['Season'].value + selections['Variable'].value + selections['Change Between Periods'].value)
    };

    /**
     * Main process function to add CONUS data to map.
     * @param selections - object returned from getSelections()
     */
    async function loadCONUS(selections) {
        openRightPanel($activeWidget, "layers") 
        console.log('CONUS selections: ', selections)
        let selectedTitle = domain + ", " + selections['Scenario by 2100'].label + ", " + selections['Season'].label + " " + selections['Variable'].label + ", " + selections['Change Between Periods'].label
        let drawCheck = isLayerTitleInMap(selectedTitle, view);
        if (drawCheck) {
            addAlertMessage('', 'This layer is already in the map: ' + selectedTitle, 'warning', 'Layer is already in the map');
        } else {
            const mdURL = "https://awseastaging.epa.gov/arcgis/rest/services/test_services/NEX_DCP30_CONUS/ImageServer"
            let mosaicRule = new MosaicRule();
            mosaicRule.multidimensionalDefinition = [];
            mosaicRule.multidimensionalDefinition.push(new DimensionalDefinition({
                variableName: selections['Variable'].d,
                dimensionName: "scenario",
                values: [selections['Scenario by 2100'].d], 
                isSlice: true
            }));
            mosaicRule.multidimensionalDefinition.push(new DimensionalDefinition({
                variableName: selections['Variable'].d,
                dimensionName: "season",
                values: [selections['Season'].d], 
                isSlice: true
            }));
            mosaicRule.multidimensionalDefinition.push(new DimensionalDefinition({
                variableName: selections['Variable'].d,
                dimensionName: "period",
                values: [selections['Change Between Periods'].d], 
                isSlice: true
            }));

            const layer = new ImageryLayer({
                url: mdURL,
                format: "lerc",
                mosaicRule,
                title: selectedTitle,
                popupTemplate: {
                    title: `${selectedTitle} value: {Raster.ServicePixelValue.Raw}`,
                    fieldInfos: [
                        {
                            fieldName: "Raster.ServicePixelValue.Raw",
                            format: {
                                places: 2,
                                digitSeparator: true,
                            },
                        },
                    ],
                },
            });
        
            //get stats on the image slice by finding OBJECTID of the single raster
            const idQuery = new Query({
                where: `season=${selections['Season'].d} AND period=${selections['Change Between Periods'].d} AND scenario=${selections['Scenario by 2100'].d} AND variable='${selections['Variable'].d}'`
            })
            const minmax = await layer.queryObjectIds(idQuery).then((imageLyr) => {
                let imageId = imageLyr[0]
                let infoUrl = mdURL + `/${imageId}/info?f=json`
                return fetchData(infoUrl)
            }).then(sliceInfo => {
                let minmax = sliceInfo.statistics[0].slice(0,2)
                return minmax
            })

            let rangeMaps = buildInputRanges(minmax, selections);
            let attributeTable = buildAttributeTable(minmax, selections);

            const remap = rasterFunctionUtils.remap({
                rangeMaps
            });

            const int = rasterFunctionUtils.int({
                raster: remap,
            })

            const tableFxn = rasterFunctionUtils.table({
                attributeTable,
                raster: int
            });

            layer.rasterFunction = tableFxn;
        
            view.map.add(layer)
            console.log(layer)
            view.whenLayerView(layer).then((layerView) => {
                const multidimInfo = layer.multidimensionalInfo;
                    layerView.highlightOptions = {
                    color: [0,0,0,0],
                    haloOpacity: 0, 
                    fillOpacity: 0
                }
                console.log("layer: ", multidimInfo);
            });
        }
    }

    /**
     * 
     * @param minmax - array [min, max]
    */
    function buildAttributeTable(minmax, selections) {
        console.log(minmax)
        const attributeTable = FeatureSet.fromJSON({
            displayFieldName: "",
            fields: [
            {
                name: "ObjectID",
                type: "esriFieldTypeOID",
                alias: "OID"
            },
            {
                name: "Value",
                type: "esriFieldTypeInteger",
                alias: "Value"
            },
            {
                name: "ClassName",
                type: "esriFieldTypeString",
                alias: "ClassName",
                length: 256
            },
            {
                name: "Red",
                type: "esriFieldTypeInteger",
                alias: "Red"
            },
            {
                name: "Green",
                type: "esriFieldTypeInteger",
                alias: "Green"
            },
            {
                name: "Blue",
                type: "esriFieldTypeInteger",
                alias: "Blue"
            },
            {
                name: "Alpha",
                type: "esriFieldTypeInteger",
                alias: "Alpha"
            }
            ],
            features: []
        });
        if (selections['Variable'].value == "PEfr") {
            attributeTable.features.push({
                attributes: {
                    ObjectID: 1,
                    Value: 0,
                    ClassName: '-100 – -60%',
                    Red: 133,
                    Green: 46,
                    Blue: 4,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 2,
                    Value: 1,
                    ClassName: '-60 – -30%',
                    Red: 218,
                    Green: 92,
                    Blue: 10,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 3,
                    Value: 2,
                    ClassName: '-30 – <0%',
                    Red: 254,
                    Green: 230,
                    Blue: 151,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 4,
                    Value: 3,
                    ClassName: "0%",
                    Red: 128,
                    Green: 128,
                    Blue: 128,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 5,
                    Value: 4,
                    ClassName: '>0 – 10%',
                    Red: 185,
                    Green: 231,
                    Blue: 248,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 6,
                    Value: 5,
                    ClassName: '10 – 20%',
                    Red: 79,
                    Green: 280,
                    Blue: 252,
                    Alpha: 255
                }
                }, {
                attributes: {
                    ObjectID: 7,
                    Value: 6,
                    ClassName: '20 – 60%',
                    Red: 0,
                    Green: 127,
                    Blue: 216,
                    Alpha: 255
                }                    
                }, {
                attributes: {
                    ObjectID: 8,
                    Value: 7,
                    ClassName: '60 – 100%',
                    Red: 0,
                    Green: 0,
                    Blue: 139,
                    Alpha: 255
                }   
                }, {
                attributes: {
                    ObjectID: 9,
                    Value: 8,
                    ClassName: '>100%',
                    Red: 175,
                    Green: 21,
                    Blue: 137,
                    Alpha: 255
                }  
                }
            )
            console.log(attributeTable)
            return attributeTable
        }
        if (selections['Variable'].value == "PRin" || selections['Variable'].value == "PEin") {
            if (minmax[0] < 0 && minmax[1] > 0) { // 9 class
                let largestVal = largestAbsVal(Math.ceil(minmax[1]), Math.floor(minmax[0]));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName: Number((smallestVal).toFixed(1)) + ' – ' + Number((smallestVal + negativeBreakDiff).toFixed(1)),
                        Red: 133,
                        Green: 46,
                        Blue: 4,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: Number((smallestVal + negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)),
                        Red: 218,
                        Green: 92,
                        Blue: 10,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)) + ' – <' + 0,
                        Red: 254,
                        Green: 230,
                        Blue: 151,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: "0",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                        Red: 185,
                        Green: 231,
                        Blue: 248,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)),
                        Red: 79,
                        Green: 280,
                        Blue: 252,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)),
                        Red: 0,
                        Green: 127,
                        Blue: 216,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 8,
                        Value: 7,
                        ClassName: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1)),
                        Red: 0,
                        Green: 0,
                        Blue: 139,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 9,
                        Value: 8,
                        ClassName: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1)),
                        Red: 175,
                        Green: 21,
                        Blue: 137,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            } else if (minmax[0] >= 0 && minmax[1] > 0) { // when the max and min value is greater than 0}
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = Math.ceil(minmax[1]);
                let positiveBreakDiff = (largestVal / 5);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName:'<0',
                        Red: 133,
                        Green: 46,
                        Blue: 4,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: "0",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                        Red: 185,
                        Green: 231,
                        Blue: 248,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)),
                        Red: 79,
                        Green: 280,
                        Blue: 252,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)),
                        Red: 0,
                        Green: 127,
                        Blue: 216,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1)),
                        Red: 0,
                        Green: 0,
                        Blue: 139,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1)),
                        Red: 175,
                        Green: 21,
                        Blue: 137,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            }
        } else if (selections['Variable'].value == "PRfr") {
            if (minmax[0] < 0 && minmax[1] > 0) { // 9 class
                let largestVal = largestAbsVal(Math.ceil(minmax[1]), Math.floor(minmax[0]));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName: Number((smallestVal * 100).toFixed(1)) + ' – ' + Number(((smallestVal + negativeBreakDiff) * 100).toFixed(1)) + '%',
                        Red: 133,
                        Green: 46,
                        Blue: 4,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: Number(((smallestVal + negativeBreakDiff) * 100).toFixed(1)) + ' – ' + Number(((smallestVal + (2 * negativeBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 218,
                        Green: 92,
                        Blue: 10,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: Number(((smallestVal + (2 * negativeBreakDiff)) * 100).toFixed(1)) + ' – <' + 0 + '%',
                        Red: 254,
                        Green: 230,
                        Blue: 151,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: "0%",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: '>0 – ' + Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 185,
                        Green: 231,
                        Blue: 248,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 79,
                        Green: 280,
                        Blue: 252,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 0,
                        Green: 127,
                        Blue: 216,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 8,
                        Value: 7,
                        ClassName: Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + '%',
                        Red: 0,
                        Green: 0,
                        Blue: 139,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 9,
                        Value: 8,
                        ClassName: Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + ' – ' + Number((largestVal * 100).toFixed(1)) + '%',
                        Red: 175,
                        Green: 21,
                        Blue: 137,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            } else if (minmax[0] >= 0 && minmax[1] > 0) { // when the max and min value is greater than 0}
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = Math.ceil(minmax[1]);
                let positiveBreakDiff = (largestVal / 5);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName:'<0%',
                        Red: 133,
                        Green: 46,
                        Blue: 4,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: "0%",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: '>0 – ' + Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 185,
                        Green: 231,
                        Blue: 248,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: Number(((largestVal - (4 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 79,
                        Green: 280,
                        Blue: 252,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: Number(((largestVal - (3 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + '%',
                        Red: 0,
                        Green: 127,
                        Blue: 216,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number(((largestVal - (2 * positiveBreakDiff)) * 100).toFixed(1)) + ' – ' + Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + '%',
                        Red: 0,
                        Green: 0,
                        Blue: 139,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number(((largestVal - positiveBreakDiff) * 100).toFixed(1)) + ' – ' + Number((largestVal * 100).toFixed(1)) + '%',
                        Red: 175,
                        Green: 21,
                        Blue: 137,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            }
        } else if (selections['Variable'].value == "mxTF" || selections['Variable'].value == "miTF") {
            if (minmax[0] < 0 && minmax[1] > 0) { // 9 class
                let largestVal = largestAbsVal(Math.ceil(minmax[1]), Math.floor(minmax[0]));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName: Number((smallestVal).toFixed(1)) + ' – ' + Number((smallestVal + negativeBreakDiff).toFixed(1)),
                        Red: 61,
                        Green: 92,
                        Blue: 164,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: Number((smallestVal + negativeBreakDiff).toFixed(1)) + ' – ' + Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)),
                        Red: 104,
                        Green: 159,
                        Blue: 201,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)) + ' – <' + 0,
                        Red: 165,
                        Green: 210,
                        Blue: 229,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: "0",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                        Red: 252,
                        Green: 219,
                        Blue: 143,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)),
                        Red: 250,
                        Green: 157,
                        Blue: 91,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)),
                        Red: 233,
                        Green: 92,
                        Blue: 59,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 8,
                        Value: 7,
                        ClassName: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1)),
                        Red: 206,
                        Green: 45,
                        Blue: 43,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 9,
                        Value: 8,
                        ClassName: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1)),
                        Red: 165,
                        Green: 0,
                        Blue: 38,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            } else if (minmax[0] >= 0 && minmax[1] > 0) { // when the max and min value is greater than 0}
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = Math.ceil(minmax[1]);
                let positiveBreakDiff = (largestVal / 5);
                attributeTable.features.push({
                    attributes: {
                        ObjectID: 1,
                        Value: 0,
                        ClassName:'<0',
                        Red: 61,
                        Green: 92,
                        Blue: 164,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 2,
                        Value: 1,
                        ClassName: "0",
                        Red: 128,
                        Green: 128,
                        Blue: 128,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 3,
                        Value: 2,
                        ClassName: '>0 – ' + Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)),
                        Red: 252,
                        Green: 219,
                        Blue: 143,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 4,
                        Value: 3,
                        ClassName: Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)),
                        Red: 250,
                        Green: 157,
                        Blue: 91,
                        Alpha: 255
                    }
                    }, {
                    attributes: {
                        ObjectID: 5,
                        Value: 4,
                        ClassName: Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)),
                        Red: 233,
                        Green: 92,
                        Blue: 59,
                        Alpha: 255
                    }                    
                    }, {
                    attributes: {
                        ObjectID: 6,
                        Value: 5,
                        ClassName: Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)) + ' – ' + Number((largestVal - positiveBreakDiff).toFixed(1)),
                        Red: 206,
                        Green: 45,
                        Blue: 43,
                        Alpha: 255
                    }   
                    }, {
                    attributes: {
                        ObjectID: 7,
                        Value: 6,
                        ClassName: Number((largestVal - positiveBreakDiff).toFixed(1)) + ' – ' + Number(largestVal.toFixed(1)),
                        Red: 165,
                        Green: 0,
                        Blue: 38,
                        Alpha: 255
                    }  
                    }
                )
                console.log(attributeTable)
                return attributeTable
            }
        }
    };

    /**
     * Build an array of input ranges to update the rft for visualization
     * specific to the selected raster.
     * @param minmax - array [min, max]
     */
    function buildInputRanges(minmax, selections) {
        if (selections['Variable'].value == "PEfr") {
            console.log(minmax)
            // breaks => (-1,-0.6,-0.4,-0.3,-0.2,-0.1,0,0.1,0.2,0.3,0.4,0.6,0.8,1,max)
            let a = [];
            a.push({range: [-1, -0.6], output: 0});
            a.push({range: [-0.6, -0.3], output: 1});
            a.push({range: [-0.3, -0.001], output: 2});
            a.push({range: [0, 0.001], output: 3});
            a.push({range: [0.001, 0.1], output: 4});
            a.push({range: [0.1, 0.2], output: 5});
            a.push({range: [0.2, 0.6], output: 6});
            a.push({range: [0.6, 1], output: 7});
            a.push({range: [1, minmax[1]], output: 8});
            return a
        } else {
            // when there are negative and positive values, create 9 value diverging color classification 
            if (minmax[0] < 0 && minmax[1] > 0) {
                let largestVal = largestAbsVal(Math.ceil(minmax[1]), Math.floor(minmax[0]));
                let smallestVal = (-1 * largestVal);
                let positiveBreakDiff = (largestVal / 5);
                let negativeBreakDiff = (largestVal / 3);
                let a = []
                a.push({range: [Number((smallestVal).toFixed(1)), Number((smallestVal + negativeBreakDiff).toFixed(1))], output: 0});
                a.push({range: [Number((smallestVal + negativeBreakDiff).toFixed(1)), Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1))], output: 1});
                a.push({range: [Number((smallestVal + (2 * negativeBreakDiff)).toFixed(1)), -0.001], output: 2});
                a.push({range: [0, 0.001], output: 3});
                a.push({range: [0.001, Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))], output: 4});
                a.push({range: [Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)), Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))], output: 5});
                a.push({range: [Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))], output: 6});
                a.push({range: [Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), Number((largestVal - positiveBreakDiff).toFixed(1))], output: 7});
                a.push({range: [Number((largestVal - positiveBreakDiff).toFixed(1)), Number(largestVal.toFixed(1))], output: 8});
                return a
            } else if (minmax[0] >= 0 && minmax[1] > 0) { // when the max and min value is greater than 0
                // max is the largest number, the min is -1 (7 total classes)
                let largestVal = Math.ceil(minmax[1]);
                console.log('largest value :', largestVal)
                let smallestVal = -1;
                let positiveBreakDiff = (largestVal / 5);
                let a = [];
                // negative (1 class)
                a.push({range: [Number((smallestVal).toFixed(1)), -0.001], output: 0});
                // zero (1 class)
                a.push({range: [0, 0.001], output: 1});
                // positive (5 classes)
                a.push({range: [0.001, Number((largestVal - (4 * positiveBreakDiff)).toFixed(1))], output: 2});
                a.push({range: [Number((largestVal - (4 * positiveBreakDiff)).toFixed(1)), Number((largestVal - (3 * positiveBreakDiff)).toFixed(1))], output: 3});
                a.push({range: [Number((largestVal - (3 * positiveBreakDiff)).toFixed(1)), Number((largestVal - (2 * positiveBreakDiff)).toFixed(1))], output: 4});
                a.push({range: [Number((largestVal - (2 * positiveBreakDiff)).toFixed(1)), Number((largestVal - positiveBreakDiff).toFixed(1))], output: 5});
                a.push({range: [Number((largestVal - positiveBreakDiff).toFixed(1)), Number(largestVal.toFixed(1))], output: 6});
                return a
            } else {
                console.log("don't fit")
            }
        }
    };

    async function loadLcluPast(selections) {
        let lObject;
        if (selections['LC/LU Class']['value'] = 'all') {
            let id = selections['Year']['d'];
            lObject = await getEALayerObject(id);
            openRightPanel($activeWidget, "layers");
            let drawCheck = isLayerTitleInMap(lObject.name, view);
            if (drawCheck) {
                addAlertMessage('', 'This layer is already in the map: ' + lObject.name, 'warning', 'Layer is already in the map');
            } else {
                addLayer(lObject, view);
            }
        }
    }

    /**
     * Controlling function when 'Add to map' button is clicked.
     * Collects relevant selection data. Checks for missing selections.
     * If selections are missing, opens a calcite-notify component.
     * If not, runs the appropriate load function. 
     */
    function getSelections(theme) {
        let selections = {}
        switch (theme) {
            case "clim":
                climRefs.forEach(elem => {
                    let option = elem.placeholder
                    let value = elem.selectedItems[0]?.value
                    let label = elem.selectedItems[0]?.heading
                    let d = elem.selectedItems[0]?.metadata
                    selections[option] = {value: value, label: label, d: d}
                });
                if (hasValueUndefined(selections)) {
                    climateNotify.removeAttribute("hidden")
                    return
                } else {
                    (domain != "CONUS") ? loadOCONUS(selections) : loadCONUS(selections)
                    climateNotify.setAttribute("hidden", "")
                    return
                }
            case "lcluPast":
                lcluPastRefs.forEach(elem => {
                    let option = elem.placeholder;
                    let value = elem.selectedItems[0]?.value;
                    let label = elem.selectedItems[0]?.heading;
                    let d = elem.selectedItems[0]?.metadata;
                    selections[option] = {value: value, label: label, d: d}
                });
                if (hasValueUndefined(selections)) {
                    lcluPastNotify.removeAttribute("hidden")
                    return
                } else {
                    loadLcluPast(selections)
                    lcluPastNotify.setAttribute("hidden", "")
                    return
                }
                console.log(theme)
        }
    }

    /**
     * Filters options constant into an options object for the selected info button.
     * Instantiates a TimeSeriesDetails.svelte component with the options object prop. 
     * Opens the instatiated component's popover element.
     * @param theme - time series theme
     * @param option_name - which option the i-button is for
     */
    async function openDetails(theme, option_name) {
        let optionsObj;
        if (theme === 'clim') {
            optionsObj = options.filter((opt => opt.name == option_name))[0]
        } else if (theme === 'cmaq') {
            optionsObj = cmaqPastOptions.filter((opt => opt.name == option_name))[0]
        }
        console.log(optionsObj)
        let findPopover = document.querySelector(`[reference-element="${theme}-${optionsObj.name}-details-popover-button"]`);
        if (!findPopover) {
            mount(TimeSeriesDetails, {
                target: timeSeriesDetailsTarget || document.body,
                props: { theme, optionsObj },
            });
        }
        let popover = document.querySelector(`[reference-element="${theme}-${optionsObj.name}-details-popover-button"]`);
        popover.setAttribute("open", "");
        return optionsObj

    }

    function listItemExpand() {
        !this.open
            ? this.setAttribute("expanded", "")
            : this.removeAttribute("expanded");
    }
</script>

<calcite-panel
    data-testid="time-series-viewer"
    data-panel-id="time-series-viewer"   
    open
    hidden
>
    <calcite-block scale="m" id="domainHeader" heading="" expanded
        style="margin-block: 0px; margin-top: 0px; margin-block-end: 0px"
        description="">
        <p class="tab-description">
            Select a theme, time period, and other attributes below
        </p>
        <calcite-list
            label="timeseries"
            display-mode="nested"
            selection-mode="none"
            scale="auto"
            style="border-top: 1px solid #dedede; padding-top: 3px"
        >
            <calcite-list-item
                id='Impacts to Air/Water/Land (Past)'
                label='Impacts to Air/Water/Land (Past)'
                value='Impacts to Air/Water/Land (Past)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='Community Multiscale Air Quality (CMAQ)'
                    >
                    {#each cmaqPastOptions_filtered as cmaqPast, q (cmaqPast.name)}
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            bind:this={cmaqRefs[q]}
                            id="cmaqVarSelect"
                            scale="m"
                            placeholder={cmaqPast.name}
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each cmaqPast.options as o}
                            <calcite-combobox-item value={o.value} heading={o.label}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            on:click={() => openDetails('cmaq', cmaqPast.name)}
                            id="cmaq-{cmaqPast.name}-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    {/each}
                    <div slot="content-bottom">
                        <calcite-notice hidden bind:this={cmaqNotify} scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button>Coming Soon!</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
            <calcite-list-item
                id='Land Cover/Land Use (Past)'
                label='Land Cover/Land Use (Past)'
                value='Land Cover/Land Use (Past)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='Raster data at 30m resolution'
                    >
                    {#each lcluPastOptions_filtered as lcluPast, l (lcluPast.name)}
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            bind:this={lcluPastRefs[l]}
                            id="lcluPastVarSelect"
                            scale="m"
                            placeholder={lcluPast.name}
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each lcluPast.options as o}
                            <calcite-combobox-item value={o.value} heading={o.label} metadata={o.d}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            id="pop-proj-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    {/each}
                    <div slot="content-bottom">
                        <calcite-notice hidden bind:this={lcluPastNotify} scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button on:click={() => getSelections('lcluPast')}>Add to map</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
            <calcite-list-item
                id='Land Cover/Land Use (Projected)'
                label='Land Cover/Land Use (Projected)'
                value='Land Cover/Land Use (Projected)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='Projected Change in US LC/LU (ICLUS)'
                    >
                    {#each lcluProjectedOptions as lcluProj}
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            id="climateVarSelect"
                            scale="m"
                            placeholder={lcluProj.name}
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each lcluProj.options as o}
                            <calcite-combobox-item value={o.value} heading={o.label}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            id="pop-proj-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    {/each}
                    <div slot="content-bottom">
                        <calcite-notice hidden bind:this={climateNotify} scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button>Coming Soon!</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
            <calcite-list-item
                id='Population (Past)'
                label='Population (Past)'
                value='Population (Past)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='US Population'
                    >
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            id="climateVarSelect"
                            scale="m"
                            placeholder="Year"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each ['2010', '2020'] as o}
                            <calcite-combobox-item value={o} heading={o} metadata={o}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            id="pop-past-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    <div slot="content-bottom">
                        <calcite-notice hidden scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button>Coming Soon!</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
            <calcite-list-item
                id='Population (Projected)'
                label='Population (Projected)'
                value='Population (Projected)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='Projected Change in US Population (ICLUS)'
                    >
                    {#each popProjectedOptions as popProj}
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            id="climateVarSelect"
                            scale="m"
                            placeholder={popProj.name}
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each popProj.options as o}
                            <calcite-combobox-item value={o.value} heading={o.label}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            id="pop-proj-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    {/each}
                    <div slot="content-bottom">
                        <calcite-notice hidden bind:this={climateNotify} scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button>Coming Soon!</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
            <calcite-list-item
                id='Weather Normals (Projected)'
                label='Weather Normals (Projected)'
                value='Weather Normals (Projected)'
                on:calciteListItemSelect={listItemExpand}
            >
                <calcite-list-item 
                    on:calciteListItemSelect={e=>e.stopPropagation()}
                    description='Projected Changes in 30-year Weather Normals'
                    >
                    {#each options_filtered as clim, c (clim.name)}
                    <div slot="content-bottom" id="combobox-div">
                        <calcite-combobox
                            bind:this={climRefs[c]}
                            id="climateVarSelect"
                            scale="m"
                            placeholder={clim.name}
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="fixed"
                        >
                        {#each clim.options as o}
                            <calcite-combobox-item value={o.value} heading={o.label} metadata={o.d}></calcite-combobox-item>
                        {/each}
                        </calcite-combobox>
                        <calcite-button 
                            appearance="transparent"
                            iconEnd="information"
                            on:click={() => openDetails('clim', clim.name)}
                            id="clim-{clim.name}-details-popover-button"
                            class="info-button"
                    ></calcite-button>
                    </div>
                    {/each}
                    <div slot="content-bottom">
                        <calcite-notice hidden bind:this={climateNotify} scale="s" open kind="danger" icon>
                            <div slot="title">Incomplete selections</div>
                            <div slot="message">Please make selections.</div>
                        </calcite-notice>
                        <calcite-button on:click={() => getSelections('clim')}>Add to map</calcite-button>
                    </div>
                </calcite-list-item>
            </calcite-list-item>
        </calcite-list>
    </calcite-block>
    <div bind:this={timeSeriesDetailsTarget}></div>
    <!-- 

    <calcite-block collapsible expanded heading='Land Cover and Land Use' style="margin-top: 0px; padding-left:5px">
    <div>
        Coming Soon!
    </div>
    </calcite-block> -->
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
        padding-left: 24px
    }

    .tab-description {
        margin: 10px 10px 5px 10px;
        font-size: 12px;
        line-height: 1;
    }
</style>
