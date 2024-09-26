<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-avatar";
    import "@esri/calcite-components/dist/components/calcite-flow";
    import "@esri/calcite-components/dist/components/calcite-flow-item";

    // Import components and store
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import CatalogActionBar from "src/components/DataCatalog/CatalogActionBar.svelte";
    import eatopics from "src/shared/dataCatalog_initialize.json";
    import ClimateChangeViewer from "src/components/ClimateChangeViewer/ClimateChangeViewer.svelte";
    import Bookmark from "src/components/ClimateChangeViewer/Bookmark.svelte";
    import AddData from "../AddData/AddData.svelte";

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

    const handleCatalogActionClick = ({ target }) => {
        if (target.tagName !== "CALCITE-ACTION") {
            return;
        }

        if (activeDataCatalog) {
            document.querySelector(`[data-action-id=${activeDataCatalog}]`).active = false;
            document.querySelector(`[data-panel-id=${activeDataCatalog}]`).hidden = true;
            console.log(activeDataCatalog);
        }

        const nextDataCatalog = target.dataset.actionId;
        if (nextDataCatalog !== activeDataCatalog) {
            document.querySelector(`[data-action-id=${nextDataCatalog}]`).active = true;
            document.querySelector(`[data-panel-id=${nextDataCatalog}]`).hidden = false;
            activeDataCatalog = nextDataCatalog;
            console.log(activeDataCatalog);
        } else {
            activeDataCatalog = null;
        }
    };
</script>

<calcite-flow data-panel-id="data-catalog" hidden>
    <calcite-flow-item heading="EnviroAtlas Data Catalog" height-scale="l">
        <calcite-action-bar
            slot="action-bar"
            layout="horizontal"
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
                slot="actions-end"
            ></calcite-action>
            <calcite-action
                data-action-id="subnational"
                text="subnational"
                icon="urban-model"
                scale="l"
                active="false"
                slot="actions-end"
            ></calcite-action>
            <calcite-action
                data-action-id="climate-data-viewer-2"
                text="climate-data-viewer"
                icon="clock-forward"
                scale="l"
                active="false"
                slot="actions-end"
            ></calcite-action>
            <calcite-action
                data-action-id="add-data-2"
                text="add-data"
                icon="add-layer"
                scale="l"
                active="false"
                slot="actions-end"
            ></calcite-action>
        </calcite-action-bar>
        <CatalogActionBar type={activeDataCatalog}/>
        <ClimateChangeViewer view={view} />
        <Bookmark view={view}/>
        <AddData map={map} />
        <calcite-block data-panel-id="national" open>
            <calcite-list selection-mode="none">
                {#each eatopics as eatopic}
                    <calcite-list-item
                        class={eatopic.category}
                        label={eatopic.title}
                        value={eatopic.title}
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
        <calcite-block data-panel-id="subnational" open>
        </calcite-block>
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
    }

    calcite-action-bar {
        --calcite-action-bar-items-space: 20px;
        --calcite-ui-focus-color: none !important;
    }
</style>
