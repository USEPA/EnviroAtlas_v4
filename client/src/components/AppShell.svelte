<script>
  // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-shell";
  import "@esri/calcite-components/dist/components/calcite-shell-panel";
  import "@esri/calcite-components/dist/components/calcite-action";
  import "@esri/calcite-components/dist/components/calcite-action-bar";
  import "@esri/calcite-components/dist/components/calcite-panel";
  import "@esri/calcite-components/dist/components/calcite-navigation";
  import "@esri/calcite-components/dist/components/calcite-navigation-logo";
  import "@esri/calcite-components/dist/components/calcite-chip";
  import "@esri/calcite-components/dist/components/calcite-chip-group";

  // Import arcgis js api
  import esriConfig from "@arcgis/core/config.js";  
  import Basemap from "@arcgis/core/Basemap.js";
  import PortalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource.js";
  import Portal from "@arcgis/core/portal/Portal.js";
  import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
  //import FeatureTable from "@arcgis/core/widgets/FeatureTable";

  import "@arcgis/map-components/components/arcgis-scale-bar";
  import "@arcgis/map-components/components/arcgis-map";
  import "@arcgis/map-components/components/arcgis-basemap-gallery";
  import "@arcgis/map-components/components/arcgis-coordinate-conversion";
  import "@arcgis/map-components/components/arcgis-layer-list";
  import "@arcgis/map-components/components/arcgis-zoom";
  import "@arcgis/map-components/components/arcgis-search";
  import "@arcgis/map-components/components/arcgis-sketch";
  import "@arcgis/map-components/components/arcgis-features";
  import "@arcgis/map-components/components/arcgis-legend";
  import "@arcgis/map-components/components/arcgis-area-measurement-2d";

  // Import components and store
  import { catalog, activeWidget } from "src/store.ts";
  import SummarizeMyArea from "src/components/SummarizeMyArea.svelte";
  import DataCatalog from "src/components/DataCatalog/DataList.svelte";
  import Modal from "src/components/Modal.svelte";

  let view;
  let bmgContainer;
  let layerListContainer;
  let fTableContainer;
  let leftActionBar;

  esriConfig.portalUrl = "https://epa.maps.arcgis.com/";

  const portalBasemapsSource = new PortalBasemapsSource({
    query: { id: "472046c429254aa093dcb4953d09de0d"},
    portal: new Portal({
      authMode: "no-prompt",
      url: "https://epa.maps.arcgis.com/"
    })
  })

  const basemap = new Basemap({
    portalItem: {
      id: "7a4aa667d61541c583d9a723c8b349da"
    }
  })

  catalog.subscribe;

  const actionsDict = {
    "national": "globe", 
    "time-series-viewer": "clock-forward", 
    "add-data": "add-layer"
  }
  async function setupPopup() {
    reactiveUtils.on(
      () => view,
      "arcgisViewClick",
      async (event) => {
        view.popup ={
          dockEnabled: true, 
          dockOptions: {
            position: "top-right",
            breakpoint: false
          }
        }
      }
    );
  }

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

  /**
   * The on:click function for the left side action bar.
   * Expands the shell panel, and hides or shows the selected 
   * action's panel. Also, sets the catalog.type store value to
   * selected action's id, which controls many parts of the app. 
   * @param target html element
   */
  const handleCatalogActionClick = ({ target }) => {
    handleExpandClick();
    const nextDataCatalog = target.dataset.actionId;
    if (nextDataCatalog !== $catalog.type) {
      document.querySelector(`[data-panel-id=${$catalog.type}]`).setAttribute("hidden", "");
      document.querySelector(`[data-panel-id=${nextDataCatalog}]`).removeAttribute("hidden");
      $catalog.type = nextDataCatalog;
    }
  };

  const handleOtherActionBarClick = ({ target }) => {
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
      heading="Interactive Map"
      thumbnail="/ea/client/images/logo.png"
      href="https://www.epa.gov/enviroatlas"
      target="_blank"
    ></calcite-navigation-logo>
    <calcite-chip-group slot="content-end" expanded>
      {#each [
        {label:'Help', icon:'question'},
        {label:'Data Download', icon:'download-to', link:'https://www.epa.gov/enviroatlas/forms/enviroatlas-data-download'}, 
        {label:'Contact Us', icon:'envelope', link:'https://www.epa.gov/enviroatlas/forms/contact-us-about-enviroatlas'}
        ] as link}
        <calcite-button scale="s" target="_blank" id='linkbtns' href={link.link}>
          <calcite-chip icon={link.icon} scale="m">{link.label}</calcite-chip>
        </calcite-button>
        {/each}
    </calcite-chip-group>
  </calcite-navigation>
  <arcgis-map bind:this={view} basemap={basemap} center="-97, 38" zoom="5" 
    on:arcgisViewReadyChange={setupPopup}
    >
    <arcgis-search 
      position="top-right"
    />
    <arcgis-zoom 
      position="top-right" 
      layout="vertical" 
      referenceElement={view}
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
    {#each Object.entries(actionsDict) as [action, icon]}
      <calcite-action
        tabindex="-1"
        role="button"
        data-action-id={action}
        text={action}
        icon={icon}
        active={action == $catalog.type}
        on:click={handleCatalogActionClick}
        on:keypress={handleCatalogActionClick}
      />
    {/each}
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
    <DataCatalog view={view}/>
  </calcite-shell-panel>
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
    <calcite-action 
      data-action-id="layers" 
      icon="layers" 
      text="Active Layer List"
    />
    <calcite-action
      data-action-id="basemaps"
      icon="basemap"
      text="Basemaps"
    />
    <calcite-action
      data-action-id="maptools"
      icon="system-management"
      text="Other Map Tools"
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
      referenceElement={view}
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
      referenceElement={view}
      source={portalBasemapsSource}
    />
  </calcite-panel>
    <calcite-panel
    heading="Other Map Tools"
    height-scale="l"
    data-panel-id="maptools"
    hidden
    closed
  >
    <calcite-block collapsible expanded heading="Sketch" label="Sketch">
      <arcgis-sketch
        position="manual"
        referenceElement={view}
        layout="horizontal"
      />
    </calcite-block>
    <calcite-block collapsible expanded heading="Measure" label="Measure">
      <arcgis-area-measurement-2d
        referenceElement={view}
      />
    </calcite-block>
    <calcite-block collapsible expanded heading="Legend" label="Legend">
      <arcgis-legend
        referenceElement={view}
      />
    </calcite-block>
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
    --calcite-shell-panel-min-width: 420px;
  }

  calcite-navigation {
    --calcite-navigation-background-color: #162e51;
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
