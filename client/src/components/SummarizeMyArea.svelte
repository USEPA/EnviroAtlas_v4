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
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
    import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
    import Graphic from "@arcgis/core/Graphic";
    import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
    import MosaicRule from "@arcgis/core/layers/support/MosaicRule";
    import RasterFunction from "@arcgis/core/layers/support/RasterFunction";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
    import esriRequest from "@arcgis/core/request.js";
    import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
    import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
    import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
    import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator";
    import * as centroidOperator from "@arcgis/core/geometry/operators/centroidOperator";
    import * as d3 from "d3";

    // Import store and configuration
    import { smaConfig } from "src/shared/smaConfig";
    import {
        addLayer,
        getEALayerObject,
        isLayerTitleInMap,
    } from "src/shared/utilities.js";
    import { geography } from "src/store.ts";

    export let view;

    let indicatorElem;
    $: indicatorValue = "";
    let nlcdYearCombobox;
    $: landcoverYear = null;
    let nlcdChange1Combo;
    $: nlcdChange1Combobox = "";
    let nlcdChange2Combo;
    $: nlcdChange2Combobox = "";
    let summaryUnitCombobox;
    let sumUnit = "";
    let geographyLabel = "";
    let geographyAttributes;
    let geometry;
    let pointMetric = "kilometers";
    let sketchGeometry = null;
    let sketchViewModel;
    let bufferInput;
    let inputTableData = [];
    let bufferGeometry;
    let geometryType;
    let resultsTab;
    let selectionsTab;
    let smaAnalysisOutputs;
    let smaAnalysisInputs;
    let messages;
    let smaPanel;

    $: isDisabled = !indicatorValue || !geometry;

    const indicatorsDict = [
        // {name: "Land Cover", value: "nlcd"},
        // {name: "Land Cover Change", value: "nlcd-change"},
        { name: "Permafrost Probability", value: "permafrost" },
    ];

    const sketchLayer = new GraphicsLayer({
        title: "Summarize My Area: User defined geometry",
        id: "griddedMapSketchLayer",
    });
    const bufferLayer = new GraphicsLayer({
        title: "Summarize My Area: User defined geometry with buffer",
    });
    const sumUnitgraphic = new GraphicsLayer({
        title: "Summarize My Area: User selected area"
    });

    function geometryButtonsClickHandler(event) {
        geodesicBufferOperator.load()
        geometryType = event.target.value;
        clearSketch();
        sketchViewModel.create(geometryType);
        if (geometryType == 'polygon') {
            bufferInput.value = "0"
        }
    }

    function clearSketch() {
        geometry = null;
        sketchGeometry = null;
        sketchLayer.removeAll();
        bufferLayer.removeAll();
    }

    function updateSketchGeometry() {
        console.log(geodesicBufferOperator.isLoaded());
        console.log("buffer: ", bufferInput.value)
        if (sketchGeometry) {
            if (bufferInput.value > 0) {
                console.log(pointMetric)
                bufferGeometry = geodesicBufferOperator.execute(sketchGeometry, bufferInput.value, {unit: "kilometers"});
                if (bufferLayer.graphics.length === 0) {
                    bufferLayer.add(new Graphic({
                        geometry: bufferGeometry,
                        symbol: sketchViewModel.polygonSymbol
                    })
                );
                } else {
                    bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry
                }
                geometry = bufferGeometry
            } else {
                bufferLayer.removeAll();
                geometry = sketchGeometry
            }
        }
    }

    const updateIndicator = () => {
        indicatorValue = indicatorElem.value;
        if (indicatorValue == "permafrost") {
            if ($geography != "Alaska") {
                $geography = "Alaska";
                document.getElementById("Alaska-bookmark").click();
            }
            _initIndicatorLayer(indicatorValue);
        } else if (!indicatorValue) {
            removeIndicator();
        }
    };

    function removeIndicator() {
        // Remove existing indicator from map and set values to null
        let toRemove = view.map.layers.items?.filter(function (item) {
            return item.title.includes("Summarize My Area Indicator:");
        });
        view.map.removeMany(toRemove);
    }

    // Store indicator year as view model value and add the appropriate raster to the map
    const updateLCYear = (e) => {
        console.log("event is: ", e);
        landcoverYear = e.target.value;
        if (landcoverYear) {
            console.log("target year is: ", e.target.value);
            // load the imagery on the map
            _initIndicatorLayer(indicatorValue);
        }
    };

    // Update LC Change inputs and add NLCD Year 2 to map
    const updateLCChangeYears = (e) => {
        console.log("event is: ", e);
        if (e.target.id == "nlcd-change-year-1") {
            nlcdChange1Combobox = e.target.value;
        }
        if (e.target.id == "nlcd-change-year-2") {
            nlcdChange2Combobox = e.target.value;
            _initIndicatorLayer(indicatorValue);
        }
        console.log("year1: ", nlcdChange1Combobox);
        console.log("year2: ", nlcdChange2Combobox);
    };

    // Add the appropriate raster to the map
    async function _initIndicatorLayer(indicator) {
        removeIndicator();
        // Make mosaic rule work for land cover and land cover change variables
        let mosaicRule = new MosaicRule({
            method: "lock-raster",
        });

        let indicatorUrl;

        switch (indicator) {
            case "nlcd":
                mosaicRule.lockRasterIds =
                    smaConfig.nlcd.OBJECTIDS[landcoverYear];
                indicatorUrl = smaConfig.nlcd.layer;
                break;
            case "nlcd-change":
                mosaicRule.lockRasterIds = [
                    smaConfig.nlcd.OBJECTIDS[nlcdChange1Combobox],
                    smaConfig.nlcd.OBJECTIDS[nlcdChange2Combobox],
                ];
                indicatorUrl = smaConfig.nlcd.layer;
            case "permafrost":
                let lObject = await getEALayerObject(552);
                // TODO: error handle if lObject is empty
                console.log(lObject);
                lObject.name =
                    "Summarize My Area Indicator: Near-surface permafrost probability";
                addLayer(lObject, view);
        }

        // //TODO: Fix legend appearance
        // const indicatorLayer = new ImageryLayer({
        //     url: indicatorUrl,
        //     mosaicRule: mosaicRule,
        //     id: `sma-${indicator}-layer`,
        //     noData: 0, // set no data params
        //     opacity: 0.6,
        //     title:
        //         "Summarize My Area Indicator: " +
        //         indicator + // TO DO: format
        //         ", " +
        //         landcoverYear,
        //     popupEnabled: false,
        // });

        // view.map.add(indicatorLayer);
    }

    // Store summary unit input as view model value
    function updateSumUnit() {
        // Remove existing summary unit geometry from map
        let toRemove = view.map.layers.items?.filter(item => 
            item.title && item.title.includes("Summarize My Area Unit:")
        );

        view.map.removeMany(toRemove);

        sumUnit = summaryUnitCombobox.value;
        console.log("sumUnit is ", sumUnit);
        if (sumUnit != "") {
            _initGeometryLayer(sumUnit);
            clearSketch();
        } if (sumUnit == "Draw a geometry") {
            let drawCheck = isLayerTitleInMap("Summarize My Area: User defined geometry", view);
            !drawCheck ? view.map.addMany([bufferLayer,sketchLayer]) : null;
        } else {
            // Clear graphics from map if the sum unit changes.
            view.map.removeMany([bufferLayer,sketchLayer,sumUnitgraphic]);
            geographyLabel = "";
            geometry = null;
        }
    }

    // Add summary unit geometry to the map based on configurations
    const _initGeometryLayer = (sumUnit) => {
        geometry = null;
        sketchLayer.removeAll();

        if (sumUnit == "Draw a geometry") {
            _initSketchTool();
        } else {
            // Get unitMinScale, url, outfields from the smaConfig
            let unitMinScale = smaConfig.sum_units[`${sumUnit}`].minScale;
            let url = smaConfig.sum_units[`${sumUnit}`].url;
            let outfields = smaConfig.sum_units[`${sumUnit}`].outfields;

            let unitRenderer = new SimpleRenderer({
                symbol: new SimpleFillSymbol({
                    color: [128, 128, 128, 0],
                    outline: {
                        color: [65, 65, 65],
                        width: 2,
                    },
                }),
            });

            let geometryLayer = new FeatureLayer({
                url: url,
                id: `${sumUnit}Layer`, 
                minScale: unitMinScale,
                title:
                    "Summarize My Area Unit: " +
                    smaConfig.sum_units[`${sumUnit}`].name,
                outFields: smaConfig.sum_units[`${sumUnit}`].outfields,
                renderer: unitRenderer,
            });

            view.map.add(geometryLayer);

            //TODO: Create zoom service message based on scale of layer...see lines 1250-1259 of old widget code

            // Add mapClickEvent functionality
            // Only propogate event when geometry layer is added
            reactiveUtils.on(
                () => view,
                "arcgisViewClick",
                async (e) => {
                    sumUnitgraphic.removeAll();
                    const eMapPoint = e.detail.screenPoint;
                    // Invoke option to only include graphics from geometryLayer in the hitTest
                    const opts = {
                        include: geometryLayer,
                    };
                    // The hitTest() checks to see if any graphics from the geometryLayer
                    view.hitTest(eMapPoint, opts).then((res) => {
                        if (res.results.length) {
                            //Clear graphic from the map if a new one is clicked
                            view.graphics.removeAll();
                            let query = geometryLayer.createQuery();
                            query.geometry = res["results"][0].mapPoint;
                            query.outFields = outfields;
                            query.returnGeometry = true;
                            geometryLayer
                                .queryFeatures(query)
                                .then((result) => {
                                    geometry = result.features[0].geometry;
                                    geographyAttributes =
                                        result.features[0].attributes;
                                    buildGeographyLabel(geographyAttributes);
                                    const symbol = new SimpleFillSymbol({
                                        color: [0, 0, 0, 0],
                                        outline: { color: [0, 0, 0], width: 2 },
                                    });
                                    sumUnitgraphic.add(new Graphic({
                                        geometry,
                                        symbol,
                                    }));
                                    view.map.add(sumUnitgraphic);
                                    view.goTo(
                                        {
                                            target: geometry,
                                            extent: geometry.clone(),
                                        },
                                        { duration: 1000 },
                                    );
                                    let whereKey =
                                        Object.keys(geographyAttributes)[0];
                                    let whereVal =
                                        Object.values(geographyAttributes)[0];
                                    const where = `${whereKey} = '${whereVal}'`;
                                    geometryLayer.renderer = new SimpleRenderer(
                                        {
                                            symbol: new SimpleFillSymbol({
                                                color: [128, 128, 128],
                                                outline: {
                                                    color: [65, 65, 65],
                                                    width: 2,
                                                },
                                            }),
                                        },
                                    );
                                    geometryLayer.featureEffect = {
                                        filter: new FeatureFilter({
                                            where,
                                        }),
                                        includedEffect:
                                            "brightness(300) opacity(0.01%) drop-shadow(3px, 3px, 12px, black)",
                                        excludedEffect:
                                            "opacity(0.5) blur(1px)",
                                    };
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        }
                    });
                },
            );
        }

        // Build string that displays attributes of the summary unit selection geography
        function buildGeographyLabel(geographyAttributes) {
            switch (sumUnit) {
                case "County":
                    geographyLabel =
                        geographyAttributes.CountyName +
                        ", " +
                        geographyAttributes.STATE_NAME;
                    break;
                case "Congressional District":
                    geographyLabel =
                        "Congressional District " +
                        geographyAttributes.STATE_ABBR +
                        geographyAttributes.DISTRICTID;
                    break;
                case "HUC-12":
                    geographyLabel =
                        geographyAttributes.name +
                        " (" +
                        geographyAttributes.huc12 +
                        ")";
                    break;
                case "HUC-8":
                    geographyLabel =
                        geographyAttributes.name +
                        " (" +
                        geographyAttributes.huc8 +
                        ")";
                    break;
            }
        }
    };

    //sketchviewmodel is a better fit for the draw tools
    function _initSketchTool() {
        sketchViewModel = new SketchViewModel({
            layer: sketchLayer,
            view: view.view,
            pointSymbol: {
                type: "simple-marker",
                style: "circle",
                size: 10,
                color: [255, 255, 255, 0.8],
                outline: {
                    color: [211, 132, 80, 0.7],
                    width: 10,
                },
            },
            polylineSymbol: {
                type: "simple-line",
                color: [211, 132, 80, 0.7],
                width: 6,
            },
            polygonSymbol: {
                type: "simple-fill",
                color: [211, 132, 80, 0.7],
                outline: {
                    color: [211, 132, 80, 0.7],
                    width: 10,
                },
            },
            defaultCreateOptions: { hasZ: false },
        });

        console.log(sketchViewModel);
        console.log(view.view);
        sketchViewModel.on(["create"], (event) => {
            if (event.state == "complete") {
                sketchGeometry = event.graphic.geometry;
                updateSketchGeometry();
            }
        });

        sketchViewModel.on(["update"], (event) => {
            const eventInfo = event.toolEventInfo;
            if (
                event.toolEventInfo &&
                event.toolEventInfo.type.includes("stop")
            ) {
                sketchGeometry = event.graphics[0].geometry;
                updateSketchGeometry();
            }
        });
    }

    async function calculate() {
        smaPanel.loading = true;
        smaAnalysisOutputs.innerHTML = "";
        smaAnalysisInputs.innerHTML = "";
        // loading image on button
        // conditionality on what is geo depending on sum unit (point/line/area)
        //default let geo=geometry (selected area)
        let geo = geometry;
        let line;
        const pixel_size = smaConfig[indicatorValue].resolution;
        let compHistEndpoint = `${smaConfig[indicatorValue].layer}/computeStatisticsHistograms`;

        let remapRF = new RasterFunction();
        remapRF.functionName = "Remap";
        remapRF.functionArguments = {
            InputRanges: [
                -1, -0.001, 0, 11, 11, 21, 21, 31, 31, 41, 41, 51, 51, 61, 61,
                71, 71, 81, 81, 91, 91, 101,
            ],
            OutputValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            Raster: "$$",
        };
        remapRF.outputPixelType = "u8";

        let compHistObject = {
            f: "json",
            geometryType: "esriGeometryPolygon",
            geometry: JSON.stringify(geo),
            pixelSize: pixel_size,
            renderingRule: JSON.stringify(remapRF),
        };

        let results, area;
        switch (indicatorValue) {
            case "permafrost":
                results = await _computeHistograms(
                    compHistEndpoint,
                    compHistObject,
                );
                if (results) {
                    const totalCount = results.data.statistics[0].count;
                    area = (totalCount * (pixel_size * pixel_size)) / 1000000;
                    let pResults = {};
                    results.data.histograms[0].counts.forEach(
                        (count, index) => {
                            if (count > 0) {
                                pResults[index] = {
                                    area: _calculatePermArea(
                                        totalCount,
                                        count,
                                        area,
                                    ),
                                    perc: calculatePercentages(
                                        totalCount,
                                        count,
                                    ),
                                    name: smaConfig.permafrost.indices[index],
                                    legend: `<div class="nlcd-index-legend" style="width:15px; height:15px; background-color: ${smaConfig.permafrost.colors[index]}"></div>`,
                                };
                            }
                        },
                    );
                    let data = Object.entries(pResults).map(([k, v]) => v);
                    var headers = [
                        { head: "", cl: "title", d: "legend" },
                        {
                            head: "Land Cover Type",
                            cl: "nlcd_title",
                            d: "name",
                        },
                        {
                            head:
                                indicatorValue +
                                " Area (" +
                                _getMetricString(pointMetric) +
                                "2)",
                            cl: "",
                            d: "area",
                        },
                        { head: "Percentage", cl: "", d: "perc" },
                    ];
                    let table = _renderTable(headers, data);
                    smaAnalysisOutputs.append(table);
                }
        }
        _renderInputTable(area, line);
    }

    function _renderInputTable(area, line) {
        inputTableData = [];
        let indicatorLabel = indicatorsDict.find(
            (indicator) => indicator.value === indicatorValue,
        ).name;
        inputTableData.push({ attribute: "Analysis", value: indicatorLabel });

        inputTableData.push({
            attribute: "Source Data",
            value:
                '<a target="_blank" style="text-decoration:none" href="' +
                smaConfig[indicatorValue].layersUsedURL +
                '">' +
                smaConfig[indicatorValue].layersUsed +
                "</a>",
        });

        if (sumUnit == "Draw a geometry" && geometryType == 'polygon') {
            inputTableData.push({ attribute: 'Geometry Type', value: 'User provided area' });
            if (bufferInput.value > 0) {
                inputTableData.push({ attribute: 'Buffer', 'value': formatLargeNumber(bufferInput.value) + _getMetricString(pointMetric) });
                //inputTableData.push({ attribute: 'Area inside buffer excluded', value: 'True' ? this.excludeInnerFeatureCheckbox.checked : 'False' });
            }
        } else if (sumUnit == "Draw a geometry" && geometryType == 'point') {
            inputTableData.push({ attribute: 'Geometry Type', value: 'User provided point' });
            const centroid = centroidOperator.execute(bufferGeometry);
            inputTableData.push({ attribute: 'Lat/Lon', value: centroid.latitude.toFixed(4) + ', ' +
                centroid.longitude.toFixed(4)
            });
            inputTableData.push({ attribute: 'Buffer Radius', value: formatLargeNumber(bufferInput.value) + ' ' + _getMetricString(pointMetric) });
        } else if (sumUnit == "Draw a geometry" && geometryType == "polyline") {
            inputTableData.push({ attribute: 'Geometry Type', value: 'User provided line' });
            inputTableData.push({ attribute: 'Length', value: line + ' ' + _getMetricString(pointMetric) });
            inputTableData.push({ attribute: 'Buffer', value: formatLargeNumber(bufferInput.value) + ' ' + _getMetricString(pointMetric) });
        } else if (sumUnit != "Draw a geometry") {
            let inputTableFields = smaConfig.sum_units[sumUnit].outdesc;
            for (const k in inputTableFields) {
                let v = inputTableFields[k];
                if (v.includes("results.")) {
                    let attr = v.replace("results.", "")
                    if (geographyAttributes.hasOwnProperty(attr)) {
                        v = geographyAttributes[attr]
                    }
                } 
                inputTableData.push({ 'attribute': k, 'value': v })
            }
        }

        const pretty_area = Math.round(area * 10) / 10;
        inputTableData.push({
            attribute: "Area",
            value: pretty_area + " " + _getMetricString(pointMetric) + "2",
        });

        var headers = [
            { head: "Input Paramaters", cl: "", d: "attribute" },
            { head: " ", cl: "", d: "value" },
        ];
        let table = _renderTable(headers, inputTableData);

        smaAnalysisInputs.append(table);
        
        smaPanel.loading = false;
        resultsTab.selected = false;
        resultsTab.selected = true;
    }

    async function _computeHistograms(url, post_data) {
        // if (this.errorMessage.innerHTML !== "") {
        //   this.errorMessage.innerHTML = "";
        //   let image = '<img src="./configs/loading/images/predefined_loading_1.gif"/>';
        //   this.calculateButton.innerHTML = image;
        // }

        const compHistRequest = esriRequest(url, {
            responseType: "json",
            method: "post",
            query: post_data,
        });

        try {
            const results = await compHistRequest;
            //   if (this.calculateButton.disabled) {
            //     this.calculateButton.innerHTML = this.nls.calculate;
            //     return;
            //   }
            console.log(results);
            return results;
        } catch (err) {
            console.log(err);
            //   this.calculateButton.innerHTML = this.nls.calculate;
            //   if (err.details && err.details[0] === 'The requested image exceeds the size limit.') {
            //     this.errorMessage.innerHTML = this.nls.sizeError;
            //   } else {
            //     this.errorMessage.innerHTML = this.nls.genericError;
            //   }
        }
    }
    function _calculatePermArea(total, count, area) {
        let calcPercentage = calculatePercentages(total, count);
        return Number((calcPercentage / 100) * area).toFixed(2);
    }

    function calculatePercentages(totalCount, count) {
        return ((count / totalCount) * 100).toFixed(2);
    }

    function _getMetricString(metric) {
        switch (metric) {
            case "kilometers":
                return "km";
            case "miles":
                return "mi";
        }
    }

    function _renderTable(headers, data) {
        let table_wrapper = d3.create("div").attr("class", "table-wrapper");

        let table = table_wrapper.append("table");

        // create table header
        table
            .append("thead")
            .append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .attr("class", (d) => d.cl)
            .text((d) => d.head);

        // create table body
        table
            .append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                let cells = [];
                for (var ii = 0; ii < headers.length; ii++) {
                    cells.push(row[headers[ii].d]);
                }
                return cells;
            })
            .enter()
            .append("td")
            .html(function (cell) {
                return cell;
            });
        return table_wrapper.node();
    }

    function formatLargeNumber(number) {
        const splitNumber = String(number).split('.');
        const beforeDecimal = splitNumber[0];
        const afterDecimal = splitNumber[1];

        const numberString = beforeDecimal;

        if (number >= 1000) {
          const stringArray = [];
          for (let i = 0; i < numberString.length; i++) {
            stringArray.push(numberString[i]);
          }
          stringArray.reverse();
          const stringWithExtras = [];

          for (let i = 0; i < stringArray.length; i++) {
            if (i !== 0 && i % 3 === 0) {
              stringWithExtras.push(',');
            }
            stringWithExtras.push(stringArray[i]);
          }
          stringWithExtras.reverse();

          if (afterDecimal) {
            return stringWithExtras.join('') + '.' + afterDecimal;
          }
          return stringWithExtras.join('');
        }

        if (afterDecimal) {
          return numberString + '.' + afterDecimal;
        }
        return numberString;
      }
</script>

<calcite-panel
    bind:this={smaPanel}
    heading="Summarize My Area"
    data-panel-id="sma"
    hidden
    overlayPositioning="fixed"
>
    <calcite-button
        tabindex="0"
        role="button"
        width="full"
        slot="footer"
        disabled={isDisabled}
        on:click={calculate}
    >
        Calculate
    </calcite-button>
    <calcite-tabs layout="center">
        <calcite-tab-nav slot="title-group">
            <calcite-tab-title bind:this={selectionsTab} selected tab="selectionsTab">
                Select Layer Area
            </calcite-tab-title>
            <calcite-tab-title bind:this={resultsTab} tab="resultsTab">Results</calcite-tab-title>
        </calcite-tab-nav>
        <calcite-tab selected tab="selectionsTab">
            <calcite-block open heading="Select an indicator">
                <calcite-icon scale="m" slot="icon" icon="number-circle-1"
                ></calcite-icon>
                <calcite-label layout="inline">
                    <calcite-combobox
                        scale="s"
                        placeholder=" Select one"
                        selection-mode="single"
                        max-items="0"
                        overlay-positioning="absolute"
                        value="nlcd"
                        bind:this={indicatorElem}
                        on:calciteComboboxChange={updateIndicator}
                    >
                        {#each indicatorsDict as ind}
                            <calcite-combobox-item
                                value={ind.value}
                                heading={ind.name}
                            ></calcite-combobox-item>
                        {/each}
                    </calcite-combobox>
                </calcite-label>
                {#if indicatorValue == "nlcd"}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year:
                        <calcite-combobox
                            scale="s"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            bind:this={nlcdYearCombobox}
                            on:calciteComboboxChange={updateLCYear}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcYear}
                                <calcite-combobox-item
                                    value={lcYear}
                                    heading={lcYear}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                {:else if indicatorValue == "nlcd-change"}
                    <calcite-label layout="inline" scale="s">
                        NLCD Year 1:
                        <calcite-combobox
                            scale="s"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            id="nlcd-change-year-1"
                            bind:this={nlcdChange1Combo}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc1Year}
                                <calcite-combobox-item
                                    value={lcc1Year}
                                    heading={lcc1Year}
                                ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                    </calcite-label>
                    <calcite-label layout="inline" scale="s">
                        NLCD Year 2:
                        <calcite-combobox
                            scale="s"
                            placeholder=" Select one"
                            selection-mode="single"
                            max-items="0"
                            overlay-positioning="absolute"
                            id="nlcd-change-year-2"
                            bind:this={nlcdChange2Combo}
                            on:calciteComboboxChange={updateLCChangeYears}
                        >
                            {#each ["2019", "2016", "2013", "2011", "2008", "2006", "2004", "2001"] as lcc2Year}
                                <calcite-combobox-item
                                    value={lcc2Year}
                                    heading={lcc2Year}
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
                        placeholder=" Select one"
                        selection-mode="single"
                        overlay-positioning="fixed"
                        bind:this={summaryUnitCombobox}
                        on:calciteComboboxChange={updateSumUnit}
                    >
                        {#each ["County", "Congressional District", "HUC-8", "HUC-12", "Draw a geometry"] as sumUnit}
                            <calcite-combobox-item
                                value={sumUnit}
                                heading={sumUnit}
                            ></calcite-combobox-item>
                        {/each}
                    </calcite-combobox>
                </calcite-label>
                {#if sumUnit == "Draw a geometry"}
                    <div class="geometry-options">
                        <button
                            class="esri-widget--button esri-icon-map-pin geometry-button"
                            id="point-geometry-button"
                            value="point"
                            title="Filter by point"
                            on:click={geometryButtonsClickHandler}
                        ></button>
                        <button
                            class="esri-widget--button esri-icon-polyline geometry-button"
                            id="line-geometry-button"
                            value="polyline"
                            title="Filter by line"
                            on:click={geometryButtonsClickHandler}
                        ></button>
                        <button
                            class="esri-widget--button esri-icon-polygon geometry-button"
                            id="polygon-geometry-button"
                            value="polygon"
                            title="Filter by polygon"
                            on:click={geometryButtonsClickHandler}
                        ></button>
                    </div>
                    <calcite-label layout="inline" scale="s"
                        >Buffer distance:
                        <calcite-input-number
                            suffix-text="km"
                            min="0"
                            step="1"
                            scale="s"
                            value="1"
                            number-button-type="vertical"
                            bind:this={bufferInput}
                        ></calcite-input-number>
                    </calcite-label>
                {/if}
            </calcite-block>
            <calcite-block open heading="Select your geography">
                <calcite-icon scale="m" slot="icon" icon="number-circle-3"
                ></calcite-icon>
                {#if sumUnit == "HUC-8" || sumUnit == "HUC-12"}
                    <calcite-notice
                        open
                        icon="exclamation-mark-triangle"
                        kind="danger"
                    >
                        <div slot="message">Zoom in to see HUC boundaries</div>
                    </calcite-notice>
                {/if}
                {#if geographyLabel}
                    <calcite-notice open kind="success">
                        <div slot="message">{geographyLabel}</div>
                    </calcite-notice>
                {/if}
            </calcite-block>
        </calcite-tab>
        <calcite-tab tab="resultsTab">
            <calcite-block>
                <div
                    slot="content-start"
                    class="widget-gridded-map profile-tab-node"
                >
                    <div style="margin-bottom:10px" id="gridded-map-title">
                        <div>
                            <img
                                alt="https://www.epa.gov/enviroatlas"
                                src="images/logo.png"
                                style="height: 33px; margin-top: 7px; display:inline-block; position:relative; left:50%; transform: translate(-50%); margin-bottom:-3px"
                            />
                        </div>
                        <div
                            style="display:block; margin:0 auto; text-align: center; font-size:18px; color:darkgray;"
                        >
                            Summarize My Area
                        </div>
                    </div>
                    <div
                        id="gridded-map-input-table-wrapper"
                        bind:this={smaAnalysisInputs}
                        class="table-wrapper"
                    ></div>
                    <div
                        id="gridded-map-output-table-wrapper"
                        bind:this={smaAnalysisOutputs}
                        class="table-wrapper"
                    ></div>
                </div>
            </calcite-block>
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

    .geometry-options {
        display: flex;
        flex-direction: row;
    }

    .geometry-button {
        flex: 1;
        border-style: solid;
        border-width: 1px;
        border-image: none;
    }

    .geometry-button-selected {
        background: #4c4c4c;
        color: #fff;
    }
</style>
