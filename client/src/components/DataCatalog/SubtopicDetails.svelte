<script>
    export let subtopic;
    export let detailsObj;
    export let detailsArray;

    export const openFactSheet = (factSheetsnippet) => {
        let url = "https://enviroatlas.epa.gov/enviroatlas/DataFactSheets/pdf/";
        window.open(url + factSheetsnippet);
    };
</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    label="{subtopic.subTopicID}-details-popover-button"
    reference-element="{subtopic.subTopicID}-details-popover-button"
    auto-close
    trigger-disabled
>
    <calcite-flow>
        <calcite-flow-item heading="Details">
            <span slot="header-actions-end" style="display:inline-block;align-content:center;">
                {#if subtopic.eaCA}
                <span class="dot" id=eaCA>
                    <img alt="eaCA" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/air.png">
                </span>
                {/if}
                {#if subtopic.eaCPW}
                <span class="dot" id=eaCPW>
                    <img alt="eaCPW" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/water.png">
                </span>
                {/if}
                {#if subtopic.eaNHM}
                <span class="dot" id=eaNHM>
                    <img alt="eaNHM" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/haz.png">
                </span>
                {/if}
                {#if subtopic.eaRCA}
                <span class="dot" id=eaRCA>
                    <img alt="eaRCA" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/rec.png">
                </span>
                {/if}
                {#if subtopic.eaFFM}
                <span class="dot" id=eaFFM>
                    <img alt="eaFFM" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/food.png">
                </span>
                {/if}
                {#if subtopic.eaBC}
                <span class="dot" id=eaBC>
                    <img alt="eaBC" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/bio.png">
                </span>
                {/if}                
                {#if subtopic.eaCS}
                <span class="dot" id=eaCS>
                    <img alt="eaCS" 
                        style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                        src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/clim.png">
                </span>
                {/if}
            </span>
        {#if detailsObj}
            <span slot="content-top">
            <h4 style="margin:0;line-height:1.1em">{subtopic.name}</h4>
            <p style="margin-top:5px;margin-bottom:0;font-size:12px;line-height:1.1em">{detailsObj.description}</p>
        </span>    
        <div slot="footer-end">
            <calcite-button
                icon-start="file"
                label="{subtopic.layerID}-pdf"
                tabindex="0"
                role="button"
                round
                scale="s"
                on:click={openFactSheet(detailsObj.dfsLink)}
                on:keypress={openFactSheet(detailsObj.dfsLink)}
                >Fact Sheet
            </calcite-button>
            <calcite-button icon-start="download-to" round scale="s"
                >Data Access
            </calcite-button>
        </div>
        {/if}
        {#if detailsArray}
            {#each detailsArray as d}
            <calcite-card>
            <span slot="description">
                <h4 style="margin:0;line-height:1.1em">{d.subLayerName}</h4>
                <p style="margin-top:5px;margin-bottom:0;font-size:12px;line-height:1.1em">{d.description}</p>
            </span>    
            <div slot="footer-end">
                <calcite-button
                    icon-start="file"
                    label="{d.layerID}-pdf"
                    tabindex="0"
                    role="button"
                    round
                    scale="s"
                    on:click={openFactSheet(d.dfsLink)}
                    on:keypress={openFactSheet(d.dfsLink)}
                    >Fact Sheet
                </calcite-button>
                <calcite-button icon-start="download-to" round scale="s"
                    >Data Access
                </calcite-button>
            </div>
            </calcite-card>
            {/each}
        {/if}
        </calcite-flow-item>
    </calcite-flow>
</calcite-popover>

<style>
    calcite-flow-item {
        width: 310px;
        --calcite-ui-focus-color: none !important;
    }

    calcite-card {
        padding-bottom: 2px;
    }

    .dot#eaCA {
        background-color: #7f81ba;
    }
    .dot {
        margin-right: 2px;
        height:30px;
        width:30px;
        border-radius: 50%;
        display: inline-block;
    }

    .dot#eaCPW {
        background-color: #74ccd1;
    }

    .dot#eaBC {
        background-color: #2eae4a;
    }

    .dot#eaFFM {
        background-color: #f0e024;
    }

    .dot#eaNHM {
        background-color: #d75d64;
    }

    .dot#eaRCA {
        background-color: #c770b4;
    }

    .dot#eaCS {
        background-color: #F99F1F;
    }
</style>
