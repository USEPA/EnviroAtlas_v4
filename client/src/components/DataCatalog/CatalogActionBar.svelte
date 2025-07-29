<script>
    import "@esri/calcite-components/dist/components/calcite-filter";

    export let type;
</script>

{#if type=='national' || type=='subnational'}
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-filter placeholder="Try searching"></calcite-filter>    
</calcite-action-bar>
<calcite-action-bar id='catFilter' layout="horizontal" expand-disabled>
    <calcite-button class="eaCA" round on:click={()=> console.log('clicked!')}>
        <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/air.png">
    </calcite-button>
    <calcite-button class="eaCPW" round>
        <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/water.png">
    </calcite-button>
    <calcite-button class="eaNHM" round>
        <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/haz.png">
    </calcite-button>
    <calcite-button class="eaRCA" round>
        <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/rec.png">
    </calcite-button>
    <calcite-button class="eaFFM" round>
        <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/food.png">
    </calcite-button>
    <calcite-button class="eaBC" round>
         <img style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/bio.png">
    </calcite-button>
</calcite-action-bar>
{/if}


<style>
    calcite-action-bar#catFilter {
        margin: 0 auto;
        --calcite-action-bar-items-space:5px;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    
    calcite-button.eaCA {
        --calcite-button-background-color: #7F81BA;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.eaCPW {
        --calcite-button-background-color: #74CCD1;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.eaBC {
        --calcite-button-background-color: #2EAE4A;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.eaFFM {
        --calcite-button-background-color: #F0E024;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.eaNHM {
        --calcite-button-background-color: #D75D64;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.eaRCA {
        --calcite-button-background-color: #C770B4;
        --calcite-ui-focus-color: none !important;
    }
</style>