<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-avatar";
    import "@esri/calcite-components/dist/components/calcite-filter";
    import "@esri/calcite-components/dist/components/calcite-flow";
    import "@esri/calcite-components/dist/components/calcite-flow-item";

    // Import components and store
    import CatalogListItem from "src/components/DataCatalog/CatalogListItem.svelte";
    import eatopics from "src/shared/dataCatalog_initialize.json";
</script>

<calcite-flow data-panel-id="data-catalog" hidden>
    <calcite-flow-item heading="EnviroAtlas Data Catalog" height-scale="l">
        <calcite-action-bar
            slot="action-bar"
            layout="horizontal"
            expand-disabled
        >
            <calcite-action-group slot="actions-end">
                <calcite-action icon="globe" scale="l" />
                <calcite-action icon="urban-model" scale="l"></calcite-action>
                <calcite-action icon="clock-forward" scale="l"></calcite-action>
                <calcite-action icon="add-layer" scale="l"></calcite-action>
            </calcite-action-group>
        </calcite-action-bar>
        <calcite-action-bar layout="horizontal" expand-disabled>
            <calcite-filter placeholder="Try searching"></calcite-filter>
            <calcite-action
                slot="actions-end"
                icon="extent-filter"
                text="Filter options"
            />
        </calcite-action-bar>
        <calcite-block open>
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
                                <CatalogListItem {subtopic} />
                            {/each}
                        </calcite-list>
                    </calcite-list-item>
                {/each}
            </calcite-list>
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
    }
</style>
