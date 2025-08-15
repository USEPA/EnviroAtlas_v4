<script>
    import "@esri/calcite-components/dist/components/calcite-filter";
    import { categoryFilter, searchTerm } from "/src/store.ts";

    export let type;

    let categoryParent;
    let searchInput;
    
    let categories = [
        { name: "eaCA", icon: "air" }, 
        { name: "eaCPW", icon: "water" }, 
        { name: "eaNHM", icon: "haz" }, 
        { name: "eaRCA", icon: "rec" }, 
        { name: "eaFFM", icon: "food" }, 
        { name: "eaBC", icon: "bio" }, 
    ];

    const onSearch = () => {
        if (searchInput.value.length > 2 ) {
            $searchTerm = searchInput.value
            console.log($searchTerm)
            // Set category filter store to empty
            $categoryFilter = '';
            // Remove gray 'filtered' class from category buttons
            Array.from(categoryParent.children).forEach(elem => {
                elem.classList.remove('filtered')
            });
            expandTopics();
        } else {
            $searchTerm = '';
            // No filter should remove expanded on all topic headers
            collapseTopics();
        }

    };

    const onCatChange = (cat) => {
        // Only one benefit category filter can be selected. 
        if ($categoryFilter != cat.name) {
            // Once selected, that icon will stay color and the rest will gray out. Clicking another BC changes the selection to that BC. 
            let elemSelected = Array.from(categoryParent.children).filter(catIcon => catIcon.classList.contains(cat.name));
            elemSelected[0].classList.remove('filtered');
            let elemsToFilter = Array.from(categoryParent.children).filter(catIcon => !catIcon.classList.contains(cat.name));
            elemsToFilter.forEach(elem => {
                elem.classList.add('filtered')
            });
            $categoryFilter = cat.name;
            // Filter should open all the topic headers.
            expandTopics();
        } else if ($categoryFilter === cat.name) {
            // Clicking the already selected BC turns off the filter and returns all to color. 
            Array.from(categoryParent.children).forEach(elem => {
                elem.classList.remove('filtered')
            });
            // Set category filter store to empty
            $categoryFilter = '';
            // No filter should remove expanded on all topic headers
            collapseTopics();
        }
    };

    function expandTopics() {
        const listESB = document.querySelectorAll("calcite-list-item#ESB");
        listESB.forEach((elem) => {
            elem.setAttribute("expanded", "");
        });
        const listPSI = document.querySelectorAll("calcite-list-item#PSI");
        listPSI.forEach((elem) => {
            elem.setAttribute("expanded", "");
        });
        const listPBS = document.querySelectorAll("calcite-list-item#PBS");
        listPBS.forEach((elem) => {
            elem.setAttribute("expanded", "");
        });
        const listBNF = document.querySelectorAll("calcite-list-item#BNF");
        listBNF.forEach((elem) => {
            elem.setAttribute("expanded", "");
        });
    };

    function collapseTopics() {
        const listESB = document.querySelectorAll("calcite-list-item#ESB");
        listESB.forEach((elem) => {
            elem.removeAttribute("expanded");
        });
        const listPSI = document.querySelectorAll("calcite-list-item#PSI");
        listPSI.forEach((elem) => {
            elem.removeAttribute("expanded");
        });
        const listPBS = document.querySelectorAll("calcite-list-item#PBS");
        listPBS.forEach((elem) => {
            elem.removeAttribute("expanded");
        });
        const listBNF = document.querySelectorAll("calcite-list-item#BNF");
        listBNF.forEach((elem) => {
            elem.removeAttribute("expanded");
        });
    }
</script>

{#if type=='national' || type=='subnational'}
<calcite-action-bar id="catalog-search-filter" layout="horizontal" expand-disabled>    
    <calcite-input alignment='start' maxLength=20 type='text' scale='l' icon='search' bind:this={searchInput} on:calciteInputInput={()=>onSearch()} placeholder="Try searching"></calcite-input>
    <calcite-button style="font-size:10px" id='count' scale='s'>317 / 512 <br>
        Maps</calcite-button>   
</calcite-action-bar>
<calcite-action-bar bind:this={categoryParent} id='catFilter' layout="horizontal" expand-disabled>
    {#each categories as cat}
    <calcite-button class={cat.name} round on:click={()=>onCatChange(cat)}>
        <img alt={cat.name} style="width:21px;height:24px;" src="https://enviroatlas.epa.gov/enviroatlas/interactivemap/widgets/SimpleSearchFilter/images/ES_Icons/{cat.icon}.png">
    </calcite-button>
    {/each}
</calcite-action-bar>
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