<script>
    import "@esri/calcite-components/dist/components/calcite-filter";

    export let type;
</script>

<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>
    {#if type=='national' || type=='subnational'}
    <calcite-filter placeholder="Try searching"></calcite-filter>
    {/if}
    {#if type=='climate-data-viewer-2'}
        <calcite-chip-group
            slot="actions-end"
            selection-mode="single"
            label="custom-criteria-chip-group"
        >
            <calcite-chip
                class="simple-or-adv"
                selected
                scale="s"
                value="global"
                kind="brand"
                appearance="solid">Simple</calcite-chip
            >
            <calcite-chip
                class="simple-or-adv"
                scale="s"
                value="advanced"
                kind="neutral">Advanced</calcite-chip
            >
        </calcite-chip-group>
    {/if}
    <calcite-action
        icon="extent-filter"
        text-enabled
        text="Filter options"
        slot="actions-end"
        id="popover-button"
    />
</calcite-action-bar>

<style>
    calcite-action {
        --calcite-ui-focus-color: none !important;
    }

    .simple-or-adv {
        margin-top: 9px;
        margin-bottom: 9px;
        margin-right: 5px;
    }
</style>