<script>
    import {
        smaAnalysis
    } from "src/store.ts";
    import SummarizeMyAreaResultsCard from "./SummarizeMyAreaResultsCard.svelte";

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

    function handleClearResults() {
        $smaAnalysis = [];
    }
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
    {#if $smaAnalysis.length > 0}
    <calcite-action 
        slot="header-actions-end" 
        icon="reset"
        text="Clear results"
        text-enabled
        on:click={handleClearResults}
    ></calcite-action>
    <calcite-block>
        <div slot="content-start" class="widget-gridded-map profile-tab-node">
            <div style="margin-bottom:10px" id="gridded-map-title">
                
                <div>
                    <img
                        alt="https://www.epa.gov/enviroatlas"
                        src="/ea/client/images/horizontal_logo_grey.png"
                        style="height: 33px; margin-top: 7px; display:inline-block; position:relative; left:50%; transform: translate(-50%); margin-bottom:-3px"
                    />
                </div>
                <div
                    style="display:block; margin:0 auto; text-align: center; font-size:18px; color: #141414;"
                >
                    Summarize My Area Results
                </div>
            </div>
            {#each $smaAnalysis as a (a.id)}
            <SummarizeMyAreaResultsCard
                inputHeaders={a.inputHeaders}
                inputData={a.inputData}
                outputHeaders={a.outputHeaders}
                outputData={a.outputData}
            />
            {/each}
        </div>
    </calcite-block>
    {:else}
    <calcite-notice style="margin-top:12px; width:387px" appearance="outline-fill" kind="info" open width="full" icon="information">
        <div slot="message">There are currently no results to display.</div>
    </calcite-notice>
    {/if}
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
    calcite-fab {
        place-content: center;
        padding-top: 4px;
        padding-bottom: 4px;
    }

    calcite-panel.right-panel {
        --calcite-panel-header-background-color: #f7f7f7
    }
</style>
