<script>
    import {
        smaAnalysisInputs,
        smaAnalysisOutputs,
    } from "src/store.ts";

    let smaResultsPanel;

    const handleFabClick = (e) => {
        e.target.setAttribute("hidden", "");
        let shell = document.getElementById("shell-panel-end");
        smaResultsPanel.removeAttribute("open");
        smaResultsPanel.setAttribute("hidden", "");
        shell.setAttribute("collapsed", "");
        let expandRight = document.getElementById("expand-right");
        expandRight.hidden = false;
    };
</script>

<calcite-panel
    icon="mosaic-method-sum"
    bind:this={smaResultsPanel}
    heading="Summarize My Area Results"
    height-scale="l"
    data-panel-id="sma-results"
    hidden
    closed
    class="right-panel"
>
    <calcite-block>
        <div slot="content-start" class="widget-gridded-map profile-tab-node">
            <div style="margin-bottom:10px" id="gridded-map-title">
                <div>
                    <img
                        alt="https://www.epa.gov/enviroatlas"
                        src="images/horizontal_logo_grey.png"
                        style="height: 33px; margin-top: 7px; display:inline-block; position:relative; left:50%; transform: translate(-50%); margin-bottom:-3px"
                    />
                </div>
                <div
                    style="display:block; margin:0 auto; text-align: center; font-size:18px; color:darkgray;"
                >
                    Summarize My Area Results
                </div>
            </div>
            <calcite-card>
            <div
                id="gridded-map-input-table-wrapper"
                bind:this={$smaAnalysisInputs}
                class="table-wrapper"
            ></div>
            <div
                id="gridded-map-output-table-wrapper"
                bind:this={$smaAnalysisOutputs}
                class="table-wrapper"
            ></div>
            </calcite-card>
        </div>
    </calcite-block>
</calcite-panel>
<calcite-fab
    role="button"
    tabindex="-1"
    id="sma-results-fab"
    icon="chevrons-right"
    hidden
    on:click={handleFabClick}
    on:keydown={handleFabClick}
></calcite-fab>


<style>
    #gridded-map-output-table-wrapper {
        text-align: right;
    }

    calcite-fab {
        place-content: center;
        padding-top: 4px;
        padding-bottom: 4px;
    }

    calcite-panel.right-panel {
        --calcite-panel-header-background-color: #f7f7f7
    }

    .table-wrapper :global(table tr:nth-of-type(odd)) {
        background-color: #f9f9f9;
    }

    .table-wrapper :global(table tr:nth-of-type(even)) {
        background-color: #f0f0f0;
    }

    .table-wrapper :global(table) {
        border-collapse: collapse;
        border-spacing: 0;
    }

    .table-wrapper :global(table td) {
        border-bottom: 1px solid #d0d0d0;
    }

    #gridded-map-input-table-wrapper {
        padding-bottom: 8px;
        width: 100%
    }

    #gridded-map-input-table-wrapper :global(table) {
        width: 100%;
    }

    #gridded-map-output-table-wrapper :global(th) {
        padding: 4px 6px;
        border-bottom: 1px solid #d0d0d0;
    }
</style>
