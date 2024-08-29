import '/src/app.css';
import App from '/src/App.svelte';
import { setAssetPath } from '@esri/calcite-components/dist/components';
setAssetPath('https://js.arcgis.com/calcite-components/2.4.0/assets');

if (!window.ea ) window.ea = {};

const app = new App({
  target: document.getElementById('app'),
});

export default app;
