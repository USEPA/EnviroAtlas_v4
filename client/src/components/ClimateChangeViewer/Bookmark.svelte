<script>
    import Extent from "@arcgis/core/geometry/Extent";

    export let view;

    const _onHawaiiClick = (view) => {
        let extent = new Extent({
            xmax: -17232996.3537,
            xmin: -17838620.5975,
            ymax: 2539458.2165,
            ymin: 2144428.1256,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
        document.querySelector('[id="climate-change-popover-button"]').open =
            false;
        document.querySelector('[id="popover-button"]').indicator = true;
        document.querySelector('[id="climate-filter-hawaii"]').active = true;
    };

    const _onConusClick = (view) => {
        let extent = new Extent({
            xmax: -5347672,
            xmin: -15914327,
            ymax: 7733573,
            ymin: 1853426,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
        document.querySelector('[id="climate-change-popover-button"]').open =
            false;
        document.querySelector('[id="popover-button"]').indicator = true;
        document.querySelector('[id="climate-filter-conus"]').active = true;
    };

    const _onAlaskaClick = (view) => {
        let extent = new Extent({
            xmax: -15876210.0,
            xmin: -19061453.32,
            ymax: 12511315.0,
            ymin: 6923265.0,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
        document.querySelector('[id="climate-change-popover-button"]').open =
            false;
        document.querySelector('[id="popover-button"]').indicator = true;
        document.querySelector('[id="climate-filter-alaska"]').active = true;
    };

    const _onPrViClick = (view) => {
        let extent = new Extent({
            xmax: -7187363.955800,
            xmin: -7564321.223000,
            ymax: 2098168.552400,
            ymin: 1999395.310000,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
        document.querySelector('[id="climate-change-popover-button"]').open =
            false;
        document.querySelector('[id="popover-button"]').indicator = true;
        document.querySelector('[id="climate-filter-prvi"]').active = true;
        console.log(document.querySelector('[id="climate-filter-action-group"]'));
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
>
    <calcite-tooltip>Filter data and zoom to extent</calcite-tooltip>
    <calcite-action-group id="climate-filter-action-group" scale="s">
        <calcite-action
            id="climate-filter-conus"
            scale="s"
            text="Continental US"
            text-enabled
            on:click={_onConusClick(view)}
        ></calcite-action>
        <calcite-action
            id="climate-filter-alaska"
            scale="s"
            text="Alaska"
            text-enabled
            on:click={_onAlaskaClick(view)}
        ></calcite-action>
        <calcite-action
            id="climate-filter-hawaii"
            scale="s"
            text="Hawaii"
            text-enabled
            on:click={_onHawaiiClick(view)}
        ></calcite-action>
        <calcite-action
            id="climate-filter-prvi"
            scale="s"
            text="Puerto Rico & Virgin Islands"
            text-enabled
            on:click={_onPrViClick(view)}
        ></calcite-action>
        <calcite-action scale="s" text="Pacific Islands" text-enabled
        ></calcite-action>
    </calcite-action-group>
</calcite-popover>
