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
<calcite-card id=national-search-filter-card>
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    
    <calcite-input 
        alignment='start' 
        maxLength=20 
        type='text' 
        scale='s' 
        icon='search' 
        bind:this={searchInput} 
        on:calciteInputInput={()=>onSearch()} placeholder="Search Map Layers">
    </calcite-input>
    
      <!-- <calcite-chip 
                        scale="s" 
                        bind:this={catRefs[c]} 
                        id="catFilter" 
                        label="Clear search or filters" 
                        appearance="outline" 
                        on:click={()=>onCatChange(cat)}
                    >Clear search or filters</calcite-chip> -->
    
    <!-- <div class="bc-icon-group">
        {#each categories as cat, c (cat.name)}
        <div style="display:block">   
             <div  
                bind:this={catRefs[c]}
                style="background-color: {cat.color}; 
                background-image: url(https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png)" 
                class="bc-icon {cat.name}"
                on:click={()=>onCatChange(cat)}>
                
            </div> 
        </div> 
        {/each}
    
     <calcite-chip-group 
        scale='s' slot="footer-start" selection-mode="single" 
        label="cat-filter-chip-group">
        {#each categories as cat, c (cat.name)}
        {#if cat.name !== moreFilters && cat.name !== moreFilter2}
            <calcite-chip 
            bind:this={catRefs[c]}
                type="radio"
                id='{cat.name}' 
                scale='l' 
                value={cat.name}
                label={cat.name}
                kind='brand' 
                appearance='outline-fill'
                on:calciteChipSelect={()=>onCatChange(cat)}
            >
                <img 
                    slot="image" 
                    alt={cat.name} 
                    style="width:25x;height:25px;background-color:{cat.color};border-radius:50%" 
                    src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png"
                >
            </calcite-chip>
        {/if}
        {/each}
            
    </div> -->
    
    <calcite-chip
                bind:this={moreFiltersChip} 
                id="catFilter-popover-ref" 
                icon="plus-circle" 
                scale="s"
                round 
                appearance="outline" 
                on:calciteChipSelect={clearCatFilter}
            >Filters</calcite-chip>
        <!-- </calcite-chip-group>  -->
    <calcite-popover
        bind:this={moreFiltersPopover}
        id="morefilters"
        placement="trailing-start"
        overlay-positioning="fixed"
        scale="s"
        label="catFilter-popover-ref"
        reference-element="catFilter-popover-ref"
        closable
        heading="Filters"
        on:calcitePopoverClose={popoverClose}
        on:calcitePopoverOpen={popoverOpen}
    >
        <calcite-chip-group 
            bind:this={moreFiltersGroup}
            style="margin: 5px"
            scale='s' selection-mode="single" 
            label="cat-filter-chip-group">
            {#each categories as cat, c (cat.name)}
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
                            style="width:17px;height:17px;background-color:{cat.color};border-radius:50%" 
                            src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png"
                        >{cat.label}
                    </calcite-chip>
                <!-- {/if} -->
            {/each}
        </calcite-chip-group> 
    </calcite-popover>
    </calcite-action-bar>
<p style="margin-block: 5px;">Showing {totalVisibleMaps} map layers</p> 
</calcite-card>
{/if}

<style>

                
   
    calcite-action-bar#catalog-search-filter {
        width: 100%;
    }
    
    calcite-popover#morefilters {
        --calcite-popover-max-size-x: 210px
    }
    calcite-input {
        width: 100%;
        margin-right: 15px;
        border-radius: 7px;
    }

    calcite-chip {
        --calcite-chip-border-color: black;
        --calcite-ui-focus-color: none !important;
    }

    calcite-chip#catFilter-popover-ref {
        --calcite-chip-border-color: #949494;
        --calcite-chip-corner-radius: 7px;
        --calcite-chip-text-color: #6b6b6b;
        /* --calcite-button-border-color:#949494; */
        
    }

    calcite-card#national-search-filter-card {
        --calcite-card-border-color: none;
        margin-bottom: 0px;
    }

    div.bc-icon-group {
        display: flex; 
        padding-top: 10px;
        justify-content: center;

    }

    div.bc-icon {
        width: 25px;
        height: 25px;
        border-radius: 20px;
        margin-right: 7px;
        background-size: 80% auto;
        background-position: center;
        background-repeat: no-repeat; 

    }

    .map-counter {
        margin-left: 10px;
        padding-left: 20px;
        border: 1px solid black;
        font-size: 11px;
        line-height: 0.15in;
        text-align: left;
    }
</style> 