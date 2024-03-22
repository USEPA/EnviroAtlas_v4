import '/src/app.css';
import App from '/src/App.svelte';

if (!window.ea ) window.ea = {};

const app = new App({
  target: document.getElementById('app'),
});

export default app;
