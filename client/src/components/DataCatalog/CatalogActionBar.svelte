<script>
    import "@esri/calcite-components/dist/components/calcite-filter";
    import { categoryFilter, searchTerm } from "/src/store.ts";
    import { expandTopics } from "/src/shared/utilities.js"

    export let type;
    export let totalMapsCount;
    export let totalVisibleMaps;

    let searchInput;
    let catRefs = []; // bind to category buttons
    let timer;
    
    let categories = [
        { name: "eaCA", icon: "air" }, 
        { name: "eaCPW", icon: "water" }, 
        { name: "eaNHM", icon: "haz" }, 
        { name: "eaRCA", icon: "rec" }, 
        { name: "eaFFM", icon: "food" }, 
        { name: "eaBC", icon: "bio" }, 
    ];

    const onSearch = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (searchInput.value.length > 2 ) {
                $searchTerm = searchInput.value;
                console.log($searchTerm)
                // Set category filter store to empty
                $categoryFilter = '';
                // Remove gray 'filtered' class from category buttons
                catRefs.forEach(elem => {
                    elem.classList.remove('filtered')
                });
                expandTopics();
            } else {
                $searchTerm = '';
                // No filter should remove expanded on all topic headers
                expandTopics(false);
            }
        }, 500)
    };

    const onCatChange = (cat) => {
        // Only one benefit category filter can be selected. 
        if ($categoryFilter != cat.name) {
            $categoryFilter = cat.name;
            // Once selected, that icon will stay color and the rest will gray out. Clicking another BC changes the selection to that BC. 
            catRefs.filter(catIcon => catIcon.classList.contains(cat.name))[0].classList.remove('filtered');
            catRefs.filter(catIcon => !catIcon.classList.contains(cat.name)).forEach(elem => {
                elem.classList.add('filtered')
            });
            // Filter should open all the topic headers.
            expandTopics();
        } else if ($categoryFilter === cat.name) {
            // Set category filter store to empty
            $categoryFilter = '';
            // Clicking the already selected BC turns off the filter and returns all to color. 
            catRefs.forEach(elem => {
                elem.classList.remove('filtered')
            });
            // No filter should remove expanded on all topic headers
            expandTopics(false);
        }
    };
</script>

{#if type=='national' || type=='subnational'}
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-input alignment='start' maxLength=20 type='text' scale='l' icon='search' bind:this={searchInput} on:calciteInputInput={()=>onSearch()} placeholder="Try searching"></calcite-input>
    <calcite-button id='count' scale='s'>{totalVisibleMaps} / {totalMapsCount} <br>
        Maps</calcite-button>   
</calcite-action-bar>
<calcite-card>
    <calcite-chip-group scale="l" slot="footer-start">
       {#each categories as cat, c (cat.name)}
        <calcite-chip bind:this={catRefs[c]} class={cat.name} round on:click={()=>onCatChange(cat)}>{cat.name}
            <img slot="image" alt={cat.name} style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
        </calcite-chip>    
        {/each}
    </calcite-chip-group>
 </calcite-card>
{/if}

<style>
    calcite-input {
        width: 75%;
        margin: 3px;
    }

    calcite-button#count {
        width:25%;
        margin: 3px;
        --calcite-ui-focus-color: none !important;
        --calcite-color-brand-hover: #005ea2;
        --calcite-color-brand-press: #005ea2; 
        --calcite-button-background-color: white;
        --calcite-button-text-color: #005ea2;
        --calcite-button-border-color:#6a6a6a
    }

    calcite-action-bar#catFilter {
        margin: 0 auto;
        --calcite-action-bar-items-space:5px;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    
    calcite-button.eaCA {
        --calcite-button-background-color: #7f81ba;
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

    calcite-button.filtered {
        --calcite-button-background-color: #d3d3d3;
        --calcite-ui-focus-color: none !important;
    }
</style> 