<script>
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

    // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-label";
  import "@esri/calcite-components/dist/components/calcite-input-text";
  import "@esri/calcite-components/dist/components/calcite-icon";
  import "@esri/calcite-components/dist/components/calcite-tooltip";

  export let map;

  let searchTerm;
  let layers = {};

  function search() {
    alert("search not enabled yet: " + searchTerm);
  }
</script>

<calcite-label scale="m" layout="inline">
   <strong>Search</strong>
   <calcite-icon id="search-term-required" class='required' icon="bullet-point" scale="s"></calcite-icon>
   <calcite-tooltip reference-element="search-term-required">Required</calcite-tooltip>
</calcite-label>
<calcite-input-text required="true" placeholder="Enter search terms" scale="m" on:calciteInputTextChange={function(e){searchTerm=e.target.value}} value={searchTerm}>
    <calcite-button slot="action" scale="m" on:click={()=>{search()}} icon-start="search" ></calcite-button>
</calcite-input-text>

<style>
    calcite-icon.required {
      --calcite-ui-icon-color: var(--calcite-ui-danger);
    }
</style>
