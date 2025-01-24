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

  // Import components and store
  import { viewState, catalog, activeWidget } from "src/store.ts";
  import SummarizeMyArea from "src/components/SummarizeMyArea.svelte";
  import DataCatalog from "src/components/DataCatalog/DataList.svelte";
  import Modal from "src/components/Modal.svelte";

  let bmgContainer;
  let layerListContainer;

  let view;
  let loaded = true;

  catalog.subscribe;

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
      dragEnabled: true,
      container: layerListContainer,
      visibilityAppearance: "checkbox",
      listItemCreatedFunction: (e) => {
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
        }
      },
    });

    layerList.on("trigger-action", (e) => {
      const id = e.action.id;
      if (id === "trash") {
        view.map.remove(e.item.layer);
        // Find and Remove the identically named tile layer, if it exists
        const foundLyr = view.map.allLayers.find(function(layer) {
          return layer.title === e.item.title;
        });
        if (foundLyr != undefined) {
          view.map.remove(foundLyr);
        };         
      } else if (id === 'inc-transparency') {
        e.item.layer.opacity += .1
      } else if (id === 'dec-transparency') {
        e.item.layer.opacity -= .1
      }
    });
  }

  const handleExpandClick = () => {
    let bar = document.getElementById("left-action-bar");
    let panel = document.getElementById("data-catalog");
    let shell = document.getElementById("shell-panel-start");
    bar.setAttribute("hidden", "");
    panel.removeAttribute("hidden");
    panel.setAttribute("open", "");
    shell.removeAttribute("collapsed")
  }

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

  const openModal = function () {
    const button = document.getElementById("example-button");
    const modal = document.getElementById("example-modal");

    button?.addEventListener("click", function () {
      modal.open = !modal.open;
      console.log(modal);
    });
  };

  export const handleBasemapPanelClose = function (e) {
    const target = e.target;
    const shellElement = target.parentElement;
    shellElement.collapsed = !shellElement.collapsed;
    document.querySelector('[data-action-id="basemaps"]').active = false;
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
    position='start'
    width-scale="m"
    id="shell-panel-start"
  >
    <calcite-action-bar 
      expand-disabled 
      id="left-action-bar" 
      hidden
      slot="action-bar" 
      role="menu" 
      tabindex="-1" 
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
        data-action-id="subnational"
        data-testid="subnational-sidebar-action"
        text="subnational"
        icon="urban-model"
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
    <DataCatalog view={$viewState.view}/>
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
  <calcite-action-bar expand-disabled role="menu" tabindex="-1" slot="action-bar" on:click={handleOtherActionBarClick} on:keypress={handleOtherActionBarClick}>
    <calcite-action data-action-id="layers" icon="layers" text="Layers" />
    <calcite-action
      data-action-id="basemaps"
      icon="basemap"
      text="Basemaps"
    />
    <calcite-action
      tabindex="-1"
      role="button"
      data-action-id="summarize-my-area"
      icon="sigma"
      text="Summarize My Area"
    />
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
  <SummarizeMyArea /> 
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

  calcite-action-bar {
    --calcite-ui-focus-color: none !important;
  }
</style>
