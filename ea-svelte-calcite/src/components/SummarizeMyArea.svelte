<script>
    // Import calcite components
    import "@esri/calcite-components/dist/components/calcite-panel";
    import "@esri/calcite-components/dist/components/calcite-shell-panel";
    import "@esri/calcite-components/dist/components/calcite-action";
    import "@esri/calcite-components/dist/components/calcite-tab-nav";
    import "@esri/calcite-components/dist/components/calcite-tabs";
    import "@esri/calcite-components/dist/components/calcite-button";
    import "@esri/calcite-components/dist/components/calcite-tab-title";
    import "@esri/calcite-components/dist/components/calcite-block";
    import "@esri/calcite-components/dist/components/calcite-icon";
    import "@esri/calcite-components/dist/components/calcite-segmented-control";
    import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
    import "@esri/calcite-components/dist/components/calcite-combobox";
    import "@esri/calcite-components/dist/components/calcite-combobox-item";
    import "@esri/calcite-components/dist/components/calcite-notice";
    import "@esri/calcite-components/dist/components/calcite-input-number";

</script>

<calcite-panel heading="Summarize My Area" data-panel-id="summarize-my-area" hidden>
    <calcite-action icon="information" text="Favorite" slot="header-actions-start"></calcite-action>
    <calcite-action icon="reset" text-enabled text="Reset" slot="header-actions-end"></calcite-action>
    <calcite-button round width="half" slot="footer">
        Calculate
    </calcite-button>
    <calcite-tabs layout='center'>
      <calcite-tab-nav slot="title-group">
          <calcite-tab-title selected tab='selectionsTab'>
              Select Layer Area
          </calcite-tab-title>
          <calcite-tab-title tab='resultsTab'>Results</calcite-tab-title>
      </calcite-tab-nav>
      <calcite-tab selected tab='selectionsTab'>
        <calcite-block open heading="Select an indicator" description="Which data?">
            <calcite-icon scale="m" slot="icon" icon="number-circle-1"></calcite-icon>
            <calcite-segmented-control width="auto" scale='m'>
            <calcite-segmented-control-item checked value="Land Cover" ></calcite-segmented-control-item>
            <calcite-segmented-control-item value="Land Cover Change"></calcite-segmented-control-item>
            </calcite-segmented-control>
        <br>
            <calcite-label layout="inline">
                NLCD Year:  
                <calcite-combobox scale='m' placeholder-icon="calendar" placeholder=" Select one" selection-mode="single" max-items="0"
                    overlay-positioning="absolute">
                    <calcite-combobox-item value="2019" text-label="2019"></calcite-combobox-item>
                    <calcite-combobox-item value="2016" text-label="2016"></calcite-combobox-item>
                    <calcite-combobox-item value="2013" text-label="2013"></calcite-combobox-item>
                    <calcite-combobox-item value="2011" text-label="2011"></calcite-combobox-item>
                    <calcite-combobox-item value="2008" text-label="2008"></calcite-combobox-item>
                    <calcite-combobox-item value="2006" text-label="2006"></calcite-combobox-item>
                    <calcite-combobox-item value="2004" text-label="2004"></calcite-combobox-item>
                    <calcite-combobox-item value="2001" text-label="2001"></calcite-combobox-item>
                </calcite-combobox>
            </calcite-label>
            <calcite-label layout="inline">
                NLCD Year 1:  
                <calcite-combobox scale='m' placeholder-icon="calendar" placeholder=" Select one" selection-mode="single" max-items="0"
                    overlay-positioning="absolute">
                    <calcite-combobox-item value="2016" text-label="2016"></calcite-combobox-item>
                    <calcite-combobox-item value="2013" text-label="2013"></calcite-combobox-item>
                    <calcite-combobox-item value="2011" text-label="2011"></calcite-combobox-item>
                    <calcite-combobox-item value="2008" text-label="2008"></calcite-combobox-item>
                    <calcite-combobox-item value="2006" text-label="2006"></calcite-combobox-item>
                    <calcite-combobox-item value="2004" text-label="2004"></calcite-combobox-item>
                    <calcite-combobox-item value="2001" text-label="2001"></calcite-combobox-item>
                </calcite-combobox>
            </calcite-label>
            <calcite-label layout="inline">
                NLCD Year 2:  
                <calcite-combobox scale='m' placeholder-icon="calendar" placeholder=" Select one" selection-mode="single" max-items="0"
                    overlay-positioning="absolute">
                    <calcite-combobox-item value="2019" text-label="2019"></calcite-combobox-item>
                    <calcite-combobox-item value="2016" text-label="2016"></calcite-combobox-item>
                    <calcite-combobox-item value="2013" text-label="2013"></calcite-combobox-item>
                    <calcite-combobox-item value="2011" text-label="2011"></calcite-combobox-item>
                    <calcite-combobox-item value="2008" text-label="2008"></calcite-combobox-item>
                    <calcite-combobox-item value="2006" text-label="2006"></calcite-combobox-item>
                    <calcite-combobox-item value="2004" text-label="2004"></calcite-combobox-item>
                    <calcite-combobox-item value="2001" text-label="2001"></calcite-combobox-item>
                </calcite-combobox>
            </calcite-label>
        </calcite-block>
        <calcite-block open heading="Select a summary unit" description="Which unit?">
            <calcite-icon scale="m" slot="icon" icon="number-circle-2"></calcite-icon>
            <calcite-label layout="inline">
                <calcite-combobox  scale='m' placeholder-icon="calendar" placeholder=" Select one" selection-mode="single" max-items="0"
                    overlay-positioning="absolute">
                    <calcite-combobox-item value="County" text-label="County"></calcite-combobox-item>
                    <calcite-combobox-item value="Congressional District" text-label="Congressional District"></calcite-combobox-item>
                    <calcite-combobox-item value="HUC-8" text-label="HUC-8"></calcite-combobox-item>
                    <calcite-combobox-item value="HUC-12" text-label="HUC-12"></calcite-combobox-item>
                    <calcite-combobox-item value="Draw a point" text-label="Draw a point"></calcite-combobox-item>
                    <calcite-combobox-item value="Draw a line" text-label="Draw a line"></calcite-combobox-item>
                    <calcite-combobox-item value="Draw an area" text-label="Draw an area"></calcite-combobox-item>
                </calcite-combobox>
            </calcite-label>
        <calcite-label layout="inline" scale="m">Buffer distance:
            <calcite-input-number min="0" placeholder="0.5" step="1" scale="l"
                number-button-type="vertical"></calcite-input-number>
        </calcite-label>
        </calcite-block>
        <calcite-block open heading="Select your geography" description="Which geography?">
            <calcite-icon scale="m" slot="icon" icon="number-circle-3"></calcite-icon>
            <calcite-notice open icon="exclamation-mark-triangle" kind='danger'>
                <div slot="message">Zoom in to see HUC boundaries</div>
            </calcite-notice>
        </calcite-block>
      </calcite-tab>
      <!-- <calcite-tab
        tab='resultsTab'>
        <calcite-notice 
        icon="car" 
        open>
        <div 
            slot="message">
            Results!
        </div>
        </calcite-notice>
    </calcite-tab> -->
  </calcite-tabs>
</calcite-panel>

<style>
    calcite-block {
        margin-left: 2px;
        margin-right: 2px;
    }
</style>