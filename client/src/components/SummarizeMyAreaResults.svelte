<script>
    import {
        smaAnalysisInputs,
        smaAnalysisOutputs,
        activeWidget
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
    bind:this={smaResultsPanel}
    heading="Summarize My Area Results"
    height-scale="l"
    data-panel-id="sma-results"
    hidden
    closed
>
    <calcite-block>
        <div slot="content-start">
            <div style="" id="gridded-map-title">
                <div>
                    <img
                        alt="https://www.epa.gov/enviroatlas"
                        src="images/horizontal_logo_grey.png"
                        style="height: 33px; display:block; margin:0 auto"
                    />
                </div>
                <div
                    style="display:block; margin:0 auto; text-align: center; font-size:18px; color:darkgray;"
                >
                    Summarize My Area Results
                </div>
            </div>
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
</style>
