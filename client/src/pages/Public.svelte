<script>
  // Import arcgis js api
  import config from "@arcgis/core/config";

  import AppShell from "src/components/AppShell.svelte";

  config.apiKey = import.meta.env.VITE_API_KEY;
</script>

<AppShell />