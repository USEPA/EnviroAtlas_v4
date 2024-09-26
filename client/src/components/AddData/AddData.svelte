<script>
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

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
    import "@esri/calcite-components/dist/components/calcite-list-item"
    import "@esri/calcite-components/dist/components/calcite-input-text";
  import "@esri/calcite-components/dist/components/calcite-tabs";
  import "@esri/calcite-components/dist/components/calcite-tab";
  import "@esri/calcite-components/dist/components/calcite-tab-nav";
  import "@esri/calcite-components/dist/components/calcite-tab-title";
  import "@esri/calcite-components/dist/components/calcite-action";
  import "@esri/calcite-components/dist/components/calcite-tooltip";


    import { mapState } from "src/store";

    export let map;

    let url;
    let searchTerm;
    let layers = {url:{},search:{}};

    window.ea.addData = {};
    window.ea.addData.url = function(_url) {
        if (arguments.length) url=_url;
        return url;
    };
    window.ea.addData.map = ()=>{return map};

    function addUrl() {
        if (layers.url[url]) {
            map.remove(layers.url[url]);
        };

        const feature = new FeatureLayer({
          url,
//          title: url
        });
        layers.url[url] = feature;
        map.add(feature);  // adds the layer to the map
    }

    function search() {
        alert("search not enabled yet: " + searchTerm);
    }
</script>




<calcite-panel width-scale='l' data-panel-id="add-data-2" hidden>
    <calcite-tabs layout='center'>
      <calcite-tab-nav slot="title-group">
          <calcite-tab-title selected tab='url'>
              URL
          </calcite-tab-title>
          <calcite-tab-title tab='search'>Search</calcite-tab-title>
      </calcite-tab-nav>
      <calcite-tab selected tab='url'>
        <calcite-label scale="m" layout="inline">
           <strong>Service URL</strong>
           <calcite-icon id="service-url-required" icon="bullet-point" scale="s"></calcite-icon>
            <calcite-tooltip reference-element="service-url-required">Required</calcite-tooltip>
        </calcite-label>
            <calcite-input-text required="true" placeholder="Enter service url" scale="m" on:calciteInputTextChange={function(e){url=e.target.value}} value={url}>
                <calcite-button slot="action" scale="m" on:click={()=>{addUrl()}}>Add</calcite-button>
            </calcite-input-text>

      </calcite-tab>
      <calcite-tab tab='search'>
        <calcite-label scale="m" layout="inline">
           <strong>Search</strong>
           <calcite-icon id="search-term-required" icon="bullet-point" scale="s"></calcite-icon>
            <calcite-tooltip reference-element="search-term-required">Required</calcite-tooltip>
        </calcite-label>
        <calcite-input-text required="true" placeholder="Enter search terms" scale="m" on:calciteInputTextChange={function(e){searchTerm=e.target.value}} value={searchTerm}>
            <calcite-button slot="action" scale="m" on:click={()=>{search()}} icon-start="search" ></calcite-button>
        </calcite-input-text>
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
