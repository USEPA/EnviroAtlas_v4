<script>

    import { categoryFilter, searchTerm } from "/src/store.ts";
    import { expandTopics } from "/src/shared/utilities.js"

    export let type;
    export let totalMapsCount;
    export let totalVisibleMaps;

    let searchInput;
    let catRefs = [];
    let timer;
    let moreFiltersChip;
    let moreFiltersGroup;
    let moreFiltersPopover;
    
    let categories = [
        { name: "eaCA", icon: "air", label: " Clean Air", color: "#7f81ba" }, 
        { name: "eaNHM", icon: "haz", label: " Natural Hazard Mitigation", color: "#D75D64" }, 
        { name: "eaCPW", icon: "water", label: " Clean Water", color: "#74CCD1" }, 
        { name: "eaRCA", icon: "rec", label: " Recreation & Culture", color: "#C770B4" }, 
        { name: "eaFFM", icon: "food", label: " Food, Fuel & Materials", color: "#F0E024" }, 
        { name: "eaBC", icon: "bio", label: "Biodiversity Conservation", color: "#2EAE4A" },
        { name: "eaCS", icon: "clim", label: "Climate Stabilization", color: "#F99F1F"}
    ];
    let moreFilters = categories[5].name
    let moreFilter2 = categories[6].name

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
     * Helps control UI for selecting category filter between the two chip groups,
     * main chip group and "More Filters" chip group.
     * Controls the categoryFilter store value for catalog filtering.
     * Expands or collapses the topics in the list.
     * @param {object} cat - the selected category data dictionary
     */
    const onCatChange = (cat) => {
        if ($categoryFilter != cat.name) {
            if ($categoryFilter === 'eaBC' || $categoryFilter === 'eaCS') {
                if ($categoryFilter === 'eaBC') {
                    catRefs[5].removeAttribute("selected")
                    moreFiltersPopover.removeAttribute("open")
                };
                if ($categoryFilter === 'eaCS') {
                    catRefs[6].removeAttribute("selected")
                    moreFiltersPopover.removeAttribute("open")
                };
            }
            $categoryFilter = cat.name;
            expandTopics();
        } else if ($categoryFilter === cat.name) {
            $categoryFilter = '';
            expandTopics(false);
        }
    };

    const clearCatFilter = () => {
        if ($categoryFilter !== 'eaBC' && $categoryFilter !== 'eaCS') {
            $categoryFilter = '';
            expandTopics(false);
        }
    }

    const popoverClose = () => {
        console.log(moreFiltersGroup.selectedItems)
        if (moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.setAttribute("selected", "")
        } else if (!moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.removeAttribute("selected")
        }
    }

    const popoverOpen = () => {
        if (moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.setAttribute("selected", "")
        }
    }
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
                <img 
                    slot="image" 
                    alt={cat.name} 
                    style="width:20x;height:20px;background-color:{cat.color};border-radius:50%" 
                    src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png"
                >{cat.label}
            </calcite-chip>
        {/if}
        {/each}
            <calcite-chip
                bind:this={moreFiltersChip} 
                id="catFilter-popover-ref" 
                icon="plus-circle" 
                round 
                appearance="outline" 
                on:calciteChipSelect={clearCatFilter}
            >More Filters</calcite-chip>
        </calcite-chip-group> 
    <calcite-popover
        bind:this={moreFiltersPopover}
        id="morefilters"
        placement="trailing-start"
        overlay-positioning="fixed"
        scale="s"
        label="catFilter-popover-ref"
        reference-element="catFilter-popover-ref"
        closable
        heading="More Filters"
        on:calcitePopoverClose={popoverClose}
        on:calcitePopoverOpen={popoverOpen}
    >
        <calcite-chip-group 
            bind:this={moreFiltersGroup}
            scale='s' selection-mode="single" 
            label="cat-filter-chip-group">
            {#each categories as cat, c (cat.name)}
                {#if cat.name === moreFilters || cat.name === moreFilter2}
                    <calcite-chip 
                        scale="s" 
                        bind:this={catRefs[c]} 
                        id="catFilter" 
                        round 
                        appearance="outline" 
                        on:click={()=>onCatChange(cat)}
                    >
                        <img 
                            slot="image" 
                            alt={cat.name} 
                            style="width:20px;height:20px;background-color:{cat.color};border-radius:50%" 
                            src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png"
                        >{cat.label}
                    </calcite-chip>
                {/if}
            {/each}
        </calcite-chip-group> 
    </calcite-popover>
</calcite-card>
{/if}

<style>
    calcite-popover#morefilters {
        --calcite-popover-max-size-x: 210px
    }
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
        --calcite-color-brand-hover: #2F3540;
        --calcite-color-brand-press: 2F3540; 
        --calcite-button-background-color: white;
        --calcite-button-text-color: 2F3540;
        --calcite-button-border-color:#6a6a6a
    }
</style> 