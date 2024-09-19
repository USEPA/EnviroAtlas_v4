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
  import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
  import LayerList from "@arcgis/core/widgets/LayerList";
  import Legend from "@arcgis/core/widgets/Legend";

  // Import components and store
  import { viewState, mapState } from "../store";
  import SummarizeMyArea from "./SummarizeMyArea.svelte";
  import ClimateChangeViewer from "./ClimateChangeViewer/ClimateChangeViewer.svelte";
  import DataCatalog from "./DataCatalog/DataList.svelte";
  //    import AddData from "./AddData/index.svelte";
  //use npm published version now (in development used linked version via devLink utility
  import AddData from "@usepa-ngst/calcite-components/AddData/index.svelte";
  import Modal from "./Modal.svelte";

  let bmgContainer;
  let layerListContainer;
  let legendContainer;

  let item = {};
  let view;
  let loaded = true;

  viewState.subscribe((value) => {
    view = value.view;
    console.log(view);
    if (view && loaded) {
      // do something
      initWidgets();
    }
  });

  function initWidgets() {
    console.log("widgets initialized");
    const basemaps = new BasemapGallery({
      view,
      container: bmgContainer,
    });

    const layerList = new LayerList({
      view,
      container: layerListContainer,
    });

    const legend = new Legend({
      view,
      container: legendContainer,
    });
  }

  let activeWidgetLeft;

  const handleActionBarClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    if (activeWidgetLeft) {
      document.querySelector(`[data-action-id=${activeWidgetLeft}]`).active = false;
      document.querySelector(`[data-panel-id=${activeWidgetLeft}]`).hidden = true;
      document.querySelector(`[data-panel-id=${activeWidgetLeft}]`).closed = true;
      document.querySelector(`[component-id="shell-panel-start"]`).collapsed = true;
      console.log(activeWidgetLeft);
    }

    const nextWidgetLeft = target.dataset.actionId;
    if (nextWidgetLeft !== activeWidgetLeft) {
      // these need to reference calcite components
      // give the widgets their own varibale
      document.querySelector(`[data-action-id=${nextWidgetLeft}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidgetLeft}]`).hidden = false;
      document.querySelector(`[data-panel-id=${nextWidgetLeft}]`).closed = false;
      document.querySelector(`[component-id="shell-panel-start"]`).collapsed = false;
      activeWidgetLeft = nextWidgetLeft;
      console.log(activeWidgetLeft);
    } else {
      activeWidgetLeft = null;
    }
  };

  let activeWidgetRight;

  const handleOtherActionBarClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    if (activeWidgetRight) {
      document.querySelector(`[data-action-id=${activeWidgetRight}]`).active = false;
      document.querySelector(`[data-panel-id=${activeWidgetRight}]`).hidden = true;
      document.querySelector(`[data-panel-id=${activeWidgetRight}]`).closed = true;
      document.querySelector(`[component-id="shell-panel-end"]`).collapsed = true;
      console.log(activeWidgetRight);
    }

    const nextWidgetRight = target.dataset.actionId;
    if (nextWidgetRight !== activeWidgetRight) {
      // these need to reference calcite components
      // give the widgets their own varibale
      document.querySelector(`[data-action-id=${nextWidgetRight}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).hidden = false;
      document.querySelector(`[data-panel-id=${nextWidgetRight}]`).closed = false;
      document.querySelector(`[component-id="shell-panel-end"]`).collapsed = false;
      activeWidgetRight = nextWidgetRight;
      console.log(activeWidgetRight);
    } else {
      activeWidgetRight = null;
    }
  };

  const openModal = function () {
    const button = document.getElementById("example-button");
    const modal = document.getElementById("example-modal");

    button?.addEventListener("click", function () {
      modal.open = !modal.open;
      console.log(modal);
    });
  };

  export const handleBasemapPanelClose = function (ev) {
        const target = ev.target;
        const shellElement = target.parentElement;
        shellElement.collapsed = !shellElement.collapsed;
        document.querySelector('[data-action-id="basemaps"]').active = false;
        console.log(activeWidgetRight);
    };
</script>

<calcite-shell>
  <calcite-navigation id="header" slot="header" style="block-size: 3rem">
    <calcite-navigation-logo
      slot="content-start"
      heading="v4"
      thumbnail="/ea/client/images/logo.png"
    ></calcite-navigation-logo>
    <calcite-button
      slot="content-end"
      appearance="solid"
      scale="s"
      width="full"
      kind="brand"
      role="button"
      tabindex="-1"
      target="_blank"
      label="Open Apps"
      icon-start="collection"
      id="example-button"
      on:click={openModal}
      on:keypress={openModal}
    >
      Explore EnviroAtlas
    </calcite-button>
  </calcite-navigation>
  <calcite-shell-panel
    component-id="shell-panel-start"
    slot="panel-start"
    display-mode="docked"
    collapsed
    position='start'
    width-scale="m"
  >
    <calcite-action-bar slot="action-bar" on:click={handleActionBarClick} on:keypress={handleActionBarClick}>
      <calcite-action
        data-action-id="data-catalog"
        icon="layers"
        text="EnviroAtlas Data Catalog"
      />
      <calcite-action
        data-action-id="information"
        icon="information"
        text="Information"
      />
      <calcite-action
        data-action-id="summarize-my-area"
        icon="sigma"
        text="Summarize My Area"
      />
      <calcite-action
        data-action-id="climate-data-viewer"
        icon="clock-forward"
        text="Climate Change Data Viewer"
      />
      <calcite-action
        data-action-id="add-data"
        icon="plus-square"
        text="Add Data"
      />
    </calcite-action-bar>

    <DataCatalog />
    <calcite-panel heading="Information" data-panel-id="information" hidden>
      <div id="info-content"></div>
    </calcite-panel>
    <SummarizeMyArea />
    <ClimateChangeViewer view={$viewState.view}/>
    <AddData map={$mapState.map} />
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
  <calcite-action-bar slot="action-bar" on:click={handleOtherActionBarClick} on:keypress={handleOtherActionBarClick}>
    <calcite-action data-action-id="layers" icon="layers" text="Layers" />
      <calcite-action
      data-action-id="basemaps"
      icon="basemap"
      text="Basemaps"
    />
    <calcite-action data-action-id="legend" icon="legend" text="Legend" />
  </calcite-action-bar>

  <calcite-panel
    heading="Layers"
    height-scale="l"
    data-panel-id="layers"
    hidden
  >
    <div id="layers-container" bind:this={layerListContainer} />
  </calcite-panel>
  <calcite-panel
    heading="Basemaps"
    height-scale="l"
    data-panel-id="basemaps"
    hidden
    closable
    closed
    on:calcitePanelClose={handleBasemapPanelClose}
  >
    <div id="basemaps-container" bind:this={bmgContainer} />
  </calcite-panel>
  <calcite-panel
    heading="Legend"
    height-scale="l"
    data-panel-id="legend"
    hidden
  >
    <div id="legend-container" bind:this={legendContainer} />
  </calcite-panel>
  </calcite-shell-panel>
</calcite-shell>

<style>
  calcite-shell-panel {
    --calcite-shell-panel-min-width: 340px;
  }

  calcite-navigation {
    --calcite-navigation-background: #005ea2;
    --calcite-color-text-1: white;
    --calcite-color-foreground-2: none;
    --calcite-color-foreground-3: none;
  }

  #info-content {
    padding: 0.75rem;
  }
</style>
