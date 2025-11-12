<script>
    import { isStringNotEmpty } from "src/shared/utilities.js";

    export let subtopic;
    export let detailsObj;
    export let detailsArray;

    let categories = [
        { name: "eaCA", icon: "air" }, 
        { name: "eaNHM", icon: "haz" }, 
        { name: "eaCPW", icon: "water" }, 
        { name: "eaRCA", icon: "rec" }, 
        { name: "eaFFM", icon: "food" }, 
        { name: "eaBC", icon: "bio" },
        { name: "eaCS", icon: "clim" }
    ];
    
    export const openFactSheet = (factSheetsnippet) => {
        let url = "https://enviroatlas.epa.gov/enviroatlas/DataFactSheets/pdf/";
        window.open(url + factSheetsnippet);
    };

    export const openDataAccess = (d) => {
        console.log(d)
        if (isStringNotEmpty(d.agoID)) {
            let url = "https://epa.maps.arcgis.com/home/item.html?id="
            window.open(url + d.agoID)
        } else {
            window.open(d.url)
        }
    }
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
                {#each categories as cat (cat.name)}
                    {#if subtopic[cat.name]}
                    <span class="dot" id={cat.name}>
                        <img alt={cat.name} 
                            style="width:24px;height:24px;padding-left:3px;padding-top:3px" 
                            src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
                    </span>
                    {/if}
                {/each}
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
                href={detailsObj.dfsLink}
                target="_blank"
                >Fact Sheet
            </calcite-button>
            <calcite-button 
                icon-start="download-to" 
                round 
                scale="s" 
                on:click={openDataAccess(detailsObj)}
                target="_blank"
                href={isStringNotEmpty(detailsObj.agoID) ? "https://epa.maps.arcgis.com/home/item.html?id="+detailsObj.agoID : detailsObj.url}
            >Data Access</calcite-button>
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
                    href={d.dfsLink}
                    target="_blank"
                    on:click={openFactSheet(d.dfsLink)}
                    on:keypress={openFactSheet(d.dfsLink)}
                    >Fact Sheet
                </calcite-button>
                <calcite-button 
                    icon-start="download-to" 
                    round 
                    scale="s" 
                    target="_blank"
                    href={isStringNotEmpty(d.agoID) ? "https://epa.maps.arcgis.com/home/item.html?id="+d.agoID : d.url}
                    on:click={openDataAccess(d)}
                >Data Access</calcite-button>
            </div>
            </calcite-card>
            {/each}
        {/if}
        </calcite-flow-item>
    </calcite-flow>
</calcite-popover>

<style>
    calcite-flow-item {
        width: 330px;
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
