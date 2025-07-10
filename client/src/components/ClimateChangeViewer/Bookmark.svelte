<script>
    import { filteredNationalItems, geography } from "src/store.ts";
    import Extent from "@arcgis/core/geometry/Extent";

    export let view;

    let bookmarks = [
        { name: "CONUS", text: "Continental US", extentObj: {xmax: -5347672, xmin: -15914327, ymax: 7733573, ymin: 1853426}}, 
        { name: "Hawaii", text: "Hawaii", extentObj: { xmax: -17232996.3537, xmin: -17838620.5975, ymax: 2539458.2165, ymin: 2144428.1256}},
        { name: "Alaska", text: "Alaska", extentObj: { xmax: -15876210.0, xmin: -19061453.32, ymax: 12511315.0, ymin: 6923265.0}},
        { name: "Guam", text: "Guam", extentObj: { xmax: 16446175.757969558, xmin: 16004237.379520258, ymax: 2301068.6854367177, ymin: 1503028.389935526}},
        { name: "Prvi", text: "Puerto Rico & Virgin Islands", extentObj: { xmax: -7187363.955800, xmin: -7564321.223000, ymax: 2098168.552400, ymin: 1999395.310000}},
        { name: "PacIsles", text: "Pacific Islands", extentObj: { xmax: -18844510.286599636, xmin: -19163997.22517633, ymax: -1444391.585028562, ymin: -1774134.0808157807}}
    ];

    let bookmarkPopupButton;

    const onGeogChange = (bookmark) => {
        let extent = new Extent({...bookmark.extentObj, spatialReference: { wkid: 102100 }});
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });

        //TODO: only one bookmark can be active at a time. No "clear" or "none" option. Conus is default.
        document.querySelector('[id="popover-button"]').indicator = true;

        bookmarkPopupButton.open = false;
        bookmark.element.active = true;
 
        //TODO: put in all stuff that changes this dataList Query Store we are creating that triggers dataList refresh in that comopnent
       
        $geography = bookmark.name
        console.log($geography)
        console.log($filteredNationalItems)
    };

</script>

<calcite-popover
    placement="trailing-start"
    overlay-positioning="fixed"
    scale="s"
    heading="Filter options"
    label="Filter options"
    reference-element="popover-button"
    id="climate-change-popover-button"
    bind:this={bookmarkPopupButton}
>
    <calcite-tooltip>Filter data and zoom to extent</calcite-tooltip>
    <calcite-action-group id="climate-filter-action-group" scale="s">
        {#each bookmarks as bm}
            <calcite-action
                bind:this={bm.element}
                label={bm.name}
                tabindex="0"
                role="button"
                scale="s"
                text={bm.text}
                text-enabled
                on:click={()=>onGeogChange(bm)}
                on:keypress={()=>onGeogChange(bm)}
            ></calcite-action>
        {/each}
    </calcite-action-group>
</calcite-popover>