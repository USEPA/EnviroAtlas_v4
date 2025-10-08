<script>

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
        { name: "eaCS", icon: "clim", label: "Climate Stabilization", color: "#F99F1F"}
    ];
    let moreFilters = "eaBC"
    let moreFilter2 = "eaCS"
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
                // TODO: Need to clear category filter chips 
                expandTopics();
            } else {
                $searchTerm = '';
                expandTopics(false);
            }
        }, 500)
    };

    /**
     * The on:click function for category filter chips. 
     * Controls the categoryFilter store value for catalog filtering.
     * Expands or collapses the topics in the list.
     * @param {object} cat - the selected category data dictionary
     */
    const onCatChange = (cat) => {
        if ($categoryFilter != cat.name) {
            $categoryFilter = cat.name;
            expandTopics();
        } else if ($categoryFilter === cat.name) {
            $categoryFilter = '';
            expandTopics(false);
        }
        //TODO: Build logic for selecting category filter between the two chip groups
    };

    //TODO: set a max width on "More filters" popover, so 
    // the eaBC and eaCS stack vertically
</script>

{#if type=='national'}
<calcite-card>
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-input alignment='start' maxLength=20 type='text' scale='l' icon='search' bind:this={searchInput} on:calciteInputInput={()=>onSearch()} placeholder="Try searching"></calcite-input>
    <calcite-button id='count' scale='s'>{totalVisibleMaps} / {totalMapsCount} <br>
        Maps</calcite-button>   
</calcite-action-bar>
    <calcite-chip-group 
        scale='s' slot="footer-start" selection-mode="single" 
        label="cat-filter-chip-group">
        {#each categories as cat, c (cat.name)}
        {#if cat.name !== moreFilters && cat.name !== moreFilter2}
            <calcite-chip 
            bind:this={catRefs[c]}
                type="radio"
                id='{cat.name}' 
                scale='s' 
                value={cat.name}
                label={cat.name}
                kind='brand' 
                appearance='outline-fill'
                on:calciteChipSelect={()=>onCatChange(cat)}
            >
                <img slot="image" alt={cat.name} style="width:20x;height:20px;background-color:{cat.color};border-radius:50%" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">{cat.label}
            </calcite-chip>
        {/if}
        {/each}
            <calcite-chip id="catFilter-popover-ref" icon="plus-circle" round appearance="outline">More Filters</calcite-chip>
        </calcite-chip-group> 
    <calcite-popover
        placement="trailing-start"
        overlay-positioning="fixed"
        scale="s"
        label="catFilter-popover-ref"
        reference-element="catFilter-popover-ref"
        closable
        heading="More Filters"
    >
        <calcite-chip-group 
            scale='s' selection-mode="single" 
            label="cat-filter-chip-group">
            {#each categories as cat, c (cat.name)}
            {#if cat.name === moreFilters || cat.name === moreFilter2}
                <calcite-chip scale="s" bind:this={catRefs[c]} id="catFilter" round appearance="outline" on:click={()=>onCatChange(cat)}>
                    <img slot="image" alt={cat.name} style="width:20px;height:20px;background-color:{cat.color};border-radius:50%" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
                    {cat.label}
                </calcite-chip>
            {/if}
            {/each}
        </calcite-chip-group> 
    </calcite-popover>
</calcite-card>
{/if}

<style>
    calcite-input {
        width: 75%;
        margin: 3px;
    }

    calcite-chip {
        --calcite-chip-border-color: black;
        --calcite-ui-focus-color: none !important;
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
</style> 