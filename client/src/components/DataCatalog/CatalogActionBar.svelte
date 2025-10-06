<script>
    import "@esri/calcite-components/dist/components/calcite-filter";
    import { categoryFilter, searchTerm } from "/src/store.ts";
    import { expandTopics } from "/src/shared/utilities.js"

    export let type;
    export let totalMapsCount;
    export let totalVisibleMaps;

    let searchInput;
    let catRefs = [];
    let timer;
    
    let categories = [
        { name: "eaCA", icon: "air", label: " Clean Air", color: "#7f81ba" }, 
        { name: "eaNHM", icon: "haz", label: " Natural Hazard Mitigation", color: "#D75D64" }, 
        { name: "eaCPW", icon: "water", label: " Clean Water", color: "#74CCD1" }, 
        { name: "eaRCA", icon: "rec", label: " Recreation & Culture", color: "#C770B4" }, 
        { name: "eaFFM", icon: "food", label: " Food, Fuel & Materials", color: "#F0E024" }, 
        { name: "eaBC", icon: "bio", label: "Biodiversity Conservation", color: "#2EAE4A" }, 
    ];
    let moreFilters = "eaBC"
    /**
     * The on:calciteInputInput function for search filtering.
     * Has basic debounce by setting a timer and waiting 0.5 seconds 
     * before filtering the list. Will only perform search filter for more 
     * than 2 characters of input. Search filter will clear category filters
     * and give UI feedback. Search filter will expand topic headers.
     */
    const onSearch = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (searchInput.value.length > 2 ) {
                $searchTerm = searchInput.value;
                $categoryFilter = '';
                catRefs.forEach(elem => {
                    elem.classList.remove('filtered')
                });
                expandTopics();
            } else {
                $searchTerm = '';
                expandTopics(false);
            }
        }, 500)
    };

    /**
     * The on:click function for category filter buttons. 
     * Controls the categoryFilter store value for catalog filtering.
     * Performs UI feedback of graying out the other selections.
     * Expands or collapses the topics in the list.
     * @param {object} cat - the selected category data dictionary
     */
    const onCatChange = (cat) => {
        if ($categoryFilter != cat.name) {
            $categoryFilter = cat.name;
            catRefs.filter(catIcon => catIcon.classList.contains(cat.name))[0].classList.remove('filtered');
            catRefs.filter(catIcon => !catIcon.classList.contains(cat.name)).forEach(elem => {
                elem.classList.add('filtered')
            });
            expandTopics();
        } else if ($categoryFilter === cat.name) {
            $categoryFilter = '';
            catRefs.forEach(elem => {
                elem.classList.remove('filtered')
            });
            expandTopics(false);
        }
    };
</script>

{#if type=='national' || type=='subnational'}
<calcite-card>
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-input alignment='start' maxLength=20 type='text' scale='l' icon='search' bind:this={searchInput} on:calciteInputInput={()=>onSearch()} placeholder="Try searching"></calcite-input>
    <calcite-button id='count' scale='s'>{totalVisibleMaps} / {totalMapsCount} <br>
        Maps</calcite-button>   
</calcite-action-bar>
    <calcite-chip-group scale="s" slot="footer-start">
        {#each categories as cat, c (cat.name)}
            {#if cat.name !== moreFilters}
                <calcite-button bind:this={catRefs[c]} alignment="start" class={cat.name} id="catFilter" round appearance="outline" on:click={()=>onCatChange(cat)}>
                    <img alt={cat.name} style="width:20px;height:20px;background-color:{cat.color};border-radius:50%" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
                    {cat.label}
                </calcite-button>    
            {/if}
        {/each}
        <calcite-button id="catFilter-popover-ref" icon-start="plus-circle" round appearance="outline">More Filters</calcite-button>
        <calcite-popover
            placement="trailing-start"
            overlay-positioning="fixed"
            scale="s"
            label="catFilter-popover-ref"
            reference-element="catFilter-popover-ref"
            closable
            heading="More Filters"
        >
                    {#each categories as cat, c (cat.name)}
                    {#if cat.name === moreFilters}
                    <calcite-button bind:this={catRefs[c]} alignment="start" class={cat.name} id="catFilter" round appearance="outline" on:click={()=>onCatChange(cat)}>
                        <img alt={cat.name} style="width:20px;height:20px;background-color:{cat.color};border-radius:50%" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
                        {cat.label}
                    </calcite-button>
                    {/if}
                    {/each}
        </calcite-popover>
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

    calcite-button#catFilter {
        --calcite-button-text-color: black;
        --calcite-button-border-color: black;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button#catFilter-popover-ref {
        --calcite-button-text-color: black;
        --calcite-button-border-color: black;
        --calcite-ui-focus-color: none !important;
    }

    calcite-button.filtered {
        --calcite-button-background-color: #d3d3d3;
        --calcite-ui-focus-color: none !important;
    }
</style> 