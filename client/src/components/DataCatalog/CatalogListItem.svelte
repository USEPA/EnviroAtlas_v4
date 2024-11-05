<script>
    import { getEALayerObject, addLayer } from "src/shared/addtoMap.js";
    import SubtopicDetails from "src/components/DataCatalog/SubtopicDetails.svelte";
    import detailConfig from "src/shared/dataCatalog_details_1layer.json";
    import { onMount } from "svelte";

    export let subtopic;
    export let view;
    export let layerID = null;
    let detailsFiltered = false;
    let detailsObj = {};

    // TODO: Should these be destroyed too?
    onMount(() => {
        new SubtopicDetails({
            target: document.body,
            props: { subtopic, detailsObj },
        });
    });

    function getEALayerId() {
        if (subtopic.layers.length < 2) {
            layerID = subtopic.layers[0].eaID
        }
        console.log('EA Layer: ', layerID)
        let lObject = getEALayerObject(layerID);
        // TODO: error handle if lObject is empty 
        addLayer(lObject, view);
    }

    function subtopicSelected(event) {
        layerID = event.target.value;
        console.log(layerID);
    }

    export const getSubtopicDetails = (sortId) => {
        // Get the object and pass to the SubtopicDetails component
        //TODO: Use api to get detailsObj
        detailsObj = detailConfig.filter(lyr => lyr.sortId == sortId)[0];
        detailsFiltered = true;
        return detailsObj
    }

</script>

<calcite-list-item label={subtopic.name}>
    {#key detailsObj}
        <SubtopicDetails {subtopic} {detailsObj}/>
    {/key}
    <calcite-action 
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
                    value={layer.eaID}
                    text-label={layer.title}
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
    }

    calcite-list-item {
        padding-left: 18px;
        --calcite-color-focus-color: none !important;
        --calcite-color-foreground-2: none !important;
    }

    /* This won't work until upgrading to calcite 2.13 
    https://github.com/Esri/calcite-design-system/commit/f8f881b9bb164d482cb2a77b1f7b1ba3125e1719
    calcite-avatar {
        --calcite-avatar-background-color: blue;
    }
    */
</style>