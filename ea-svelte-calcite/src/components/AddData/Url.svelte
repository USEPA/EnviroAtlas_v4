<script>
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

    // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-label";
  import "@esri/calcite-components/dist/components/calcite-input-text";
  import "@esri/calcite-components/dist/components/calcite-icon";
  import "@esri/calcite-components/dist/components/calcite-tooltip";

  export let map;

  let url;
  let layers={};

  window.ea.addData.url = function(_url) {
    if (arguments.length) url=_url;
        return url;
  };

  function addUrl() {
    console.log();
    if (layers[url]) {
        map.remove(layers[url]);
    };

    const feature = new FeatureLayer({
          url,
//          title: url
        });
        layers[url] = feature;
        map.add(feature);  // adds the layer to the map
    }

</script>

<calcite-label scale="m" layout="inline">
   <strong>Service URL</strong>
   <calcite-icon id="service-url-required" class='required' icon="bullet-point" scale="s"></calcite-icon>
    <calcite-tooltip reference-element="service-url-required">Required</calcite-tooltip>
</calcite-label>
<calcite-input-text required="true" placeholder="Enter service url" scale="m" on:calciteInputTextChange={function(e){url=e.target.value}} value={url}>
    <calcite-button slot="action" scale="m" on:click={()=>{addUrl()}}>Add</calcite-button>
</calcite-input-text>


<style>
    calcite-icon.required {
      --calcite-ui-icon-color: var(--calcite-ui-danger);
    }
</style>
