<script lang="ts">
    // Import calcite components
    import '@esri/calcite-components/dist/components/calcite-alert';
    import { alerts } from '../store';
</script>

<calcite-alert bind:this={$alerts.mapAlert} placement="top" icon="exclamation-mark-triangle" label="An error alert" id="example-alert">
    <div bind:this={$alerts.alertTitle} id="alert-title" slot="title">An error occurred.</div>
    <div bind:this={$alerts.alertMessage} id="alert-message" slot="message">This layer is not responding.</div>
</calcite-alert>
