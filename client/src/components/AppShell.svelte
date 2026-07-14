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
  import "@arcgis/map-components/components/arcgis-distance-measurement-2d";
  import "@arcgis/map-components/components/arcgis-compass";
  import "@arcgis/map-components/components/arcgis-elevation-profile";

  // Import components and store
  import { catalog, activeWidget } from "src/store.ts";
  // use npm published version now (in development used linked version via devLink utility
  // import AddData from "@usepa-ngst/calcite-components/AddData/index.svelte";
  import AddData from "src/components/AddData/index.svelte";
  import DataCatalog from "src/components/DataCatalog/DataList.svelte";
  import Modal from "src/components/Modal.svelte";
  import SummarizeMyAreaResults from "src/components/SummarizeMyAreaResults.svelte";
  import Info from "src/components/Info.svelte";
  import Alert from '../components/Alert.svelte';
  import { openInfo } from "src/shared/utilities";

  let view;
  let bmgContainer;
  let layerListContainer;
  let fTableContainer;
  let leftActionBar;
  let map;
  let shellPanelEnd;
  let basemapsPanel;
  let mapToolsPanel;
  let layersPanel;
  let expandRight;
  let distance2d;
  let distance2dDiv;
  let area2d;
  let area2dDiv;
  let distanceAction;
  let areaAction;
  let clearAction;
  let activeDimension = "2d";
  let activeTool = null;

  $: {
    if (view && !map) {
        view.addEventListener("arcgisViewReadyChange", () => {
            map = view.map;
        });
    }
  }

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
    "sma": "mosaic-method-sum"
  }

  const elevProfile = [{type:"ground"}]

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
          },
          viewModel: {
            includeDefaultActions: false
          }
        }
      }
    );
  }

  function setTooltipOpt() {
    this.tooltipOptions = {enabled:true}
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
          // {
          //   title: "Show table",
          //   icon: "table",
          //   id: "table",
          // },
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
   * Expands the shell panel, adds or removes the tab active UI,
   * and hides or shows the selected action's panel. 
   * Also, sets the catalog.type store value to
   * selected action's id, which controls many parts of the app. 
   * @param target html element
   */
  const handleCatalogActionClick = ({ target }) => {
    handleExpandClick();
    let nextDataCatalog = target?.dataset.actionId;
    if (!nextDataCatalog) {
      nextDataCatalog = 'sma'
    }
    if (nextDataCatalog !== $catalog.type) {
      document.querySelector(`#catalog-button-${$catalog.type}`).style.borderBottom ="none"
      document.querySelector(`#catalog-button-${nextDataCatalog}`).style.borderBottom ="3px solid #162e51";

      document.querySelector(`[data-panel-id=${$catalog.type}]`).setAttribute("hidden", "");
      document.querySelector(`[data-panel-id=${nextDataCatalog}]`).removeAttribute("hidden");
      $catalog.type = nextDataCatalog;
    }
  };

  const handleOtherActionBarClick = ({ target }) => {
    if ($activeWidget.right === null) {
      $activeWidget.right = "layers"
    }
    let targetAction = document.querySelector(`[data-action-id=${$activeWidget.right}]`);
    let targetPanel = document.querySelector(`[data-panel-id=${$activeWidget.right}]`);
    let targetFab = document.querySelector(`[id=${$activeWidget.right}-fab]`);
    let targetShell = document.querySelector(`[component-id="shell-panel-end"]`);

    if (target.id === 'expand-right') {
      targetAction?.setAttribute("active", "");
      targetPanel.hidden = !targetPanel.hidden;
      targetPanel.removeAttribute("closed");
      targetShell.collapsed = !targetShell.collapsed;
      targetFab.hidden = !targetFab.hidden;
      expandRight.hidden = !expandRight.hidden;
      return
    }
    // Figure out what was clicked
    const nextWidgetRight = target.dataset.actionId;
    // If there's one already active, close things.
    if ($activeWidget.right) {
      if (nextWidgetRight === $activeWidget.right) {
        document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
        targetPanel.hidden = !targetPanel.hidden;
        targetPanel.removeAttribute("closed");
        targetShell.collapsed = !targetShell.collapsed;
        targetFab.hidden = !targetFab.hidden;
        expandRight.hidden = !expandRight.hidden;
      } else {
        document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = false;
        document.querySelector(`[data-panel-id=${$activeWidget.right}]`).hidden = true;
        document.querySelector(`[data-panel-id=${$activeWidget.right}]`).closed = true;
        document.querySelector(`[component-id="shell-panel-end"]`).collapsed = true;
        let fab = document.getElementById(`${$activeWidget.right}-fab`)
        if (fab) {
          fab.setAttribute("hidden", "");
        }
      }
    }

    // If there's a change, open things, and update store value to what was clicked
    if (nextWidgetRight && nextWidgetRight !== $activeWidget.right) {
      document.querySelector(`[data-action-id=${nextWidgetRight}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).hidden = false;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).closed = false;
      document.querySelector(`[component-id="shell-panel-end"]`).collapsed = false;
      document.querySelector(`[id=${nextWidgetRight}-fab]`).hidden = false;
      $activeWidget.right = nextWidgetRight;
      expandRight.hidden = true;
    }

    if ($activeWidget.right === 'sma-results') {
      let smaTarget = document.querySelector(`[data-action-id='sma']`)
      handleCatalogActionClick(smaTarget)
    }
  };

  const handleRightFabClick = (e) => {
    e.target.setAttribute("hidden", "");
    const panel = e.target.id.split('-')[0];
    if (panel === 'maptools') {
      document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
      mapToolsPanel.removeAttribute("open");
      mapToolsPanel.setAttribute("hidden", "");
    } else if (panel === 'basemaps') {
      document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
      basemapsPanel.removeAttribute("open");
      basemapsPanel.setAttribute("hidden", "");
    } else if (panel === 'layers') {
      document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = true;
      layersPanel.removeAttribute("open");
      layersPanel.setAttribute("hidden", "");
    }

    shellPanelEnd.setAttribute("collapsed", "");
    //document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = false;
    //$activeWidget.right = null;
    expandRight.hidden = false;
    console.log($activeWidget.right)
  };

  export const closeShellElement = function (e) {
    const target = e.target;
    const shellElement = target.parentElement;
    shellElement.collapsed = !shellElement.collapsed;
  };
  
  function setActionStates() {
    distanceAction.active = activeTool === "distance";
    areaAction.active = activeTool === "area";
  }

  function clearAllMeasurements() {
    distance2d.clear();
    area2d.clear();

    activeTool = null;
    hideAllToolUIs();
    setActionStates();
  }

  function hideAllToolUIs() {
    distance2dDiv.hidden = true;
    area2dDiv.hidden = true;
  }

  function startTool(toolName) {
    const toolElements = {
      "2d": {
        distance: distance2dDiv,
        area: area2dDiv,
      },
    };
    activeTool = toolName;

    const currentTools = toolElements[activeDimension];
    const toolToShow = currentTools[toolName];
    const toolToHide = currentTools[toolName === "distance" ? "area" : "distance"];

    toolToHide.hidden = true;
    toolToShow.hidden = false;
    if (activeTool === "area") { area2d.start()}
    if (activeTool === "distance") { distance2d.start()}

    setActionStates();
  }
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
        // {label:'Help', icon:'question'},
        {label:'Data Download', icon:'download-to', link:'https://www.epa.gov/enviroatlas/forms/enviroatlas-data-download'}, 
        {label:'Contact Us', icon:'envelope', link:'https://www.epa.gov/enviroatlas/forms/contact-us-about-enviroatlas'}
        ] as link}
        <calcite-button scale="s" target="_blank" id='linkbtns' href={link.link}>
          <calcite-chip icon={link.icon} scale="m">{link.label}</calcite-chip>
        </calcite-button>
        {/each}
    </calcite-chip-group>
  </calcite-navigation>
  <arcgis-map bind:this={view} basemap={basemap} center="-97, 38" zoom="5" ground="world-elevation"
    on:arcgisViewReadyChange={setupPopup}
    >
    <arcgis-search
      popupDisabled
      position="top-right"
    ></arcgis-search>
    <arcgis-zoom 
      position="top-right" 
      layout="vertical"
    ></arcgis-zoom>
    <arcgis-compass 
      position="top-right"
    ></arcgis-compass>
    <arcgis-scale-bar
      position="bottom-left"
      bar-style="line"
      unit="dual"
   ></arcgis-scale-bar>
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
   ></arcgis-coordinate-conversion>
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
        on:keydown={handleCatalogActionClick}
     ></calcite-action>
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
        on:keydown={handleExpandClick}
     ></calcite-action>
    </calcite-action-bar>
    <DataCatalog view={view}/>
  </calcite-shell-panel>
  <slot></slot>
  <Modal />
  <Alert />
  <Info />
  <calcite-shell-panel
    bind:this={shellPanelEnd}
    id="shell-panel-end"
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
    on:keydown={handleOtherActionBarClick}
  >
    <calcite-action
      data-action-id="sma-results"
      icon="mosaic-method-sum"
      text="Summarize My Area Results"
    ></calcite-action>
    <calcite-action 
      data-action-id="layers" 
      icon="layers" 
      text="Active Layer List"
   ></calcite-action>
    <calcite-action 
      data-action-id="add-data" 
      icon="add-layer"
      text="Add Data"
    ></calcite-action>
    <calcite-action
      data-action-id="maptools"
      icon="system-management"
      text="Other Map Tools"
    ></calcite-action>
    <calcite-action
      data-action-id="basemaps"
      icon="basemap"
      text="Basemaps"
    ></calcite-action>
    <calcite-action
      bind:this={expandRight}
      slot="actions-end"
      tabindex="-1"
      role="button"
      id="expand-right"
      icon="chevrons-left"
    ></calcite-action>
  </calcite-action-bar>
  <calcite-panel
    heading="Active Layer List"
    height-scale="l"
    data-panel-id="layers"
    hidden
    bind:this={layersPanel}
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
   ></arcgis-layer-list>
  </calcite-panel>
  <calcite-fab
    role="button"
    tabindex="-1"
    icon="chevrons-right"
    id="layers-fab"
    hidden
    on:click={handleRightFabClick}
    on:keydown={handleRightFabClick}
  ></calcite-fab>
  <calcite-panel
    heading="Basemaps"
    height-scale="l"
    data-panel-id="basemaps"
    hidden
    closed
    bind:this={basemapsPanel}
  >
    <arcgis-basemap-gallery
      id="basemaps-container"
      bind:this={bmgContainer}
      referenceElement={view}
      source={portalBasemapsSource}
   ></arcgis-basemap-gallery>
  </calcite-panel>
  <calcite-fab
    role="button"
    tabindex="-1"
    icon="chevrons-right"
    id="basemaps-fab"
    hidden
    on:click={handleRightFabClick}
    on:keydown={handleRightFabClick}
  ></calcite-fab>
  <calcite-panel
    heading="Other Map Tools"
    height-scale="l"
    data-panel-id="maptools"
    hidden
    closed
    bind:this={mapToolsPanel}
  >
    <calcite-block collapsible expanded heading="Sketch" label="Sketch">
      <calcite-action slot="control" text="Information" icon="question" on:click={() => openInfo("sketch")}></calcite-action>
      <arcgis-sketch
        style="display: flex; justify-content: center;"
        position="manual"
        referenceElement={view}
        layout="horizontal"
        on:arcgisReady={setTooltipOpt}
     ></arcgis-sketch>
    </calcite-block>
    <calcite-block collapsible expanded heading="Measure" label="Measure">
      <calcite-action slot="control" text="Information" icon="question" on:click={() => openInfo("measure")}></calcite-action>
      <calcite-action-bar id="toolbar" expand-disabled layout="horizontal">
        <calcite-action bind:this={distanceAction} id="distanceAction" text="Distance" icon="measure" on:click={() => startTool("distance")}></calcite-action>
        <calcite-action bind:this={areaAction} id="areaAction" text="Area" icon="polygon" on:click={() => startTool("area")}></calcite-action>
        <calcite-action bind:this={clearAction} id="clearAction" text="Clear" icon="trash" on:click={clearAllMeasurements}></calcite-action>
      </calcite-action-bar>
      <div bind:this={distance2dDiv} hidden>
        <arcgis-distance-measurement-2d
          referenceElement={view}
          id="distance2d"
          bind:this={distance2d}
        ></arcgis-distance-measurement-2d>
        </div>
        <div bind:this={area2dDiv} hidden>
        <arcgis-area-measurement-2d
          referenceElement={view}
          id="area2d"
          bind:this={area2d}
        ></arcgis-area-measurement-2d>
      </div>
    </calcite-block>
    <calcite-block collapsible expanded heading="Elevation Profile" label="Elevation Profile">
    <calcite-action slot="control" text="Information" icon="question" on:click={() => openInfo("elevation")}></calcite-action>
      <arcgis-elevation-profile profiles={elevProfile} referenceElement={view}>
      </arcgis-elevation-profile>
    </calcite-block>
    <calcite-block collapsible expanded heading="Legend" label="Legend">
      <arcgis-legend
        referenceElement={view}
     ></arcgis-legend>
  </calcite-block>
  </calcite-panel>
  <calcite-fab
    role="button"
    tabindex="-1"
    icon="chevrons-right"
    id="maptools-fab"
    hidden
    on:click={handleRightFabClick}
    on:keydown={handleRightFabClick}
  ></calcite-fab>
  <AddData view={view} />
  <SummarizeMyAreaResults />
  </calcite-shell-panel>
  <calcite-shell-panel
    slot="panel-bottom"
    layout="horizontal"
    position="end"
    id="shell-panel-table"
    collapsed
  >
  <calcite-panel closable class="fTable" id="panel-start" on:calcitePanelClose={closeShellElement}>
    <div id="fTable-container" bind:this={fTableContainer}></div>
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

  calcite-fab {
    place-content: center;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  calcite-block{
    margin-block:0.15em;
    --calcite-internal-block-padding-block:0px;
    --calcite-internal-block-padding-inline:0px
  }
</style>
