<script>
  // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-shell";
  import "@esri/calcite-components/dist/components/calcite-shell-panel";
  import "@esri/calcite-components/dist/components/calcite-action";
  import "@esri/calcite-components/dist/components/calcite-action-bar";
  import "@esri/calcite-components/dist/components/calcite-panel";
  import "@esri/calcite-components/dist/components/calcite-navigation";
  import "@esri/calcite-components/dist/components/calcite-navigation-logo";

  // Import arcgis js api
  import Basemap from "@arcgis/core/Basemap.js";
  import BasemapStyle from "@arcgis/core/support/BasemapStyle.js";
  //import FeatureTable from "@arcgis/core/widgets/FeatureTable";

  import "@arcgis/map-components/components/arcgis-scale-bar";
  import "@arcgis/map-components/components/arcgis-map";
  import "@arcgis/map-components/components/arcgis-basemap-gallery";
  import "@arcgis/map-components/components/arcgis-coordinate-conversion";
  import "@arcgis/map-components/components/arcgis-layer-list";
  import "@arcgis/map-components/components/arcgis-zoom";
  import "@arcgis/map-components/components/arcgis-search";

  // Import components and store
  import { viewState, catalog, activeWidget } from "src/store.ts";
  import SummarizeMyArea from "src/components/SummarizeMyArea.svelte";
  import DataCatalog from "src/components/DataCatalog/DataList.svelte";
  import Modal from "src/components/Modal.svelte";

  let mapContainer;
  let bmgContainer;
  let layerListContainer;
  let fTableContainer;
  let leftActionBar;

  const basemap = new Basemap({
    style: new BasemapStyle({
      id: "arcgis/topographic",
      worldview: "unitedStatesOfAmerica"
    })
  })

  catalog.subscribe;

  function listItemCreatedFunction(e) {
    const item = e.item;
    // TODO: make layer NOT disabled if it isn't visibleAtCurrentScale
    // This is so the features can be clicked for popup, even if tile layer is visibleAtCurrentScale
    if (item.layer.type != "group") {
      // don't show legend twice
      item.panel = {
        content: "legend",
        open: true,
      };
      item.actionsSections = [
        [
          {
            title: "Increase transparency",
            icon: "chevron-up",
            id: "inc-transparency",
          },
          {
            title: "Decrease transparency",
            icon: "chevron-down",
            id: "dec-transparency",
          },
          {
            title: "Show table",
            icon: "table",
            id: "table",
          },
          {
            title: "Remove",
            icon: "trash",
            id: "trash",
          },
        ],
      ];
    };
  }

  function layerListAction(e) {
    console.log(e)
    const id = e.detail.action.id;
    if (id === "trash") {
      const title = e.detail.item.layer.title;
      // remove tile layer and feature layer with same title
      const removals = e.detail.item.view.map.allLayers.filter(function(layer) {
        return layer.title === title
      })
      e.detail.item.view.map.removeMany(removals);
      // uncheck the layer's checkbox in the data catalog
      document.querySelector(`calcite-checkbox[name="${e.detail.item.layer.title}"]`).removeAttribute("checked");
    } else if (id === 'inc-transparency') {
      e.detail.item.layer.opacity += .1
    } else if (id === 'dec-transparency') {
      e.detail.item.layer.opacity -= .1
    } else if (id == 'table') {
      // TODO: have a feature table widget in the app.
      // https://developers.arcgis.com/javascript/latest/sample-code/feature-table/
      console.log(e.detail.item.layer);
      // document.querySelector(`[id="shell-panel-table"]`).collapsed = false
      // const featureTable = new FeatureTable({
      //   view: view, // Required for feature highlight to work
      //   layer: e.item.layer,
      //   container: fTableContainer
      // })
    }
  }

  const handleExpandClick = () => {
    let panel = document.getElementById("data-catalog");
    let shell = document.getElementById("shell-panel-start");
    leftActionBar.setAttribute("hidden", "");
    panel.removeAttribute("hidden");
    panel.setAttribute("open", "");
    shell.removeAttribute("collapsed");
  };

  const handleCatalogActionClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    handleExpandClick();
    
    const nextDataCatalog = target.dataset.actionId;

    if (nextDataCatalog !== $catalog.type) {
      let activeAction = document.querySelectorAll(`[data-action-id=${$catalog.type}]`);
      activeAction.forEach((action) => {
        action.removeAttribute("active")
      });
      document.querySelector(`[data-panel-id=${$catalog.type}]`).setAttribute("hidden", "");
      let nextAction = document.querySelectorAll(`[data-action-id=${nextDataCatalog}]`);
      nextAction.forEach((action) => {
        action.setAttribute("active", "");
      });
      document.querySelector(`[data-panel-id=${nextDataCatalog}]`).removeAttribute("hidden");
      $catalog.type = nextDataCatalog;
    } 

    nextDataCatalog == 'add-data' 
      ? document.querySelector(`[id=catalog-search-filter]`).setAttribute("hidden", "") 
      : document.querySelector(`[id=catalog-search-filter]`).removeAttribute("hidden");
  };

  const handleOtherActionBarClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }
    // If there's one already active, close things.
    if ($activeWidget.right) {
      document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = false;
      document.querySelector(`[data-panel-id=${$activeWidget.right}]`).hidden = true;
      document.querySelector(`[data-panel-id=${$activeWidget.right}]`).closed = true;
      document.querySelector(`[component-id="shell-panel-end"]`).collapsed = true;
    }

    // Figure out what was clicked
    const nextWidgetRight = target.dataset.actionId;
    // If there's a change, open things, and update store value to what was clicked
    if (nextWidgetRight !== $activeWidget.right) {
      document.querySelector(`[data-action-id=${nextWidgetRight}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).hidden = false;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).closed = false;
      document.querySelector(`[component-id="shell-panel-end"]`).collapsed = false;
      $activeWidget.right = nextWidgetRight;
    } else {
      $activeWidget.right = null;
    }
  };

  // const openModal = function () {
  //   const button = document.getElementById("example-button");
  //   const modal = document.getElementById("example-modal");

  //   button?.addEventListener("click", function () {
  //     modal.open = !modal.open;
  //     console.log(modal);
  //   });
  // };

  export const closeShellElement = function (e) {
    const target = e.target;
    const shellElement = target.parentElement;
    shellElement.collapsed = !shellElement.collapsed;
  };
  
</script>

<calcite-shell>
  <calcite-navigation id="header" slot="header">
    <calcite-navigation-logo
      slot="content-start"
      heading="v4"
      thumbnail="/ea/client/images/logo.png"
      href="https://www.epa.gov/enviroatlas"
      target="_blank"
    ></calcite-navigation-logo>
    <calcite-chip-group slot="content-end" expanded>
      {#each [
        {label:'Data Download', icon:'download-to', link:'https://www.epa.gov/enviroatlas/forms/enviroatlas-data-download'}, 
        {label:'Contact Us', icon:'envelope', link:'https://www.epa.gov/enviroatlas/forms/contact-us-about-enviroatlas'}
        ] as link}
        <calcite-button scale="s" target="_blank" id='linkbtns' href={link.link}>
          <calcite-chip icon={link.icon} scale="l">{link.label}</calcite-chip>
        </calcite-button>
        {/each}
    </calcite-chip-group>
  </calcite-navigation>
  <arcgis-map bind:this={mapContainer} basemap={basemap} center="-97, 38" zoom="5">
    <arcgis-search 
      position="top-right"
    />
    <arcgis-zoom 
      position="top-right" 
      layout="vertical" 
      referenceElement={mapContainer}
    />
    <arcgis-scale-bar
      position="bottom-left"
      bar-style="line"
      unit="dual"
    />
    <arcgis-coordinate-conversion
      position="bottom-left"
      mode="live"
      orientation="auto"
      hide-capture-button
      hide-expand-button
      hide-input-button
      hide-settings-button
      multiple-conversions-disabled
      storage-disabled
    />
  </arcgis-map>
  <calcite-shell-panel
    component-id="shell-panel-start"
    slot="panel-start"
    position="start"
    id="shell-panel-start"
  >
    <calcite-action-bar 
      expand-disabled 
      id="left-action-bar" 
      hidden
      slot="action-bar" 
      role="menu" 
      tabindex="-1"
      bind:this={leftActionBar}
    >
      <calcite-action
        tabindex="-1"
        role="button"
        data-action-id="national"
        text="national"
        icon="globe"
        active
        on:click={handleCatalogActionClick}
        on:keypress={handleCatalogActionClick}
      />
      <calcite-action
        tabindex="-1"
        role="button"  
        data-action-id="climate-data-viewer-2"
        text="climate-data-viewer"
        icon="clock-forward"
        on:click={handleCatalogActionClick}
        on:keypress={handleCatalogActionClick}
      />
      <calcite-action
        tabindex="-1"
        role="button"
        data-action-id="add-data"
        text="add-data"
        icon="add-layer"
        on:click={handleCatalogActionClick}
        on:keypress={handleCatalogActionClick}
      />
      <calcite-action
        slot="actions-end"
        tabindex="-1"
        role="button"
        data-action-id="expand"
        data-testid="data-catalog-expand"
        icon="chevrons-right"
        text="open data catalog"
        on:click={handleExpandClick}
        on:keypress={handleExpandClick}
      />
    </calcite-action-bar>
    <DataCatalog view={mapContainer}/>
  </calcite-shell-panel>
  <slot></slot>
  <Modal />
  <calcite-shell-panel
    component-id="shell-panel-end"
    slot="panel-end"
    display-mode="docked"
    collapsed
    position='end'
    width-scale="m"
  >
  <calcite-action-bar 
    expand-disabled 
    role="menu" 
    tabindex="-1" 
    slot="action-bar"
    on:click={handleOtherActionBarClick} 
    on:keypress={handleOtherActionBarClick}
  >
    <calcite-action data-action-id="layers" icon="layers" text="Active Layer List" />
    <calcite-action
      data-action-id="basemaps"
      icon="basemap"
      text="Basemaps"
    />
  </calcite-action-bar>
  <calcite-panel
    heading="Active Layer List"
    height-scale="l"
    data-panel-id="layers"
    hidden
  >
    <arcgis-layer-list
      dragEnabled
      visibility-appearance="checkbox"
      show-errors
      id="layers-container"
      referenceElement={mapContainer}
      bind:this={layerListContainer}
      listItemCreatedFunction={listItemCreatedFunction}
      on:arcgisTriggerAction={layerListAction}
    />
  </calcite-panel>
  <calcite-panel
    heading="Basemaps"
    height-scale="l"
    data-panel-id="basemaps"
    hidden
    closed
  >
    <arcgis-basemap-gallery
      id="basemaps-container"
      bind:this={bmgContainer}
      referenceElement={mapContainer}
    />
  </calcite-panel>
  <SummarizeMyArea /> 
  </calcite-shell-panel>
  <calcite-shell-panel
    slot="panel-bottom" 
    layout="horizontal" 
    position="end" 
    id="shell-panel-table"
    collapsed
  >
  <calcite-panel closable class="fTable" id="panel-start" on:calcitePanelClose={closeShellElement}>
    <div id="fTable-container" bind:this={fTableContainer} />
  </calcite-panel>
  </calcite-shell-panel>
</calcite-shell>

<style>
  calcite-panel.fTable {
    height: 500px
  }

  calcite-shell-panel {
    --calcite-shell-panel-min-width: 340px;
  }

  calcite-navigation {
    --calcite-navigation-background-color: #005ea2;
    --calcite-color-text-1: white;
    --calcite-color-foreground-2: none;
    --calcite-color-foreground-3: none;
  }

  calcite-action-bar {
    --calcite-ui-focus-color: none !important;
  }

  #linkbtns {
    --calcite-color-brand-hover: none: !important;
    --calcite-color-brand-press: none: !important
  }

  #linkbtns:hover{
    --calcite-chip-text-color: rgb(236, 235, 235);
    --calcite-chip-background-color:#024f86;
  }

</style>
