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
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import CatalogActionBar from "src/components/DataCatalog/CatalogActionBar.svelte";
    import eatopics from "src/shared/dataCatalog_initialize.json";
    import ClimateChangeViewer from "src/components/ClimateChangeViewer/ClimateChangeViewer.svelte";
    import Bookmark from "src/components/ClimateChangeViewer/Bookmark.svelte";
    import AddData from "@usepa-ngst/calcite-components/AddData/index.svelte";

    export let view;
    export let map;

    window.ea.dataCatalog = {};
    window.ea.dataCatalog.view = () => {
        return view;
    };

    window.ea.dataCatalog.map = () => {
        return map;
    };

    let activeDataCatalog = "national";

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

        if (nextDataCatalog !== activeDataCatalog) {
            document.querySelector(`[data-action-id=${activeDataCatalog}]`).active = false;
            document.querySelector(`[data-panel-id=${activeDataCatalog}]`).hidden = true;
            document.querySelector(`[data-action-id=${nextDataCatalog}]`).active = true;
            document.querySelector(`[data-panel-id=${nextDataCatalog}]`).hidden = false;
            activeDataCatalog = nextDataCatalog;
            console.log(activeDataCatalog);
        } 

        nextDataCatalog == 'add-data' 
            ? document.querySelector(`[id=catalog-search-filter]`).hidden 
                = true 
            : document.querySelector(`[id=catalog-search-filter]`).hidden 
                = false;
        
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
        <CatalogActionBar type={activeDataCatalog} />
        <ClimateChangeViewer view={view} />
        <Bookmark view={view}/>
        <AddData map={map} />
        <calcite-block data-panel-id="national" heading="National Catalog" open>
            <calcite-list selection-mode="none">
                {#each eatopics as eatopic}
                    <calcite-list-item
                        class={eatopic.category}
                        label={eatopic.topic}
                        value={eatopic.topic}
                    >
                        <calcite-list
                            id="not-header"
                            group="trails"
                            selection-mode="none"
                        >
                            {#each eatopic.subtopic as subtopic}
                                <CatalogListItem {subtopic} {view} />
                            {/each}
                        </calcite-list>
                    </calcite-list-item>
                {/each}
            </calcite-list>
        </calcite-block>
        <calcite-block data-panel-id="subnational" heading="Subnational Catalog" open hidden>
        </calcite-block>
        <calcite-fab
            slot="fab"
            role="button"
            tabindex="-1"
            id="data-catalog-fab" 
            data-testid="data-catalog-fab" 
            icon="chevrons-left" 
            kind="neutral"
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
