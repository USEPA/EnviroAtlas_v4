<script>
    export let subtopic;
    export let detailsObj;

    export const openFactSheet = (factSheetsnippet) => {
        let url = 'https://enviroatlas.epa.gov/enviroatlas/DataFactSheets/pdf/';
        window.open(url + factSheetsnippet);
    }

</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    heading="Details"
    label="{subtopic.sortId}-details-popover-button"
    reference-element="{subtopic.sortId}-details-popover-button"
    auto-close
    trigger-disabled
>
    <calcite-card>
        <span slot="heading">{subtopic.name}</span>
        <span slot="description">{detailsObj.eaDescription}</span>
        <div slot="footer-start">
            <calcite-button 
                icon-start='file' 
                label="{subtopic.sortId}-pdf"
                tabindex="0"
                role="button"
                round 
                scale='s' 
                on:click={openFactSheet(detailsObj.eaDfsLink)}
                on:keypress={openFactSheet(detailsObj.eaDfsLink)}
                >Fact Sheet
            </calcite-button>
            <calcite-button icon-start='file-code' round scale='s'>Metadata</calcite-button>
            <calcite-button icon-start='download-to' round scale='s'>Download</calcite-button>
        </div>
    </calcite-card>
</calcite-popover>

<style>
    calcite-card {
        width: 310px;
        --calcite-ui-focus-color: none !important;
    }
</style>