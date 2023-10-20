<script>
  import config from "@arcgis/core/config";
  import Map from "@arcgis/core/Map";
  import MapView from "@arcgis/core/views/MapView";
  import LayerList from "@arcgis/core/widgets/LayerList";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";



  import { onMount } from "svelte";
  import AppShell from "./components/AppShell.svelte";

  import { viewState, mapState } from "./store";  

  config.apiKey = import.meta.env.VITE_API_KEY;

  let viewContainer;

  onMount(() => {

    const map = new Map({
      basemap: "arcgis-topographic",
    });

    console.log('map:', map);

    const view = new MapView({
      container: viewContainer,
      map, 
      center: [ -97, 38 ],          // The center of the map as lon/lat
      zoom: 5,                      // Sets the zoom level of detail (LOD) to 13
      padding: {
        left: 49
      }
    });

    view.ui.move("zoom", "top-right");  // Map widget

    $viewState.view = view;
    $mapState.map = map
    console.log(map)

    // view.whenLayerView(layer).then(() => {
    //   const multidimInfo = layer.multidimensionalInfo;
    //   console.log('layer: ', multidimInfo);
      
    // })

    // points to the states layer in a service storing U.S. census data
    const fl = new FeatureLayer({
      url: "https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/Maximumcommonbirdspeciesinsteepdecline/FeatureServer/0",
      title: "Maximum common bird species in steep decline"
    });
    //map.add(fl);  // adds the layer to the map
    
    // map.when(() => {

    //   $state.item = map
    // });

    

  });

</script>

<AppShell>
  <div class="viewDiv" bind:this={viewContainer} />
</AppShell>

<style>
  .viewDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }
</style>