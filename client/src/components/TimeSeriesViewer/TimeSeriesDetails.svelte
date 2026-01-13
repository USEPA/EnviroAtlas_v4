<script>
    export let optionsObj;

    console.log(optionsObj)

    export const openFactSheet = (factSheetsnippet) => {
        let url = "https://enviroatlas.epa.gov/enviroatlas/DataFactSheets/pdf/";
        window.open(url + factSheetsnippet);
    };
</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    label="{optionsObj.name}-details-popover-button"
    reference-element="{optionsObj.name}-details-popover-button"
    auto-close
    trigger-disabled
>
    <calcite-flow>
        <calcite-flow-item>
            <calcite-panel heading={optionsObj.name}>
                {#if optionsObj.description}
                    <calcite-block description={optionsObj.description}></calcite-block>
                {/if}
                {#each optionsObj.options as o}
                {#if o.info}
                    <calcite-block heading={o.label} description={o.info}>
                        {#if o.pdf}
                        <calcite-action
                            slot="actions-end"
                            icon="file"
                            round
                            scale="s"
                            text="Fact Sheet"
                            textEnabled
                            on:click={openFactSheet(o.pdf)}
                            on:keypress={openFactSheet(o.pdf)}
                       ></calcite-action>
                        {/if}
                    </calcite-block>
                {/if}
                {/each}
            </calcite-panel>
        </calcite-flow-item>
    </calcite-flow>
</calcite-popover>

<style>
    calcite-flow-item {
        width: 510px;
        --calcite-ui-focus-color: none !important;
    }
</style>
