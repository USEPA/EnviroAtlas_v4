<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-avatar";
    import "@esri/calcite-components/dist/components/calcite-flow";
    import "@esri/calcite-components/dist/components/calcite-flow-item";
    import "@esri/calcite-components/dist/components/calcite-card";
    import "@esri/calcite-components/dist/components/calcite-popover";
    import "@esri/calcite-components/dist/components/calcite-action-group";

    // Import components and store
    import { catalog, nationalItems, filteredNationalItems, geography, totalMaps, totalVisibleMaps } from "src/store.ts";
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import CatalogActionBar from "src/components/DataCatalog/CatalogActionBar.svelte";
    import ClimateChangeViewer from "src/components/ClimateChangeViewer/ClimateChangeViewer.svelte";
    // use npm published version now (in development used linked version via devLink utility
    import AddData from "@usepa-ngst/calcite-components/AddData/index.svelte";
    import { getEaData } from "src/shared/utilities.js"

    export let view;
    export let map;
    $: {
        if (view && !map) {
            view.addEventListener("arcgisViewReadyChange", () => {
                map = view.map;
//                console.log(view.map);
            });
            /*
            console.log(view);
            console.log('has view ');
            if ('map' in view) {
                console.log('map in view ');
                if (view.map) {
                    console.log('view.map exists');
                }
            }
            */
        }
    }
    catalog.subscribe;
    nationalItems.subscribe;

    window.ea.dataCatalog = {};
    window.ea.dataCatalog.view = () => {
        return view;
    };

    window.ea.dataCatalog.map = () => {
        return map;
    };

    async function countMaps() {
        console.log($filteredNationalItems)
        let totalMapsCount = 0
        let visibleMapsCount = 0
        // Probably not the best use a array.map 
        // TODO: loop over and count visible layers another way
        $filteredNationalItems.map(category => {
                const subObj = category.subtopic.map(subtopic => {
                    totalMapsCount += subtopic.layers.length;
                    if (subtopic.isVisible) {
                        const lyrObj = subtopic.layers.map(layers => {  
                            if (layers.isVisible) {
                                visibleMapsCount += 1
                            }
                        });
                    }
                });
            })    
        $totalMaps = totalMapsCount
    }

    let topicParams = {
        select: encodeURIComponent(`{"topic":1,"categoryTab":1}`),
        options: encodeURIComponent(`{"select":{"distinct":true}}`)
    };

    let eaTopics = getEaData("/ea/api/subtopics", topicParams)
        .then((data) => {
            let categoryOrder = { ESB: 1, PSI: 2, PBS: 3, BNF: 4};
            data.sort((a,b) => a.topic.localeCompare(b.topic));
            data.sort((a,b) => categoryOrder[a.categoryTab] - categoryOrder[b.categoryTab]);
            // Add empty subtopic array to each array objects
            // data = data.map(obj => ({...obj, subtopic: []}))
            // Drop community only subtopics (Carbon Storage, Health & Eco Outcomes, Pollutant Redxn: Air)
            let dataReduced = data.filter(item => (item.topic !== "Carbon Storage" && item.topic !== "Health and Economic Outcomes" && item.topic !== "Pollutant Reduction: Air" && item.topic !== "Housing and Schools"));
            // load national data into the store
            dataReduced = dataReduced.map(obj => ({...obj, isVisible: true}))
            $nationalItems = dataReduced;
            return dataReduced
        }).catch(err => {
            console.error(err);
        });
 
    /**
     * Call the API for UI data properties. Loop builds params to call each topic header's subtopics,
     * then adds an 'isVisible' feature flag to the response subtopic and layer objects for filtering.
     * The response is sorted alphabetically, then loaded into the items array. After completing the
     * loop of API calls, items array is applied to nationalItems store, so the UI dropdowns get
     * updated all at once.
     * @param {object} data
     */
    async function getEaSubtopics(data) {
        let items = data
        // Loop to load in all subtopics to build UI object
        for (const prop in data) {
            // apply topic to subtopic params
            let subtopicParams = {
                select: encodeURIComponent(`{"topic":0,"categoryTab":0,"layers":{"layerID":1,"subLayerName":1,"description":1,"areaGeog":1,"name":1,"tags":1}}`),
                where: encodeURIComponent(`{"topic":"${data[prop].topic}","scale":"NATIONAL"}`) // Drop Community layers
            };
            // return promise object resolve, not the whole promise object
            let res = await getEaData("/ea/api/subtopics", subtopicParams);
            // add an isVisible property to subtopic and layers objects for filtering
            res = res.map(subtopic => {
                const lyrObj = subtopic.layers.map(layers => {
                    return {...layers, isVisible: true}
                });
                return ({...subtopic, layers: lyrObj, isVisible: true})
            });
            res.sort((a,b) => a.name.localeCompare(b.name));
            items[prop].subtopic = res;
        }
        // Put final results into store so UI updates all at once
        $nationalItems = items
        return items
    }

    // wait for eaTopics to finish before updating data for catalog UI
    eaTopics.then((result) => getEaSubtopics(result)).then(() => $geography = 'CONUS').then(() => countMaps());

    // async function updateListStyle(elem) {
    //     const shadow = elem.shadowRoot;
    //     const stylesheet = new CSSStyleSheet();
    //     stylesheet.replaceSync(`
    //         .content-container, .container {
    //             height: 19px;
    //         }
    //     `);
    //     shadow.adoptedStyleSheets = [stylesheet];
    // }

    // // Need to wait for eaTopics to load before styling list
    // eaTopics.then(() => styleList());

    // async function styleList() {
    //     await customElements
    //     .whenDefined("calcite-list-item");
    //         // TODO: tidy this up.
    //         const listESB = await document.querySelectorAll("calcite-list-item.ESB");
    //         listESB.forEach((elem) => {
    //             updateListStyle(elem);
    //         });
    //         const listPSI = await document.querySelectorAll("calcite-list-item.PSI");
    //         listPSI.forEach((elem) => {
    //             updateListStyle(elem);
    //         });
    //         const listPBS = await document.querySelectorAll("calcite-list-item.PBS");
    //         listPBS.forEach((elem) => {
    //             updateListStyle(elem);
    //         });
    //         const listBNF = await document.querySelectorAll("calcite-list-item.BNF");
    //         listBNF.forEach((elem) => {
    //             updateListStyle(elem);
    //         });
    // };

    const handleFabClick = () => {
        let leftActionBar = document.getElementById("left-action-bar");
        let panel = document.getElementById("data-catalog");
        let shell = document.getElementById("shell-panel-start");
        leftActionBar.removeAttribute("hidden");
        panel.removeAttribute("open");
        panel.setAttribute("hidden", "");
        shell.setAttribute("collapsed", "");    
    };

    const handleCatalogActionClick = ({ target }) => {
        if (target.tagName !== "CALCITE-ACTION") {
            return;
        }

        const nextDataCatalog = target.dataset.actionId;

        if (nextDataCatalog !== $catalog.type) {
            let activeDataCatalog = $catalog.type;
            let activeAction = document.querySelectorAll(`[data-action-id=${activeDataCatalog}]`);
            activeAction.forEach((action) => {
                action.removeAttribute("active")
            });
            document.querySelector(`[data-panel-id=${activeDataCatalog}]`).setAttribute("hidden", "");
            let nextAction = document.querySelectorAll(`[data-action-id=${nextDataCatalog}]`);
            nextAction.forEach((action) => {
                action.setAttribute("active", "")
            });         
            document.querySelector(`[data-panel-id=${nextDataCatalog}]`).removeAttribute("hidden");
            $catalog.type = nextDataCatalog;
        } 

        nextDataCatalog == 'add-data' 
            ? document.querySelector(`[id=catalog-search-filter]`).setAttribute("hidden", "")
            : document.querySelector(`[id=catalog-search-filter]`).removeAttribute("hidden");  
    };

    function listItemExpand() {
        !this.open ? this.setAttribute("expanded", "") : this.removeAttribute("expanded")
    }
</script>

<calcite-flow data-panel-id="data-catalog" id="data-catalog" open>
    <calcite-flow-item height-scale="l">
        <calcite-action-bar
            role="menu" 
            tabindex="-1"
            slot="action-bar"
            expand-disabled
            on:click={handleCatalogActionClick}
            on:keypress={handleCatalogActionClick}
        >
            <calcite-action
                data-action-id="national"
                text="national"
                icon="globe"
                scale="l"
                active
            ></calcite-action>
            <calcite-action
                data-action-id="climate-data-viewer-2"
                text="climate-data-viewer"
                icon="clock-forward"
                scale="l"
            ></calcite-action>
            <calcite-action
                data-action-id="add-data"
                text="add-data"
                icon="add-layer"
                scale="l"
            ></calcite-action>
        </calcite-action-bar>
        <CatalogActionBar totalVisibleMaps={$totalVisibleMaps} totalMapsCount={$totalMaps} type={$catalog.type} />
        <ClimateChangeViewer view={view} geography={$geography}/>
        <AddData map={map} />
        <calcite-block data-panel-id="national" heading="EnviroAtlas Catalog" description="Explore the relationships between land use, environment, health, safety, and economy" open data-testid="national">
            <calcite-list label="toc" display-mode="nested" selection-mode="none" scale='s'>
                {#await eaTopics}
                    <p>...loading</p>
                {:then}
                    {#each $filteredNationalItems as ea (ea.topic)}
                    {#if ea.isVisible}
                    <calcite-list-item
                        id={ea.categoryTab}
                        label={ea.topic}
                        value={ea.topic}
                        on:calciteListItemSelect={listItemExpand}
                    >
                        {#if ea.subtopic}
                            {#each ea.subtopic as subtopic (subtopic.subTopicID)}
                                <CatalogListItem {subtopic} {view} />
                            {/each}
                        {/if}
                    </calcite-list-item>
                    {/if}
                    {/each}
                {/await}
            </calcite-list>
        </calcite-block>
        <calcite-fab
            slot="fab"
            role="button"
            tabindex="-1"
            id="data-catalog-fab" 
            data-testid="data-catalog-fab" 
            icon="chevrons-left" 
            on:click={handleFabClick}
            on:keypress={handleFabClick}
        ></calcite-fab>
    </calcite-flow-item>
</calcite-flow>

<style>
    calcite-list-item, #ESB {
        --calcite-list-background-color: #adbb9a;
        --calcite-list-background-color-press: #cdd6c2;
        --calcite-list-background-color-hover: #cdd6c2;
        --calcite-list-border-color: #adbb9a;
    }

    calcite-list-item, #PSI {
        --calcite-list-background-color: #bb9aad;
        --calcite-list-background-color-press: #d6c2cd;
        --calcite-list-background-color-hover: #d6c2cd;
        --calcite-list-border-color: #bb9aad;
    }

    calcite-list-item, #PBS {
        --calcite-list-background-color: #9aadbb;
        --calcite-list-background-color-press: #c2cdd6;
        --calcite-list-background-color-hover: #c2cdd6;
        --calcite-list-border-color: #9aadbb
    }

    calcite-list-item, #BNF {
        --calcite-list-background-color: #aeaba2;
        --calcite-list-background-color-press: #ceccc7;
        --calcite-list-background-color-hover: #ceccc7;
        --calcite-list-border-color: #aeaba2;
    }

    calcite-list-item {
        --calcite-ui-focus-color: none !important;
        --calcite-color-text-2: #005ea2;
    }

    calcite-action-bar {
        --calcite-action-bar-items-space: 61px;
        --calcite-ui-focus-color: none !important;
        display: grid;
        place-items: center;
    }
</style>
