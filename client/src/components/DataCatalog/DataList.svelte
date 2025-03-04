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
    import { catalog, nationalItems } from "src/store.ts";
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import CatalogActionBar from "src/components/DataCatalog/CatalogActionBar.svelte";
    import ClimateChangeViewer from "src/components/ClimateChangeViewer/ClimateChangeViewer.svelte";
    import Bookmark from "src/components/ClimateChangeViewer/Bookmark.svelte";
    // use npm published version now (in development used linked version via devLink utility
    import AddData from "@usepa-ngst/calcite-components/AddData/index.svelte";
    import { getEaData } from "src/shared/utilities.js"

    export let view;
    export let map;

    catalog.subscribe;
    nationalItems.subscribe;

    window.ea.dataCatalog = {};
    window.ea.dataCatalog.view = () => {
        return view;
    };

    window.ea.dataCatalog.map = () => {
        return map;
    };

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
            let dataReduced = data.filter(item => (item.topic !== "Carbon Storage" && item.topic !== "Health and Economic Outcomes" && item.topic !== "Pollutant Reduction: Air"));
            // load national data into the store
            $nationalItems = dataReduced;
            return dataReduced
        }).catch(err => {
            console.error(err);
        });
 
    async function getEaSubtopics(data) {
        // Create for loop to load in all subtopics to build UI object
        for (const prop in data) {
            // console.log(`${prop}: ${data[prop].topic}`);
            // apply topic to subtopic params
            let subtopicParams = {
                select: encodeURIComponent(`{"topic":0,"categoryTab":0,"layers":{"layerID":1,"subLayerName":1,"description":1,"tags":1,"name":1}}`),
                where: encodeURIComponent(`{"topic":"${data[prop].topic}"}`)
            };
            // get subtopic object from api
            // return promise object resolve, not the whole promise object
            let res = await getEaData("/ea/api/subtopics", subtopicParams);
            // Drop Community layers
            let resNoComm = res.filter(item => item.scale !== "COMMUNITY");
            resNoComm.sort((a,b) => a.name.localeCompare(b.name));
            // take the result and put into store subtopic object
            $nationalItems[prop].subtopic = resNoComm;
        }
        return data
    }

    // wait for eaTopics to finish before updating data for catalog UI
    eaTopics.then((result) => getEaSubtopics(result));

    async function updateListStyle(elem) {
        const shadow = elem.shadowRoot;
        const stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(`
            .content, .custom-content {
                height: 19px;
            }
        `);
        shadow.adoptedStyleSheets = [stylesheet];
    }

    // Need to wait for eaTopics to load before styling list
    eaTopics.then(() => styleList());

    async function styleList() {
        await customElements
        .whenDefined("calcite-list-item");
            // TODO: tidy this up.
            const listESB = await document.querySelectorAll("calcite-list-item.ESB");
            listESB.forEach((elem) => {
                updateListStyle(elem);
            });
            const listPSI = await document.querySelectorAll("calcite-list-item.PSI");
            listPSI.forEach((elem) => {
                updateListStyle(elem);
            });
            const listPBS = await document.querySelectorAll("calcite-list-item.PBS");
            listPBS.forEach((elem) => {
                updateListStyle(elem);
            });
            const listBNF = await document.querySelectorAll("calcite-list-item.BNF");
            listBNF.forEach((elem) => {
                updateListStyle(elem);
            });
    };

    const handleFabClick = () => {
        let bar = document.getElementById("left-action-bar");
        let panel = document.getElementById("data-catalog");
        let shell = document.getElementById("shell-panel-start");
        bar.removeAttribute("hidden");
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
                data-action-id="subnational"
                data-testid="subnational-catalog-action"
                text="subnational"
                icon="urban-model"
                scale="l"
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
        <CatalogActionBar type={$catalog.type} />
        <ClimateChangeViewer view={view} />
        <Bookmark view={view}/>
        <AddData map={map} />
        <calcite-block data-panel-id="national" heading="National Catalog" open data-testid="national">
            <calcite-list selection-mode="none">
                {#await eaTopics}
                    <p>...loading</p>
                {:then}
                    {#each $nationalItems as ea}
                    <calcite-list-item
                        class={ea.categoryTab}
                        label={ea.topic}
                        value={ea.topic}
                    >
                        <calcite-list
                            id="not-header"
                            group="trails"
                            selection-mode="none"
                        >
                        {#if ea.subtopic}
                            {#each ea.subtopic as subtopic}
                                <CatalogListItem {subtopic} {view} />
                            {/each}
                        {/if}
                        </calcite-list>
                    </calcite-list-item>
                    {/each}
                {/await}
            </calcite-list>
        </calcite-block>
        <calcite-block data-testid="subnational" data-panel-id="subnational" heading="Subnational Catalog" open hidden>
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
    .ESB {
        --calcite-color-foreground-1: #adbb9a;
        --calcite-color-foreground-2: #cdd6c2;
    }

    .PSI {
        --calcite-color-foreground-1: #bb9aad;
        --calcite-color-foreground-2: #d6c2cd;
    }

    .PBS {
        --calcite-color-foreground-1: #9aadbb;
        --calcite-color-foreground-2: #c2cdd6;
    }

    .BNF {
        --calcite-color-foreground-1: #aeaba2;
        --calcite-color-foreground-2: #ceccc7;
    }

    #not-header {
        --calcite-color-foreground-1: #fff;
    }

    calcite-list {
        padding-top: 0px;
    }

    calcite-list-item {
        --calcite-list-item-spacing-indent: 0rem;
        --calcite-ui-focus-color: none !important;
        --calcite-color-brand: none !important;
        --calcite-color-text-2: #005ea2;
    }

    calcite-action-bar {
        --calcite-action-bar-items-space: 21px;
        --calcite-ui-focus-color: none !important;
        margin-left: 10px;
    }
</style>
