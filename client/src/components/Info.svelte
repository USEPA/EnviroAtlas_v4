<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-dialog";
    import "@esri/calcite-components/dist/components/calcite-carousel";
    import "@esri/calcite-components/dist/components/calcite-carousel-item";

    let info;
</script>

<calcite-dialog bind:this={info} modal id="info-modal" scale="s">
    <h1 style="margin:0">Summarize My Area Tool</h1>
    <p>
        The <strong>Summarize My Area Tool</strong> allows users to summarize
        EnviroAtlas metrics (national indicators) from a set of gridded
        layers within a user-selected focus location area.
    </p>
    <ul>
        <li>Select a unit area from the dropdown list.</li>
        <li>
            Select a national indicator gridded layer from the
            dropdown list.
        </li>
        <li>
            Select, create, or upload the focus location area in the
            map.
        </li>
        <li>Click the <strong>Calculate</strong> button.</li>
        <li>
            View the gridded layer statistics for the focus
            location in the Results tab.
        </li>
    </ul>
    <hr />
    <button>More information</button>
</calcite-dialog>

<style>
    calcite-dialog {
        --calcite-dialog-scrim-background-color: rgba(83, 83, 83, 0.75);
    }
</style>
