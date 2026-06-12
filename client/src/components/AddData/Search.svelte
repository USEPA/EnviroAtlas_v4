<script>
    import Portal from "@arcgis/core/portal/Portal";
    import Layer from "@arcgis/core/layers/Layer";
    import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-input-text";
    import "@esri/calcite-components/dist/components/calcite-pagination";
    import { addDataConfig } from "./addDataConfig";
    import { openRightPanel, isLayerUrlInMap } from "../../shared/utilities";
    import { activeWidget } from "src/store.ts";
    import { addAlertMessage } from "src/shared/addLayers.ts";
    import { SearchController } from "./searchController";

    export let view;
    export let isHidden = false;

    let searchPanel;
    let searchTerm;
    let scopeOptSelection;
    let typeOptSelection;
    let sortOptSelection;
    let searchObj = new SearchController();

    let portal = new Portal(addDataConfig.myOrg);
    portal.authMode = "anonymous";
    portal
        .load()
        .then((portal) => {
            searchObj.q.query = addDataConfig.scopeOptions[0].filter;
            searchObj.q.sortField = "numViews";
            searchObj.q.sortOrder = "desc";
            searchObj.q.num = addDataConfig.itemsPerPage

            portal.queryItems(searchObj.q).then((res) => {
                searchObj.response = res;
                searchObj.searchResults = res.results;
                searchObj.total = res.total
            });
        })
        .catch((err) => {
            console.error(err);
            searchObj.error = err;
        });

    function search() {
        searchObj.qText = searchTerm
        buildQueryString()
    }

    function updateSortOpt() {
        const selectedSortValue = sortOptSelection?.selectedItems?.[0]?.value;
        const selectedSortOpt = addDataConfig.sortOptions.find((opt) => opt.value === selectedSortValue);
        searchObj.q.sortField = selectedSortOpt?.value;
        searchObj.q.sortOrder = selectedSortOpt?.sortOrder;
        portalSearch();
    }

    function updateTypeOpt() {
        console.log(typeOptSelection.selectedItems)
        if (typeOptSelection.selectedItems.length === 1) {
            searchObj.types = `type:"${typeOptSelection.selectedItems[0].value}"`
            buildQueryString()
        } else if (typeOptSelection.selectedItems.length === 0) {
            searchObj.types = 'type:"Map Service" OR type:"Feature Service" OR type:"Image Service"'
            buildQueryString()
        } else if (typeOptSelection.selectedItems.length > 1) {
            let typeFilter = "";
            for (let items of typeOptSelection.selectedItems) {
                typeFilter += `type:"${items.value}" OR `
            }
            let typeString = typeFilter.slice(0,-4)
            searchObj.types = typeString
            buildQueryString();
        }
    }

    function buildQueryString(){
        if (searchObj.scope && !searchObj.qText) {
            searchObj.q.query = `(${searchObj.scope}) AND (${searchObj.types})`
        } else if (searchObj.scope && searchObj.qText) {
            searchObj.q.query = `(${searchObj.scope}) AND (${searchObj.qText}) AND (${searchObj.types})`
        } else if (!searchObj.scope && searchObj.qText) {
            portal = new Portal(addDataConfig.agol);
            portal.authMode = "anonymous";
            portal.load()
            searchObj.q.query = `(${searchObj.qText}) AND (${searchObj.types})`
        } else if (!searchObj.scope && !searchObj.qText) {
            portal = new Portal(addDataConfig.agol);
            portal.authMode = "anonymous";
            portal.load()
            searchObj.q.query = searchObj.types
        }
        portalSearch();
    }

    function updateScope() {
        const selectedScope = scopeOptSelection?.selectedItems?.[0]?.value;
        const selectedScopeOpt = addDataConfig.scopeOptions.find((opt) => opt.value === selectedScope);
        searchObj.scope = selectedScopeOpt?.filter;
        buildQueryString();
    }

    function changePage(){
        if (searchObj.total > 20) {
            const startItem = event?.target.startItem;
            searchObj.q.start = startItem;
            portalSearch()
        } else {
            searchObj.q.start = 1;
        }
    }

    function portalSearch() {
        portal.queryItems(searchObj.q).then((res) => {
            searchObj.response = res;
            searchObj.searchResults = res.results;
            searchObj.total = res.total
        }).catch((err) => {
            console.error(err);
            searchObj.error = err;
        });
    }

    function openDetails(layer) {
        let url = 'https://epa.maps.arcgis.com/home/item.html?id=';
        let id = layer.id
        window.open(url + id);
    }

    function addDataLayer(layer) {
        searchPanel.loading = true;
        Layer.fromPortalItem({
            portalItem: {
                id: `${layer.id}`
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
                    searchPanel.loading = false;
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
        }).catch((err) => {
            searchPanel.loading = false;
            console.log(err)
        });
    }

    //TODO: toggle ascending/descending button.
</script>

    <div hidden={isHidden} style="padding:8px; border-top: 1px solid #dedede; background-color:white">
        <div style="display:flex;">
            <calcite-combobox
                bind:this={scopeOptSelection}
                style="width:45%; margin-right:4%"
                selection-mode="single"
                clear-disabled="true"
                on:calciteComboboxChange={()=>updateScope()}
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
                clearable
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
        <div style="display:flex; margin-top:8px; margin-bottom:8px;">
            <calcite-combobox
                bind:this={typeOptSelection}
                style="width:45%; margin-right:4%;height:32px; min-height:32px; max-height:32px"
                placeholder="Type"
                selection-display="fit"
                clear-disabled="true"
                on:calciteComboboxChange={()=>updateTypeOpt()}
            >
                {#each addDataConfig.typeOptions as typeOpt}
                    <calcite-combobox-item
                        value={typeOpt.value}
                        heading={typeOpt.name}
                        selected={typeOpt.selected}
                    ></calcite-combobox-item>
                {/each}
            </calcite-combobox>
            <calcite-combobox
                bind:this={sortOptSelection}
                style="width:40%; margin-right:2% "
                selection-mode="single"
                clear-disabled="true"
                on:calciteComboboxChange={()=>updateSortOpt()}
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
    <calcite-panel bind:this={searchPanel} hidden={isHidden}>
    <calcite-list
        label="toc"
        selection-mode="none"
        scale="auto"
        style="border-top: 1px solid #dedede; padding-top: 3px; display:flex;"
    >
        {#await searchObj.searchResults}
            <p>...loading</p>
        {:then}
            {#each searchObj.searchResults as item}
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
        on:calcitePaginationChange={()=>changePage()}
        scale="s"
        slot="footer"
        page-size="20"
        start-item="1"
        total-items={searchObj.total}
    ></calcite-pagination><calcite-label style="margin-left: 18px; padding-top: 12px" slot="footer">{searchObj.total} Items</calcite-label>
</calcite-panel>

<style>
    calcite-action {
        --calcite-action-background-color: #162e51;
        --calcite-action-text-color: white;
    }
</style>
