<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-avatar";

    // Import components and store
    import eatopics from "src/shared/dataCatalog_initialize.json";

</script>

<calcite-panel
    heading="EnviroAtlas Data Catalog"
    height-scale="l"
    data-panel-id="data-catalog"
    hidden
>
    <calcite-block open>
        <calcite-list filter-enabled selection-mode="none">
            <calcite-action
                slot="filter-actions-end"
                icon="extent-filter"
                text="Filter options"
            />
            {#each eatopics as eatopic}
            <calcite-list-item class={eatopic.category} label={eatopic.title} value={eatopic.title}>
                <calcite-list
                    id="not-header"
                    group="trails"
                    selection-mode="none"
                >
                    {#each eatopic.subtopic as subtopic}
                    <calcite-list-item>
                        <calcite-label
                            scale="s"
                            id="listItemHeader"
                            slot="content">{subtopic.name}
                        </calcite-label>
                        {#if subtopic.layers.length > 1}
                        <calcite-combobox 
                            scale="s" 
                            slot="content" 
                            selection-mode="single-persist" 
                            label={subtopic.name}
                            name={subtopic.name}
                            required
                            placeholder="Select a layer"
                        >
                            {#each subtopic.layers as layer}
                            <calcite-combobox-item
                                value={layer.title}
                                text-label={layer.title}
                            ></calcite-combobox-item>
                            {/each}
                        </calcite-combobox>
                        {/if}
                        <calcite-action-bar slot="content" layout="horizontal" expand-disabled>
                            <calcite-chip-group
                                id="ea-chip-group"
                                scale="s"
                                selection-mode="none"
                                label="ea-chip-group"
                            >
                            {#if subtopic.eaCA}
                                <calcite-chip scale="s" value="eaCA">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/air.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaCPW}
                                <calcite-chip scale="s" value="eaCPW">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/water.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaCS}
                                <calcite-chip scale="s" value="eaCS">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/clim.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaNHM}
                                <calcite-chip scale="s" value="eaNHM">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/haz.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaRCA}
                                <calcite-chip scale="s" value="eaRCA">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/rec.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaFFM}
                                <calcite-chip scale="s" value="eaFFM">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/food.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            {#if subtopic.eaBC}
                                <calcite-chip scale="s" value="eaBC">
                                    <calcite-avatar
                                        slot="image"
                                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/bio.png"
                                    >
                                    </calcite-avatar>
                                </calcite-chip>
                            {/if}
                            </calcite-chip-group>
                            <calcite-button
                                scale="s"
                                round
                                label="Add to map"
                                slot="actions-end"
                            >Add to map</calcite-button>
                            <calcite-button
                                scale="s"
                                round
                                label="Details"
                                slot="actions-end"
                            >Details</calcite-button>
                        </calcite-action-bar>
                    </calcite-list-item>
                    {/each}
                </calcite-list>
            </calcite-list-item>
            {/each}
        </calcite-list>
    </calcite-block>
</calcite-panel>

<style>
    .ESB {
        --calcite-color-foreground-1: #adbb9a;
    }

    .PSI {
        --calcite-color-foreground-1: #bb9aad;
    }

    .PBS {
        --calcite-color-foreground-1: #9aadbb;
    }

    .BNF {
        --calcite-color-foreground-1: #aeaba2;
    }

    #not-header {
        --calcite-color-foreground-1: #fff;
    }

    #listItemHeader {
        font-weight: bold;
    }

    calcite-list {
        padding-top: 0px;
    }

    calcite-chip {
        margin-right: 5px;
        margin-bottom: 5px;
    }

    calcite-list-item {
        --calcite-color-focus-color: none !important;
    }

</style>
