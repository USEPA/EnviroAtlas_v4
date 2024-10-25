<script>
    export let subtopic;
    export let filtered_name;

</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    heading="Details"
    label="{subtopic.sortId}-details-popover-button"
    reference-element="{subtopic.sortId}-details-popover-button"
    auto-close
>
    <calcite-card>
        <span slot="heading">{subtopic.name}</span>
        <span slot="description">{filtered_name.eaDescription}</span>
        <div slot="footer-start">
            <calcite-button icon-start='file' round scale='s'>Fact Sheet</calcite-button>
            <calcite-button icon-start='file-code' round scale='s'>Metadata</calcite-button>
            <calcite-button icon-start='download-to' round scale='s'>Download</calcite-button>
        </div>
    </calcite-card>
</calcite-popover>

<style>
    calcite-card {
        width: 310px;
    }
</style>