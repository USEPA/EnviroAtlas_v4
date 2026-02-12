<script>
    import { categoryFilter, searchTerm } from "/src/store.ts";
    import { expandTopics } from "/src/shared/utilities.js";

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
        { 
            name: "eaCA",
            icon: "air",
            label: "Clean Air",
            color: "#7f81ba"
        },
        {
            name: "eaNHM",
            icon: "haz",
            label: "Natural Hazard Mitigation",
            color: "#D75D64",
        },
        {
            name: "eaCPW",
            icon: "water",
            label: "Clean Water",
            color: "#74CCD1",
        },
        {
            name: "eaRCA",
            icon: "rec",
            label: "Recreation & Culture",
            color: "#C770B4",
        },
        {
            name: "eaFFM",
            icon: "food",
            label: "Food, Fuel & Materials",
            color: "#F0E024",
        },
        {
            name: "eaBC",
            icon: "bio",
            label: "Biodiversity Conservation",
            color: "#2EAE4A",
        },
        {
            name: "eaCS",
            icon: "clim",
            label: "Climate Stabilization",
            color: "#F99F1F",
        },
        { 
            name: "eaCL",
            icon: "land",
            label: "Clean Land",
            color: "tan"
        },
    ];
    let onScreenCategories = ["eaCA", "eaCPW", "eaCL"];

    let onScreenFilters = categories.filter((cat) =>
        onScreenCategories.includes(cat.name),
    );
    let moreFilters = categories.filter(
        (cat) => !onScreenCategories.includes(cat.name),
    );

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
            if (searchInput.value.length > 2) {
                $searchTerm = searchInput.value;
                $categoryFilter = "";
                // TODO: Need to clear category filter chips
                expandTopics();
            } else {
                $searchTerm = "";
                expandTopics(false);
            }
        }, 500);
    };

    /**
     * The on:click function for category filter chips.
     * Helps control UI for selecting category filter between the two chip groups,
     * main chip group and "More Filters" chip group.
     * Controls the categoryFilter store value for catalog filtering.
     * Expands or collapses the topics in the list.
     * @param {object} cat - the selected category data dictionary
     */
    // Clear search term when choosing a category (prevents compounding filters that often yield 0)
    const onCatChange = (cat) => {
        if ($searchTerm) {
            $searchTerm = "";
            if (searchInput) searchInput.value = "";
        }

        if ($categoryFilter !== cat.name) {
            $categoryFilter = cat.name;
            expandTopics();
        } else {
            $categoryFilter = "";
            expandTopics(false);
        }
    };

    const clearCatFilter = () => {
        if ($categoryFilter !== "eaBC" && $categoryFilter !== "eaCS") {
            $categoryFilter = "";
            expandTopics(false);
        }
    };

    const popoverClose = () => {
        console.log(moreFiltersGroup.selectedItems);
        if (moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.setAttribute("selected", "");
        } else if (!moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.removeAttribute("selected");
        }
    };

    const popoverOpen = () => {
        if (moreFiltersGroup.selectedItems[0]) {
            moreFiltersChip.setAttribute("selected", "");
        }
    };

    function getCategoryLabel(name) {
        const cat = categories.find((c) => c.name === name);
        // Show label if available, else show the raw name
        return cat?.label?.trim() || name;
    }

    function clearSearch() {
        $searchTerm = "";
        if (searchInput) searchInput.value = "";
        expandTopics(false);
    }

    function clearCategory() {
        $categoryFilter = "";
        expandTopics(false);
    }
</script>

{#if type == "national"}
    <calcite-card id="national-search-filter-card">
        <calcite-input
            alignment="start"
            maxLength="20"
            type="text"
            scale="m"
            icon="search"
            bind:this={searchInput}
            on:calciteInputInput={() => onSearch()}
            placeholder="Search Map Layers"
        >
        </calcite-input>

        <calcite-chip-group
            bind:this={moreFiltersGroup}
            style="margin: 8px 0 3px 0"
            scale="s"
            selection-mode="single"
            label="cat-filter-chip-group"
        >
            <div class="onscreen-filters">
                {#each onScreenFilters as cat, c (cat.name)}
                    <button
                        class="filter-button"
                        class:selected={$categoryFilter === cat.name}
                        aria-pressed={$categoryFilter === cat.name}
                        bind:this={catRefs[c]}
                        on:click={() => onCatChange(cat)}
                    >
                        <img
                            slot="image"
                            alt={cat.name}
                            class="filter-icon"
                            style="background-color:{cat.color};"
                            src="/ea/client/images/{cat.icon}.png"
                        />{cat.label}
                    </button>
                    <!-- {/if} -->
                {/each}
                <button
                    bind:this={moreFiltersChip}
                    id="catFilter-popover-ref"
                    class="filter-button"
                    on:click={() => clearCatFilter}
                >
                    More
                </button>
            </div>
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
                    scale="s"
                    selection-mode="single"
                    label="cat-filter-chip-group"
                >
                    {#each moreFilters as cat, c (cat.name)}
                        <button
                            bind:this={catRefs[c + onScreenFilters.length]}
                            class="filter-button"
                            class:selected={$categoryFilter === cat.name}
                            aria-pressed={$categoryFilter === cat.name}
                            bind:this={catRefs[c + onScreenFilters.length]}
                            on:click={() => onCatChange(cat)}
                        >
                            <img
                                slot="image"
                                alt={cat.name}
                                class="filter-icon"
                                style="width:17px;height:17px;background-color:{cat.color};border-radius:50%"
                                src="/ea/client/images/{cat.icon}.png"
                            />{cat.label}
                        </button>
                        <!-- {/if} -->
                    {/each}
                </calcite-chip-group>
            </calcite-popover>
        </calcite-chip-group>

        <div class="filter-tag" title="Active filter status">
            <span>Showing {totalVisibleMaps} map layers. </span>
            {#if $searchTerm}
                <span> Filtered by search: "{$searchTerm}"</span>
                <button
                    class="clear-filter"
                    on:click={clearSearch}
                    aria-label="Clear search filter">Clear</button
                >
            {:else if $categoryFilter}
                <span> Filtered by: {getCategoryLabel($categoryFilter)}</span>
                <button
                    class="clear-filter"
                    on:click={clearCategory}
                    aria-label="Clear category filter">Clear</button
                >
            {:else}
                <span> No layers filtered.</span>
            {/if}
        </div>
    </calcite-card>
{/if}

<style>
    calcite-action-bar#catalog-search-filter {
        width: 100%;
    }

    calcite-popover#morefilters {
        --calcite-popover-max-size-x: 210px;
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

    calcite-card#national-search-filter-card {
        --calcite-card-border-color: none;
        margin-bottom: 0px;
        margin-top: 0px;
    }

    /* Keep buttons at natural width; distribute leftover space as equal gaps between them */
    .onscreen-filters {
        display: flex;
        margin-right: 5px;
        flex-wrap: nowrap; /* keep on one line */
    }

    /* Ensure buttons don’t stretch; keep intrinsic width
    .onscreen-filters .filter-button {
        flex: 0 0 auto;
    } */

    .filter-icon {
        display: flex;
        float: left;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin: 0 5px 0 0;
    }

    .filter-button {
        padding: 3px 5px;
        display: inline-flex;
        color: #7a7a7a;
        align-items: center;
        border-radius: 15px;
        background-color: white;
        font-weight: 400;
        border: 1.5px solid #bfbfbf;
        margin-right: 5px; /* add spacing between buttons */
    }

    .filter-button.selected,
    .filter-button[aria-pressed="true"] {
        background: #e3e3e3;
        /* color: var(--calcite-color-text-1, #2b2b2b); */
    }

    .filter-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 14px;
        border: 1px solid #bfbfbf;
        background: #e3e3e3;
        margin-block: 5px;
    }
    .clear-filter {
        appearance: none;
        background: transparent;
        border: none;
        color: #007ac2;
        cursor: pointer;
        font-size: 12px;
        text-decoration: underline;
    }

    .map-count-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-block: 5px;
        /* Optional: allow wrapping on narrow screens */
        flex-wrap: nowrap; /* change to wrap if you want it to break to two lines when narrow */
    }
</style>
