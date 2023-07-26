<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-shell";
    import "@esri/calcite-components/dist/components/calcite-shell-panel";
    import "@esri/calcite-components/dist/components/calcite-action";
    import "@esri/calcite-components/dist/components/calcite-action-bar";
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-label";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-dropdown";
    import "@esri/calcite-components/dist/components/calcite-dropdown-item";
    import "@esri/calcite-components/dist/components/calcite-dropdown-group";
  
    // arcgis js api
    import Bookmarks from "@arcgis/core/widgets/Bookmarks";
    import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
    import LayerList from "@arcgis/core/widgets/LayerList";
    import Legend from "@arcgis/core/widgets/Legend";
    import Print from "@arcgis/core/widgets/Print";

  
    import { state } from "../store";
    import SummarizeMyArea from "./SummarizeMyArea.svelte";
    import MultidimTest from "./MultidimTest.svelte";
  
    let bookmarksContainer;
    let bmgContainer;
    let layerListContainer;
    let legendContainer;
    let printContainer;
  
    let item = {};
    let view;
    let loaded = true;
  
    state.subscribe((value) => {
      view = value.view;
      console.log(view)
      if (view && loaded) {
        // do something
        initWidgets();
      }
    });

    function initWidgets() {
      console.log("widgets initialized")
      const basemaps = new BasemapGallery({
        view,
        container: bmgContainer,
      });
  
      const bookmarks = new Bookmarks({
        view,
        container: bookmarksContainer,
      });
  
      const layerList = new LayerList({
        view,
        selectionEnabled: true,
        container: layerListContainer,
      });
  
      const legend = new Legend({
        view,
        container: legendContainer,
      });
  
      const print = new Print({
        view,
        container: printContainer,
      });
    };
  
    let activeWidget;
  
      const handleActionBarClick = ({ target }) => {
        if (target.tagName !== "CALCITE-ACTION") {
          return;
        }
  
        if (activeWidget) {
          // active and hidden aren't recognized as typed correctly...could use typescript to fix the errors
          document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
          document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
        }
  
        const nextWidget = target.dataset.actionId;
        if (nextWidget !== activeWidget) {
          // these need to reference calcite components
          // give the widgets their own varibale
          document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
          document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
          activeWidget = nextWidget;
        } else {
          activeWidget = null;
        }
      };

  </script>
  
  <calcite-shell content-behind>
    <h2 id="header-title" slot="header">
      {item.title || "EnviroAtlas TEST"}
    </h2>
    <calcite-shell-panel slot="panel-start" display-mode="overlay" detached>
      <calcite-action-bar slot="action-bar" on:click={handleActionBarClick}>
        <calcite-action data-action-id="layers" icon="layers" text="Layers" />
        <calcite-action
          data-action-id="basemaps"
          icon="basemap"
          text="Basemaps"
        />
        <calcite-action data-action-id="legend" icon="legend" text="Legend" />
        <calcite-action
          data-action-id="bookmarks"
          icon="bookmark"
          text="Bookmarks"
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
        data-action-id="multidim-test"
        icon="multidimensional-raster"
        text="Multidim Test"
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
      <calcite-panel
        heading="Bookmarks"
        height-scale="l"
        data-panel-id="bookmarks"
        hidden
      >
        <div id="bookmarks-container" bind:this={bookmarksContainer} />
      </calcite-panel>
      <calcite-panel heading="Details" data-panel-id="information" hidden>
        <div id="info-content">
          <h1>Hello {name}!</h1>
          <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
          <calcite-icon icon="banana" />
        </div>
      </calcite-panel>
      <SummarizeMyArea />
      <MultidimTest />
    </calcite-shell-panel>
    <slot></slot>
  </calcite-shell>
  
  
  <style>
    #header-title {
      margin-left: 1rem;
      margin-right: 1rem;
    }
  
    #info-content {
      padding: 0.75rem;
    }
  </style>
  