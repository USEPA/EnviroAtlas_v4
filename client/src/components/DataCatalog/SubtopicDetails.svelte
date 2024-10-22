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
    on:calcitePopoverBeforeOpen={console.log({subtopic})}
    on:calcitePopoverOpen{console.log({subtopic})}
>
    <calcite-card>
        <span slot="heading">{subtopic.name}</span>
        <span slot="description">City of AcmeCo</span>
    </calcite-card>
</calcite-popover>