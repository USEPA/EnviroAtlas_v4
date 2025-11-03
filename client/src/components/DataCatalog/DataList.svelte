<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-avatar";
    import "@esri/calcite-components/dist/components/calcite-card";
    import "@esri/calcite-components/dist/components/calcite-popover";
    import "@esri/calcite-components/dist/components/calcite-action-group";
    import { globe32, clockForward32, mosaicMethodSum32 } from "@esri/calcite-ui-icons";

    // Import components and store
    import { catalog, nationalItems, filteredNationalItems, geography, totalMaps, totalVisibleMaps } from "src/store.ts";
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import CatalogActionBar from "src/components/DataCatalog/CatalogActionBar.svelte";
    import TimeSeriesViewer from "src/components/TimeSeriesViewer/TimeSeriesViewer.svelte";
    import SummarizeMyArea from "src/components/SummarizeMyArea.svelte";
    import { getEaData } from "src/shared/utilities.js"
    import Bookmark from "../TimeSeriesViewer/Bookmark.svelte";

    export let view;

    catalog.subscribe;
    nationalItems.subscribe;

    window.ea.dataCatalog = {};
    window.ea.dataCatalog.view = () => {
        return view;
    };

    window.ea.dataCatalog.map = () => {
        return map;
    };

    const domainMap = {
        "CONUS": "Continental US",
        "Puerto Rico,Virgin Islands": "Puerto Rico & Virgin Islands",
        "Guam": "Guam & Northern Mariana Islands",
        "AmericanSamoa": "American Samoa",
        "Hawaii": "Hawaii",
        "Alaska": "Alaska"
    }

    $: domain = domainMap[$geography]

    const catalogActions = [
        {name: "Data Catalog", id: "national", icon: "globe", color: '#ebebeb', label1: "Data", label2: "Catalog"},
        {name: "Time Series Catalog", id: "time-series-viewer", icon: "clock-forward", label1: "Time Series", label2: "Catalog"},
        {name: "Summarize My Area", id: "sma", icon: "mosaic-method-sum", label1: "Summarize", label2: "My Area"}
    ]

    let actionRefs = [];

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

    const handleFabClick = () => {
        let leftActionBar = document.getElementById("left-action-bar");
        let panel = document.getElementById("data-catalog");
        let shell = document.getElementById("shell-panel-start");
        leftActionBar.removeAttribute("hidden");
        panel.removeAttribute("open");
        panel.setAttribute("hidden", "");
        shell.setAttribute("collapsed", "");    
    };

    function handleCatalogActionClick() {
        const nextDataCatalog = this.dataset.actionId
        console.log(this.dataset.actionId)
        if (nextDataCatalog != $catalog.type) {
            let activeDataCatalog = $catalog.type;
            document.querySelector(`[data-panel-id=${activeDataCatalog}]`).setAttribute("hidden", "");
            //TODO: do this with svelte bindings
            document.querySelector(`#catalog-button-${activeDataCatalog}`).style.borderBottom ="none"

            document.querySelector(`[data-panel-id=${nextDataCatalog}]`).removeAttribute("hidden");
            //TODO: do this with svelte bindings
            document.querySelector(`#${this.id}`).style.borderBottom ="3px solid #162e51";
            $catalog.type = nextDataCatalog
       }
    };

    function listItemExpand() {
        !this.open ? this.setAttribute("expanded", "") : this.removeAttribute("expanded")
    }

    function toggleChevron() {
        this.icon == 'chevrons-right' ? this.setAttribute("icon", "chevrons-left") : this.setAttribute("icon", "chevrons-right")
    }
</script>


<Bookmark view={view}/>
<div style="display:flex; justify-content: space-around width:100%">
    {#each catalogActions as cat, i}
        <div
            bind:this={actionRefs[i]}
            on:click={handleCatalogActionClick}
            data-action-id={cat.id}
            class="catalog-button"
            style={i === 0 ? 'border-bottom: 3px solid #162e51;' : 'border-bottom: none'}
            id="catalog-button-{cat.id}">
            <calcite-icon icon={cat.icon}></calcite-icon>
            
            <p style="line-height: 0.33em; margin: 0; padding-top:5px">{cat.label1}</p>
            <p style="margin: 0">{cat.label2}</p>
        </div>
        <!-- <calcite-action
            
            id="catalog-actions"
            alignment="center"
            data-action-id={cat.id}
            text={cat.id}
            icon={cat.icon}
            scale="s"
            active={cat.id == $catalog.type}
            on:click={handleCatalogActionClick}
            on:keypress={handleCatalogActionClick}
        >
        </calcite-action>
        <calcite-label style="background-color:{cat.color}" layout="block" alignment="center">{cat.label1}<br>{cat.label2}</calcite-label>
        </div> -->
    {/each}
</div>

<calcite-panel data-panel-id="data-catalog" id="data-catalog" >
     
    <calcite-block scale="m" id="domainHeader" heading="1. Select Geography"
    description="Current selection: {domain}"
    >
    <calcite-action 
        id="domain-popover-ref" 
        icon="chevrons-right"
        slot="actions-end"
        on:click={toggleChevron}
        />
    </calcite-block>
    <TimeSeriesViewer view={view} geography={$geography}/>
    <SummarizeMyArea {view}/>
    <calcite-block id="national" data-panel-id="national" heading="" description="" open data-testid="national">
        <calcite-block scale="m" id="domainHeader" heading="2. Explore Map Layers"
            description="Search, filter by benefit categories, or explore EnviroAtlas map layers by topic below"
            style="border-bottom: none">
        </calcite-block>
        <CatalogActionBar totalVisibleMaps={$totalVisibleMaps} totalMapsCount={$totalMaps} type={$catalog.type} />
        <calcite-list label="toc" display-mode="nested" selection-mode="none" scale='auto' style="border-top: 1px solid #dedede; padding-top: 3px">
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
</calcite-panel>
<calcite-fab
    role="button"
    tabindex="-1"
    id="data-catalog-fab" 
    data-testid="data-catalog-fab" 
    icon="chevrons-left" 
    on:click={handleFabClick}
    on:keypress={handleFabClick}
></calcite-fab>

<style>
    calcite-fab {
        place-content: center;
        padding-top: 4px;
        padding-bottom: 4px;
    }

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
        --calcite-color-text-2: #162e51;
        --calcite-list-background-color: white ;
        font-size: var(--calcite-font-size--1);
        border-bottom: 1px solid grey;
    }

    calcite-block#domainHeader {
        --calcite-block-heading-text-color:black;
        background-color: white;
    }

    calcite-block#national {
        margin-block: 0px;
    }

    calcite-action#domain-popover-ref {
        --calcite-action-background-color: #162e51;
        --calcite-action-text-color: white;
        --calcite-action-background-color-hover: #8091a2;
        --calcite-action-text-color-press: white;
        --calcite-action-background-color-press: #8091a2;
    }

    calcite-panel#data-catalog {
        --calcite-block-padding: 0em;
    }

    .catalog-button { 
        width: 100%; 
        margin: 0 20px; 
        text-align: center;
        cursor: pointer;
    }

    calcite-icon {
        padding-top: 8px;
    }
</style>
