<script>
    import Portal from "@arcgis/core/portal/Portal";
    import Layer from "@arcgis/core/layers/Layer";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-input-text";
    import "@esri/calcite-components/dist/components/calcite-pagination";
    import { addDataConfig } from "src/shared/addDataConfig";
    import { openRightPanel, isLayerUrlInMap } from "../../shared/utilities";
    import { activeWidget } from "src/store.ts";
    import { addAlertMessage } from "src/shared/addLayers.ts";

    export let view;

    let searchResults;
    let searchTerm;
    let scopeOptSelection;
    let layers = {};

    let portal = new Portal(addDataConfig.myOrg);
    portal.authMode = "anonymous";
    portal
        .load()
        .then((portal) => {
            let queryParams = {
                query: addDataConfig.scopeOptions[0].filter,
                sortField: "numViews",
                sortOrd: "desc",
                num: 30,
            };

            portal.queryItems(queryParams).then((res) => {
                console.log(res);
                searchResults = res.results;
            });
        })
        .catch((err) => {
            console.error(err);
        });

    function search() {
        alert("search not enabled yet: " + searchTerm);
    }

    function openDetails(layer) {
        let url = layer.url;
        window.open(url);
    }

    function addDataLayer(layer) {
        Layer.fromPortalItem({
            portalItem: {
                id: `${layer.id}`,
            },
        }).then((lyr) => {
            let drawCheck = isLayerUrlInMap(layer.url, view);
            if (drawCheck) {
                addAlertMessage(
                    "",
                    "This layer is already in the map: " + layer.title,
                    "warning",
                    "Layer is already in the map",
                );
            } else {
                view.map.add(lyr);

                view.whenLayerView(lyr).then((layerView) => {
                    // If loading, open the layer list.
                    if ($activeWidget.right !== "layers") {
                        openRightPanel($activeWidget, "layers");
                    }
                    reactiveUtils.whenOnce(() => !layerView.updating);
                    // If adds successfully, add a success message
                    addAlertMessage(
                        "",
                        "Layer added to the map: " + layer.title,
                        "success",
                        "Success!",
                    );
                });
            }
        });
    }
</script>

<calcite-panel>
    <div>
        <div style="display:flex;">
            <calcite-combobox
                bind:this={scopeOptSelection}
                style="width:45%; margin-right:4%"
                selection-mode="single"
                clear-disabled="true"
            >
                {#each addDataConfig.scopeOptions as scopeOpt}
                    <calcite-combobox-item
                        value={scopeOpt.value}
                        heading={scopeOpt.name}
                        selected={scopeOpt.selected}
                    ></calcite-combobox-item>
                {/each}
            </calcite-combobox>
            <calcite-input-text
                style="width:50%; float: right;"
                required="true"
                placeholder="Enter search terms"
                scale="m"
                on:calciteInputTextChange={function (e) {
                    searchTerm = e.target.value;
                }}
                value={searchTerm}
            >
                <calcite-button
                    slot="action"
                    scale="m"
                    on:click={() => {
                        search();
                    }}
                    icon-start="search"
                ></calcite-button>
            </calcite-input-text>
        </div>
        <div style="display:flex; margin-top:8px; margin-bottom:8px">
            <calcite-combobox
                style="width:42%; margin-right:4%"
                placeholder="Type"
                selection-mode="single"
                clear-disabled="true"
            >
                {#each addDataConfig.typeOptions as typeOpt}
                    <calcite-combobox-item
                        value={typeOpt.value}
                        heading={typeOpt.name}
                    ></calcite-combobox-item>
                {/each}
            </calcite-combobox>
            <calcite-combobox
                style="width:42%; margin-right:3% "
                selection-mode="single"
                clear-disabled="true"
            >
                {#each addDataConfig.sortOptions as sortOpt}
                    <calcite-combobox-item
                        value={sortOpt.value}
                        heading={sortOpt.name}
                        selected={sortOpt.selected}
                    ></calcite-combobox-item>
                {/each}
            </calcite-combobox>
            <calcite-action icon="sort-descending-arrow" scale="s" kind="brand"
            ></calcite-action>
        </div>
    </div>
    <calcite-list
        label="toc"
        selection-mode="none"
        scale="auto"
        style="border-top: 1px solid #dedede; padding-top: 3px; display:flex;"
    >
        {#await searchResults}
            <p>...loading</p>
        {:then}
            {#each searchResults as item}
                <calcite-list-item>
                    <calcite-card
                        slot="content"
                        thumbnail-position="inline-start"
                    >
                        <img
                            slot="thumbnail"
                            src={item.thumbnailUrl}
                            alt={item.title}
                        />
                        <span slot="heading" style="font-size:12px"
                            >{item.title}</span
                        >
                        <span slot="description" style="font-size:10px"
                            >{item.type} by {item.owner}</span
                        >
                        <calcite-button
                            slot="footer-start"
                            kind="neutral"
                            icon-start="layer"
                            on:click={() => addDataLayer(item)}
                            >Add</calcite-button
                        >
                        <calcite-button
                            slot="footer-start"
                            kind="neutral"
                            icon-start="attachment"
                            on:click={() => openDetails(item)}
                            >Details</calcite-button
                        >
                    </calcite-card>
                </calcite-list-item>
            {/each}
        {/await}
    </calcite-list>
    <calcite-pagination
        scale="s"
        slot="footer"
        page-size="10"
        start-item="1"
        total-items="200"
    ></calcite-pagination>
</calcite-panel>

<style>
    calcite-action {
        --calcite-action-background-color: #162e51;
        --calcite-action-text-color: white;
    }
</style>
