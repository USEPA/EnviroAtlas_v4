<script>
    import { getEALayerObject, addLayer } from "src/shared/addtoMap.js";
    import SubtopicDetails from "src/components/DataCatalog/SubtopicDetails.svelte";
    import detailConfig from "src/shared/dataCatalog_details_1layer.json";
    import { activeWidget } from "src/store.ts";

    export let subtopic;
    export let view;
    export let layerID = null;
    let detailsObj = {};


    function getEALayerId() {
        if (subtopic.layers.length < 2) {
            layerID = subtopic.layers[0].eaID
        }
        console.log('EA Layer: ', layerID)
        let lObject = getEALayerObject(layerID);
        // TODO: error handle if lObject is empty 
        addLayer(lObject, view);
        // If there is a layer added, open the Layer List
        if (lObject.length > 0) {
            openLayerList();
        }
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
            console.log("toggle off of ", $activeWidget.right)
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
    }

    export const getSubtopicDetails = (sortId) => {
        // Get the object and pass to the SubtopicDetails component
        //TODO: Use api to get detailsObj
        detailsObj = detailConfig.filter(lyr => lyr.sortId == sortId)[0];
        let findPopover = document.querySelector(`[reference-element="${sortId}-details-popover-button"]`);
        if (!findPopover) {
            new SubtopicDetails({
                target: document.body,
                props: { subtopic, detailsObj },
            });
        }
        // Workaround for calcite v2.9. 
        let popover = document.querySelector(`[reference-element="${sortId}-details-popover-button"]`);
        popover.setAttribute("open", "true");
        return detailsObj
    }

</script>

<calcite-list-item label={subtopic.name}>
    <calcite-action 
        tabindex="-1"
        role="button"
        text="Details" 
        icon="information" 
        scale="s" 
        slot="actions-end" 
        id="{subtopic.sortId}-details-popover-button"
        on:click={detailsObj = () => getSubtopicDetails(subtopic.sortId)}
        on:keypress={detailsObj = () => getSubtopicDetails(subtopic.sortId)}></calcite-action>
    {#if subtopic.layers.length > 1}
        <calcite-combobox
            scale="s"
            slot="content-bottom"
            selection-mode="single-persist"
            label={subtopic.name}
            name={subtopic.name}
            required
            placeholder="Select a layer"
            on:calciteComboboxChange={subtopicSelected}
        >
            {#each subtopic.layers as layer}
                <calcite-combobox-item
                    value={layer.layerID}
                    text-label={layer.subLayerName}
                ></calcite-combobox-item>
            {/each}
        </calcite-combobox>
    {/if}

    <calcite-action-bar
        slot="content-bottom"
        layout="horizontal"
        expand-disabled
    >
    <calcite-chip-group
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
        <calcite-button
            role="button"
            tabindex="0"
            scale="s"
            round
            label="Add to map"
            slot="actions-end"
            appearance='transparent'
            on:click={getEALayerId}
            on:keypress={getEALayerId}
            >Add to map</calcite-button
        >
    </calcite-action-bar>
</calcite-list-item>

<style>
    calcite-button {
        margin-left: 5px;
        margin-bottom: 5px;
        margin-top: 5px;
    }
    
    calcite-combobox {
        margin-top: 5px;
        margin-bottom: 5px;
        --calcite-color-brand: #005ea2;
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
</style>