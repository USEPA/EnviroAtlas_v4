<script>
    import { addLayer, getEaData, removeLayer, openLayerList } from "src/shared/utilities.js";
    import SubtopicDetails from "src/components/DataCatalog/SubtopicDetails.svelte";
    import { activeWidget } from "src/store.ts";

    export let subtopic;
    export let view;
    export let layerID = null;
    let detailsObj = {};
    let detailsArray = [];

    async function getEALayerId() {
        if (subtopic.layers.length < 2) {
            layerID = subtopic.layers[0].layerID
        }
        console.log('EA Layer: ', layerID)
        let lObject = await getEALayerObject(layerID);
        // TODO: error handle if lObject is empty 
        addLayer(lObject, view);
        // If there is a layer added, open the Layer List
        if (lObject) {
            openLayerList($activeWidget);
        }
    }

    // When Add to Map button is clicked, get object from the mapping config
    function getEALayerObject(id) {
        // use api to fetch layer object
        let layerParams = {
            //TODO: where did type go?
            //TODO: test out using code like, select = JSON.stringify( {layerID:1,name:1,etc etc} )
            select: encodeURIComponent(`{"layerID":1,"name":1,"lyrNum":1,"popup":1,"tileLink":1,"tileURL":1,"type":1,"url":1,"serviceType":1,"sourceType":1}`)
        }
        let lObj = getEaData(`/ea/api/layers/${id}`, layerParams)
        return lObj
    }

    function subtopicSelected(event) {
        layerID = event.target.value;
        console.log(layerID);
        if (this.checked) {
            console.log('checked!')
            getEALayerId()
        } if (!this.checked) {
            console.log('unchecked!')
            removeLayer(event.target.name, view)
        }
    }

    async function getSubtopicDetails () {
        // Use api to get detailsObj and pass to the SubtopicDetails component with subtopic 
        if (subtopic.layers.length < 2) {
            layerID = subtopic.layers[0].layerID
            let detailsParams = {
                select: encodeURIComponent(`{"layerID":1,"description":1,"dfsLink":1,"DownloadSource":1,"metadataID":1}`)
            };
            let detailsObj = await getEaData(`/ea/api/layers/${layerID}`, detailsParams);
            let findPopover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
            if (!findPopover) {
                new SubtopicDetails({
                    target: document.body,
                    props: { subtopic, detailsObj },
                });
                console.log(detailsObj)
            }
            let popover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
            popover.setAttribute("open", "true");
            return detailsObj
        } else {
            for (const lyr of subtopic.layers) {
                layerID = lyr.layerID
                let detailsParams = {
                    select: encodeURIComponent(`{"layerID":1,"description":1,"dfsLink":1,"DownloadSource":1,"metadataID":1,"subLayerName":1}`)
                };
                let details = await getEaData(`/ea/api/layers/${layerID}`, detailsParams);
                detailsArray.push(details)
            }
            let findPopover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
            if (!findPopover) {
                new SubtopicDetails({
                    target: document.body,
                    props: { subtopic, detailsArray },
                });
            }
            let popover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
            popover.setAttribute("open", "true");
            return detailsArray
        }
    }

    let dataTypeDict = {
        'Summarized by Census Block Group': 'cbg', 
        'Summarized by Census Tracts': 'ctr',
        'Points, Lines, or Polygons': 'plp',
        'Non-summarized grid data':'grid',
        'Summarized by HUC12':'huc12',
        '': ''
    }
</script>
{#if subtopic.isVisible}
{#each Object.entries(dataTypeDict) as [dTypeLabel, dTypeValue] (dTypeLabel)}
    {#if subtopic.sourceType == dTypeValue}
<calcite-list-item id="not-header" label={subtopic.name} description={dTypeLabel} on:calciteListItemSelect={e=>e.stopPropagation()}>
    {#if subtopic.layers.length == 1}
    <calcite-checkbox 
        slot="actions-start" 
        aria-checked="false" 
        role="checkbox" 
        tabindex="0"
        value={subtopic.layers[0].layerID}
        name={subtopic.layers[0].name}
        on:calciteCheckboxChange={subtopicSelected}
    ></calcite-checkbox>
    {/if}
    <calcite-action 
        tabindex="-1"
        role="button"
        text="Details" 
        icon="information" 
        scale="m" 
        slot="actions-end" 
        id="{subtopic.subTopicID}-details-popover-button"
        on:click={detailsObj = () => getSubtopicDetails()}
        on:keypress={detailsObj = () => getSubtopicDetails()}>
    </calcite-action>
    {#if subtopic.layers.length > 1}
    <div slot="content-bottom" id="concernFilterDiv">
        {#each subtopic.layers as layer (layer.layerID)}
        {#if layer.isVisible}
            <calcite-label scale='s' layout="inline">
                <calcite-checkbox 
                    name={layer.name} 
                    value={layer.layerID} 
                    on:calciteCheckboxChange={subtopicSelected}
                />
                {layer.subLayerName}
            </calcite-label>
        {/if}
        {/each}
    </div>
    {/if}
</calcite-list-item>
    {/if}
{/each}
{/if}

<style>
    #not-header {
        --calcite-list-background-color: #fff;
        --calcite-list-background-color-hover: none;
        --calcite-list-background-color-press: none;
    } 

    #concernFilterDiv {
        padding-left: 24px;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 5px;
		max-width: 400px;
        font-size: 11px !important;
    }
</style>