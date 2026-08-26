<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-dialog";
    import "@esri/calcite-components/dist/components/calcite-carousel";
    import "@esri/calcite-components/dist/components/calcite-carousel-item";

</script>

<calcite-dialog modal id="sma-info" scale="s">
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
    <!-- <button>More information</button> -->
</calcite-dialog>
<calcite-dialog modal id="sketch-info" scale="s">
    <h1 style="margin:0">Sketch Tool</h1>
    <p>
        Draw graphics on the map. Double-click to complete the graphic. Select your graphic to edit it or remove it from the map.
    </p>
    <hr />
</calcite-dialog>
<calcite-dialog modal id="measure-info" scale="s">
    <h1 style="margin:0">Measurement Tool</h1>
    <p>
        Select to measure area or distance. Draw graphic on the map. Double-click to complete the graphic. Clear the graphic.
    </p>
    <hr />
</calcite-dialog>
<calcite-dialog modal id="elevation-info" scale="s">
    <h1 style="margin:0">Elevation Profile Tool</h1>
    <p>
        Information goes here.
    </p>
    <hr />
</calcite-dialog>


<style>
    calcite-dialog {
        --calcite-dialog-scrim-background-color: rgba(83, 83, 83, 0.75);
    }
</style>
