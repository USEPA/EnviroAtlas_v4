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

  import {activeWidget} from "src/store.ts";

  export let view;

  let addDataPanel;
  let actionRefs = [];
  let activeAction = "search";

  const addDataActions = [
    {
      name: "Search",
      id: "search",
      label1: "Search",
    },
    {
      name: "URL",
      id: "url",
      label1: "URL",
    },
  ];

  window.ea.addData = {};
  window.ea.addData.view = () => {
    return view;
  };

  function handleAddDataActionClick(actionId = "search") {
    activeAction = actionId;
  }

  const handleFabClick = (e) => {
    e.target.setAttribute("hidden", "");
    let shell = document.getElementById("shell-panel-end");
    addDataPanel.removeAttribute("open");
    addDataPanel.setAttribute("hidden", "");
    shell.setAttribute("collapsed", "");
    document.querySelector(`[data-action-id=${$activeWidget.right}]`).active = false;
    $activeWidget.right = null;
  };
</script>

<calcite-panel
  bind:this={addDataPanel}
  width-scale="l"
  heading="Add Data"
  data-panel-id="add-data"
  hidden
>
  <div style="margin: 8px; display:flex; justify-content: space-around">
  {#each addDataActions as tab, i}
    <div
      bind:this={actionRefs[i]}
      on:click={() => handleAddDataActionClick(tab.id)}
      data-action-id={tab.id}
      id="catalog-buttom-{tab.id}"
      style={activeAction === tab.id ? "border-bottom:3px solid #162e51;" : "border-bottom: none"}
      class="add-data-button"
    >
                  <p style="line-height: 0.33em; margin: 0; padding-top:5px; padding-bottom: 8px">
                {tab.label1}
            </p>
    </div>
  {/each}
  </div>
  <Search {view} isHidden={activeAction !== "search"} />
  <Url {view} isHidden={activeAction !== "url"} />
</calcite-panel>
<calcite-fab
    role="button"
    tabindex="-1"
    id="add-data-fab"
    icon="chevrons-right"
    hidden
    on:click={handleFabClick}
    on:keydown={handleFabClick}
></calcite-fab>

<style>
  .add-data-button {
    width: 100%;
    margin: 0 20px;
    text-align: center;
    cursor: pointer;
  }

  calcite-fab {
    place-content: center;
    padding-top: 4px;
    padding-bottom: 4px;
  }
</style>
