<script>
  // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-panel";
  import "@esri/calcite-components/dist/components/calcite-tile-select-group";
  import "@esri/calcite-components/dist/components/calcite-tile-select";
  import "@esri/calcite-components/dist/components/calcite-slider";
  import "@esri/calcite-components/dist/components/calcite-fab";
  import "@esri/calcite-components/dist/components/calcite-button";
  import "@esri/calcite-components/dist/components/calcite-segmented-control";
  import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
  import "@esri/calcite-components/dist/components/calcite-list";
  import "@esri/calcite-components/dist/components/calcite-list-item";
  import "@esri/calcite-components/dist/components/calcite-tabs";
  import "@esri/calcite-components/dist/components/calcite-tab";
  import "@esri/calcite-components/dist/components/calcite-tab-nav";
  import "@esri/calcite-components/dist/components/calcite-tab-title";

  import Url from "src/components/AddData/Url.svelte";
  import Search from "src/components/AddData/Search.svelte";

  export let map;

  window.ea.addData = {};
  window.ea.addData.map = ()=>{return map};

  console.log();
</script>

<calcite-panel width-scale='l' heading="Add Data" data-panel-id="add-data" hidden>
    <calcite-tabs layout='center'>
      <calcite-tab-nav slot="title-group">
          <calcite-tab-title selected tab='url'>
              URL
          </calcite-tab-title>
          <calcite-tab-title tab='search'>Search</calcite-tab-title>
      </calcite-tab-nav>
      <calcite-tab selected tab='url'>
        <Url map={map}></Url>
      </calcite-tab>
      <calcite-tab tab='search'>
        <Search map={map}></Search>
    </calcite-tab>
  </calcite-tabs>
</calcite-panel>

<style>
    calcite-tab {
        padding: 1em;
    }

    #service-url-required, #search-term-required {
      --calcite-ui-icon-color: var(--calcite-ui-danger);
    }

</style>
