<script>
  // Import calcite components
  import "@esri/calcite-components/dist/components/calcite-input-text";

  export let map;

  let searchTerm;
  let layers = {};

  function search() {
    alert("search not enabled yet: " + searchTerm);
  }
</script>

<calcite-input-text required="true" placeholder="Enter search terms" scale="m" on:calciteInputTextChange={function(e){searchTerm=e.target.value}} value={searchTerm}>
    <calcite-button slot="action" scale="m" on:click={()=>{search()}} icon-start="search" ></calcite-button>
</calcite-input-text>

<style>
    calcite-icon.required {
      --calcite-ui-icon-color: var(--calcite-ui-danger);
    }
</style>
