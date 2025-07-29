<script>
    import "@esri/calcite-components/dist/components/calcite-filter";

    export let type;

    let categoryParent;
    
    let categories = [
        { name: "eaCA", icon: "air" }, 
        { name: "eaCPW", icon: "water" }, 
        { name: "eaNHM", icon: "haz" }, 
        { name: "eaRCA", icon: "rec" }, 
        { name: "eaFFM", icon: "food" }, 
        { name: "eaBC", icon: "bio" }, 
    ];

    const onCatChange = (cat) => {
        console.log(cat.name)

        // Only one benefit category filter can be selected. Once selected, that icon will stay color and the rest will gray out. 
        // Clicking another BC changes the selection to that BC. Clicking the already selected BC turns off the filter and returns all to color. 
        // Filter should open all the topic headers.
    };
</script>

{#if type=='national' || type=='subnational'}
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-filter placeholder="Try searching"></calcite-filter>    
</calcite-action-bar>
<calcite-action-bar bind:this={categoryParent} id='catFilter' layout="horizontal" expand-disabled>
    {#each categories as cat}
    <calcite-button class="{cat.name}" round on:click={()=>onCatChange(cat)}>
        <img alt="{cat.name}" style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
    </calcite-button>
    {/each}
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