<script>
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-label";
    import "@esri/calcite-components/dist/components/calcite-input-text";
    import "@esri/calcite-components/dist/components/calcite-icon";
    import "@esri/calcite-components/dist/components/calcite-tooltip";

    import { addAlertMessage } from "src/shared/addLayers.ts";
    import { openRightPanel, isLayerUrlInMap } from "../../shared/utilities";
    import { activeWidget } from "src/store.ts";
    

    export let view;
    export let isHidden = true;

    let url;

    function addUrl() {
        const feature = new FeatureLayer({
            url,
        });

        let drawCheck = isLayerUrlInMap(url, view);
            if (drawCheck) {
                addAlertMessage(
                    "",
                    "This layer is already in the map: " + feature.url,
                    "warning",
                    "Layer is already in the map",
                );
            } else {
                view.map.add(feature);

                view.whenLayerView(feature).then((layerView) => {
                    // If loading, open the layer list.
                    if ($activeWidget.right !== "layers") {
                        openRightPanel($activeWidget, "layers");
                    }
                    reactiveUtils.whenOnce(() => !layerView.updating);
                    // If adds successfully, add a success message
                    addAlertMessage(
                        "",
                        "Layer added to the map: " + feature.title,
                        "success",
                        "Success!",
                    );
                });
            }
    }
</script>

<calcite-panel hidden={isHidden}>
<calcite-label scale="m" layout="inline">
    <strong>Service URL</strong>
    <calcite-icon
        id="service-url-required"
        class="required"
        icon="bullet-point"
        scale="s"
    ></calcite-icon>
    <calcite-tooltip reference-element="service-url-required"
        >Required</calcite-tooltip
    >
</calcite-label>
<calcite-input-text
    required="true"
    placeholder="Enter service url"
    scale="m"
    on:calciteInputTextChange={function (e) {
        url = e.target.value;
    }}
    value={url}
>
    <calcite-button
        slot="action"
        scale="m"
        on:click={() => {
            addUrl();
        }}>Add</calcite-button
    >
</calcite-input-text>
</calcite-panel>

<style>
    calcite-icon.required {
        --calcite-ui-icon-color: var(--calcite-ui-danger);
    }
</style>
