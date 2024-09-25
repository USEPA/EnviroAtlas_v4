<script>
    import { getEALayerObject, addLayer } from "src/shared/addtoMap.js";

    export let subtopic;
    export let view;
    export let layerID = null;

    function getEALayerId() {
        if (subtopic.layers.length < 2) {
            layerID = subtopic.layers[0].eaID
        }
        console.log('EA Layer: ', layerID)
        let lObject = getEALayerObject(layerID);
        addLayer(lObject, view);
    }

    function subtopicSelected(event) {
        layerID = event.target.value;
        console.log(layerID);
    }
</script>


<calcite-list-item>
    <calcite-label
        scale="s"
        id="listItemHeader"
        slot="content"
    >{subtopic.name}
    </calcite-label>
    <calcite-action-bar
        slot="content"
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
        </calcite-chip-group>
    </calcite-action-bar>
    {#if subtopic.layers.length > 1}
        <calcite-combobox
            scale="s"
            slot="content"
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
        slot="content"
        layout="horizontal"
        expand-disabled
    >
        <calcite-button
            scale="s"
            round
            label="Add to map"
            slot="actions-end"
            on:click={getEALayerId}
            on:keypress={getEALayerId}
            >Add to map</calcite-button
        >
        <calcite-button
            scale="s"
            round
            label="Details"
            slot="actions-end"
            >Details</calcite-button
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

    #listItemHeader {
        font-weight: bold;
    }
    
</style>