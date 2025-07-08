<script>
    import { addLayer, getEaData, removeLayer } from "src/shared/utilities.js";
    import SubtopicDetails from "src/components/DataCatalog/SubtopicDetails.svelte";
    import { activeWidget } from "src/store.ts";

    export let subtopic;
    export let view;
    export let layerID = null;
    let detailsObj = {};

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
            openLayerList();
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

    function openLayerList() {
        let shell = document.querySelector(`[component-id="shell-panel-end"]`);
        let layerPanel = document.querySelector(`[data-panel-id="layers"]`)
        // Given the right side panel is closed, when Add to map is clicked, 
        // the right side panel opens with the layer list visible
        if (!$activeWidget.right) {
            layerPanel.removeAttribute("hidden");
            layerPanel.removeAttribute("closed");
            shell.removeAttribute("collapsed");
            $activeWidget.right = "layers";
            document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
        } else if ($activeWidget.right !== "layers") {
            // Given the right side panel is open, when Add to map is clicked, 
            // the right side panel remains open and has layer list visible
            layerPanel.removeAttribute("hidden");
            layerPanel.removeAttribute("closed");
            document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = false;
            document.querySelector(`[data-panel-id=${$activeWidget.right}]`).hidden = true;
            document.querySelector(`[data-panel-id=${$activeWidget.right}]`).closed = true;
            $activeWidget.right = "layers";
            document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
            shell.removeAttribute("collapsed");
        }
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
        } else {
            // TODO: write logic for subtopics with 2 or more layers
            // May need to destroy component on close, so new component can be instantiated when new dropdown is selected
            // Need to create different popup if layer isn't selected in dropdown - has generic description, no buttons, has message to select a layer
        }
        let detailsParams = {
            select: encodeURIComponent(`{"layerID":1,"description":1,"dfsLink":1,"DownloadSource":1,"metadataID":1}`)
        };
        let detailsObj = await getEaData(`/ea/api/layers/${layerID}`, detailsParams);
        console.log(detailsObj);
        let findPopover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
        if (!findPopover) {
            new SubtopicDetails({
                target: document.body,
                props: { subtopic, detailsObj },
            });
        }
        // Workaround for calcite v2.9. 
        let popover = document.querySelector(`[reference-element="${subtopic.subTopicID}-details-popover-button"]`);
        popover.setAttribute("open", "true");
        return detailsObj
    }

</script>

<calcite-list-item label={subtopic.name} on:calciteListItemSelect={e=>e.stopPropagation()}>
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
            <calcite-label scale='s' layout="inline">
                <calcite-checkbox name={layer.name} value={layer.layerID} on:calciteCheckboxChange={subtopicSelected}></calcite-checkbox>
                {layer.subLayerName}
            </calcite-label>
        {/each}
    </div>
    {/if}
    <calcite-chip-group
            slot="content-bottom"
            id="ea-chip-group"
            scale="s"
            selection-mode="none"
            label="ea-chip-group"
        >
            {#if subtopic.eaCA}
                <calcite-chip
                    scale="s"
                    value="eaCA"
                    class="eaCA"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/air.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaCPW}
                <calcite-chip
                    scale="s"
                    value="eaCPW"
                    class="eaCPW"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/water.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaCS}
                <calcite-chip
                    scale="s"
                    value="eaCS"
                    class="eaCS"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/clim.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaNHM}
                <calcite-chip
                    scale="s"
                    value="eaNHM"
                    class="eaNHM"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/haz.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaRCA}
                <calcite-chip
                    scale="s"
                    value="eaRCA"
                    class="eaRCA"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/rec.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaFFM}
                <calcite-chip
                    scale="s"
                    value="eaFFM"
                    class="eaFFM"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/food.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#if subtopic.eaBC}
                <calcite-chip
                    scale="s"
                    value="eaBC"
                    class="eaBC"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/bio.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
            {/if}
            {#each ['cbg', 'plp', 'grid', 'huc12'] as sType}
                {#if subtopic.sourceType == sType}
                    <calcite-chip
                    scale="s"
                    value={sType}
                    class="sType"
                >
                    <calcite-avatar
                        slot="image"
                        thumbnail="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{sType}.png"
                    >
                    </calcite-avatar>
                </calcite-chip>
                {/if}
            {/each}
        </calcite-chip-group>
</calcite-list-item>

<style>
    #ea-chip-group {
        margin-left: 5px;
        margin-bottom: 5px;
        margin-top: 5px;
    }

    calcite-list-item {
        padding-left: 18px;
        --calcite-color-focus-color: none !important;
        --calcite-color-foreground-2: none !important;
    }

    calcite-chip.eaCA {
        --calcite-chip-background-color: #7F81BA;
    }

    calcite-chip.eaCPW {
        --calcite-chip-background-color: #74CCD1;
    }

    calcite-chip.eaCS {
        --calcite-chip-background-color: #F99F1F;
    }

    calcite-chip.eaBC {
        --calcite-chip-background-color: #2EAE4A;
    }

    calcite-chip.eaFFM {
        --calcite-chip-background-color: #F0E024;
    }

    calcite-chip.eaNHM {
        --calcite-chip-background-color: #D75D64;
    }

    calcite-chip.eaRCA {
        --calcite-chip-background-color: #C770B4;
    }

    calcite-chip.sType {
        --calcite-chip-background-color: #BACFE1;
    }

    #concernFilterDiv {
        padding-left: 12px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 5px;
		max-width: 400px;
        font-size: 11px !important;
    }
</style>