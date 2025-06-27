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

    const _onGuamClick = (view) => {
        let extent = new Extent({
			xmax: 16446175.757969558,
			xmin: 16004237.379520258,
			ymax: 2301068.6854367177,
			ymin: 1503028.389935526,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
    }

    const _onPacIslesClick = (view) => {
        let extent = new Extent({
			xmax: -18844510.286599636,
			xmin: -19163997.22517633,
			ymax: -1444391.585028562,
			ymin: -1774134.0808157807,
            spatialReference: { wkid: 102100 },
        });
        view.goTo(extent).catch(function (error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        });
    }
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
            tabindex="0"
            role="button"
            id="climate-filter-conus"
            scale="s"
            text="Continental US"
            text-enabled
            on:click={_onConusClick(view)}
            on:keypress={_onConusClick(view)}
        ></calcite-action>
        <calcite-action
            tabindex="0"
            role="button"
            id="climate-filter-alaska"
            scale="s"
            text="Alaska"
            text-enabled
            on:click={_onAlaskaClick(view)}
            on:keypress={_onAlaskaClick(view)}
        ></calcite-action>
        <calcite-action
            tabindex="0"
            role="button"
            id="climate-filter-hawaii"
            scale="s"
            text="Hawaii"
            text-enabled
            on:click={_onHawaiiClick(view)}
            on:keypress={_onHawaiiClick(view)}
        ></calcite-action>
        <calcite-action
            tabindex="0"
            role="button"    
            id="climate-filter-prvi"
            scale="s"
            text="Puerto Rico & Virgin Islands"
            text-enabled
            on:click={_onPrViClick(view)}
            on:keypress={_onPrViClick(view)}
        ></calcite-action>
        <calcite-action 
            tabindex="0"
            role="button"
            id="climate-filter-guam"
            scale="s" 
            text="Guam" 
            text-enabled
            on:click={_onGuamClick(view)}
            on:keypress={_onGuamClick(view)}
        ></calcite-action>
        <calcite-action 
            tabindex="0"
            role="button"
            id="climate-filter-pacisles"
            scale="s" 
            text="Pacific Islands" 
            text-enabled
            on:click={_onPacIslesClick(view)}
            on:keypress={_onPacIslesClick(view)}
        ></calcite-action>
    </calcite-action-group>
</calcite-popover>
