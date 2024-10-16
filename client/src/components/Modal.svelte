<script lang="ts">
  // Import calcite components
  import '@esri/calcite-components/dist/components/calcite-label';
  import '@esri/calcite-components/dist/components/calcite-chip-group';
  import '@esri/calcite-components/dist/components/calcite-chip';
  import '@esri/calcite-components/dist/components/calcite-modal';
  import '@esri/calcite-components/dist/components/calcite-button';
  import '@esri/calcite-components/dist/components/calcite-notice';
  import '@esri/calcite-components/dist/components/calcite-card';
</script>

<calcite-modal aria-labelledby="modal-title" id="example-modal" scale='s'>
    <div slot="header" id="modal-title">
      Explore EnviroAtlas
    </div>
    <div id='modal-content' slot="content">
      <calcite-card>
        <img slot="thumbnail" alt="EA Communities" src='/ea/client/images/EACommunities.png'>
        <span slot="title">EnviroAtlas Communities</span>
        <span slot="subtitle">This tool focuses the interactive map display on an EnviroAtlas community selected by the user. The tool zooms the map to the community and tailors community-level map layers to represent only the selected community.
        </span>
        <div slot="footer-start" id="example-slotted-footer">
            <calcite-chip id="badge-1" value="calcite chip" icon="information" scale="s"></calcite-chip>
            <calcite-chip id="badge-2" value="calcite chip" icon="launch" scale="s"></calcite-chip>
        </div>
        <div slot="footer-end">
            <calcite-action scale="s" icon="ellipsis" id="example-slotted-action"></calcite-action>
        </div>
      </calcite-card>
      <calcite-card>
        <img slot="thumbnail" alt="EA Climate" src='/ea/client/images/EAClimate.png'>
        <span slot="title">EnviroAtlas Climate Viewer</span>
        <span slot="subtitle">This tool allows for exploration of modeled future climate scenarios. User selections for each variable control the climate scenario displayed.
        </span>
        <div slot="footer-start" id="example-slotted-footer">
            <calcite-chip id="badge-1" value="calcite chip" icon="information" scale="s"></calcite-chip>
            <calcite-chip id="badge-2" value="calcite chip" icon="launch" scale="s"></calcite-chip>
        </div>
        <div slot="footer-end">
            <calcite-action scale="s" icon="ellipsis" id="example-slotted-action"></calcite-action>
        </div>
      </calcite-card>
      <calcite-card>
        <img slot="thumbnail" alt="EA Compare My Area" src='/ea/client/images/EACompareMyArea.png'>
        <span slot="title">EnviroAtlas Compare My Area</span>
        <span slot="subtitle">This tool allows users to obtain a report that details characteristics about a location selected in the EnviroAtlas interactive map.
        </span>
        <div slot="footer-start" id="example-slotted-footer">
            <calcite-chip id="badge-1" value="calcite chip" icon="information" scale="s"></calcite-chip>
            <calcite-chip id="badge-2" value="calcite chip" icon="launch" scale="s"></calcite-chip>
        </div>
        <div slot="footer-end">
            <calcite-action scale="s" icon="ellipsis" id="example-slotted-action"></calcite-action>
        </div>
      </calcite-card>
        <calcite-tooltip reference-element="badge-1">Information</calcite-tooltip>
        <calcite-tooltip reference-element="badge-2">Launch</calcite-tooltip>
      <calcite-card>
        <img slot="thumbnail" alt="EA Huc 12 Nav" src='/ea/client/images/EAHuc12Nav.png'>
        <span slot="title">EnviroAtlas HUC 12 Navigator</span>
        <span slot="subtitle"></span>
        <calcite-chip slot="footer-start" value="calcite chip" kind="brand" icon="information">
            Details
        </calcite-chip>
        <calcite-chip slot="footer-end" value="calcite chip" icon="launch">
            Launch
        </calcite-chip>
      </calcite-card>
      <calcite-card>
        <img slot="thumbnail" alt="EA Raindrop" src='/ea/client/images/EARaindrop.png'>
        <span slot="title">EnviroAtlas Raindrop</span>
        <span slot="subtitle"></span>
        <calcite-chip slot="footer-start" value="calcite chip" kind="brand" icon="information">
            Details
        </calcite-chip>
        <calcite-chip slot="footer-end" value="calcite chip" icon="launch">
            Launch
        </calcite-chip>
      </calcite-card>
      <calcite-card>
        <img slot="thumbnail" alt="EA Summarize My Area" src='/ea/client/images/EASummMyArea.png'>
        <span slot="title">EnviroAtlas Summarize My Area</span>
        <span slot="subtitle"></span>
        <calcite-chip slot="footer-start" value="calcite chip" kind="brand" icon="information">
            Details
        </calcite-chip>
        <calcite-chip slot="footer-end" value="calcite chip" icon="launch">
            Launch
        </calcite-chip>
      </calcite-card>
    </div>
</calcite-modal>

<style>
  calcite-modal {
    --calcite-modal-scrim-background: rgba(83, 83, 83, 0.75);
  }

  #modal-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
</style>