<script>
    import {
        smaAnalysisInputs,
        smaAnalysisOutputs 
    } from "src/store.ts";
</script>

<calcite-panel
    heading="Summarize My Area Results"
    height-scale="l"
    data-panel-id="sma-results"
    hidden
    closed
>
    <calcite-block>
        <div slot="content-start" class="widget-gridded-map profile-tab-node">
            <div style="margin-bottom:10px" id="gridded-map-title">
                <div>
                    <img
                        alt="https://www.epa.gov/enviroatlas"
                        src="images/logo.png"
                        style="height: 33px; margin-top: 7px; display:inline-block; position:relative; left:50%; transform: translate(-50%); margin-bottom:-3px"
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
