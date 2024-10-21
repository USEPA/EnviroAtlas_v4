<script>
    export let subtopic;

</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    heading="Details"
    label="Details"
    reference-element="{subtopic}-details-popover-button"
    closable
>
    <calcite-card>{subtopic}</calcite-card>
</calcite-popover>
