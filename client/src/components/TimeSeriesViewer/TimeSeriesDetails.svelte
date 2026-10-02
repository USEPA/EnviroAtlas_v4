<script>
    export let optionsObj;
    export let theme;

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
    label="{theme}-{optionsObj.name}-details-popover-button"
    reference-element="{theme}-{optionsObj.name}-details-popover-button"
    auto-close
    trigger-disabled
>
    <calcite-flow>
        <calcite-flow-item heading={optionsObj.name}>
            {#if optionsObj.description}
                <span slot="content-top">
                {#if optionsObj.description}
                <p style="margin-top:5px;margin-bottom:0;font-size:12px;line-height:1.1em">{optionsObj.description}</p>
                {/if}
                </span>
                {#if optionsObj.pdf}
                <div slot="footer-start">
                    <calcite-button
                        icon-start="file"
                        label="{optionsObj.name}-pdf"
                        tabindex="0"
                        role="button"
                        round
                        scale="s"
                        on:click={() => openFactSheet(optionsObj.pdf)}
                        on:keydown={() => openFactSheet(optionsObj.pdf)}
                        target="_blank"
                        >Fact Sheet
                    </calcite-button>
                </div>
                {/if}
            {/if}
            {#each optionsObj.options as o}
            {#if o.info}
            <calcite-card>
                <span slot="description">
                    {#if o.label===o.info}
                        <h3 style="margin:0;line-height:1.1em">{o.label}</h3>
                    {:else}
                        <h3 style="margin:0;line-height:1.1em">{o.label}</h3>
                        <p style="margin-top:5px;margin-bottom:0;font-size:12px;line-height:1.1em">{o.info}</p>
                    {/if}

                </span>
                    {#if o.pdf}
                    <div slot="footer-end">
                        <calcite-button
                            icon-start="file"
                            label="{o.label}-pdf"
                            tabindex="0"
                            role="button"
                            round
                            scale="s"
                            on:click={() => openFactSheet(o.pdf)}
                            on:keydown={() => openFactSheet(o.pdf)}
                            target="_blank"
                            >Fact Sheet
                        </calcite-button>
                    </div>
                    {/if}
                </calcite-card>
            {/if}
            {/each}
        </calcite-flow-item>
    </calcite-flow>
</calcite-popover>

<style>
    calcite-flow-item {
        width: 340px;
        --calcite-ui-focus-color: none !important;
    }
    calcite-card {
        padding-bottom: 2px;
    }
</style>
