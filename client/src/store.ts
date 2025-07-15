import { derived, writable } from "svelte/store";

// don't have to call this state; shared between components (App and AppShell)
export const viewState = writable({
    view: null
})

// Seperate map and view to stop initWidgets from running twice
export const mapState = writable({
    map: null
})

export const climate = writable({
    climateVar: [],
})

type SmaViewModel = {
    indicator: string;
    landcoverYear: number;
    sumUnit: string;
    geographyLabel: string;
}

export const smaViewModel = writable<SmaViewModel>({
    indicator: "nlcd",
    landcoverYear: null,
    sumUnit: '',
    geographyLabel: '',
});

export const smaInputs = writable({
    landcover: Object({}),
    landcoverChange: Object({}),
    nlcdYearCombobox: Object({}),
    nlcdChange1Combobox: Object({}),
    nlcdChange2Combobox: Object({}),
    summaryUnitCombobox: Object({}),
    bufferDistance: Object({}),
});

let landcover;
let landcoverChange;
let nlcdYearCombobox;
let nlcdChange1Combobox;
let nlcdChange2Combobox;
let summaryUnitCombobox;
// let bufferDistance,

smaInputs.subscribe(value => {
    landcover = value.landcover;
    landcoverChange = value.landcoverChange;
    nlcdYearCombobox = value.nlcdYearCombobox;
    nlcdChange1Combobox = value.nlcdChange1Combobox;
    nlcdChange2Combobox = value.nlcdChange2Combobox;
    summaryUnitCombobox = value.summaryUnitCombobox;
});

export function resetSMA(): void {
    landcover.checked = true;
    landcoverChange.checked = false;
    //TODO: Reset values and UI
    // nlcdYearCombobox.value = '';
    // nlcdChange1Combobox.value = '';
    // nlcdChange2Combobox.value = '';
    // summaryUnitCombobox.value = '';
};

export const catalog = writable({
    type: "national",
});

export const geography = writable('')

export const nationalItems = writable([]);

export const searchTerm = writable('');

export const activeWidget = writable({
    right: null
});

// If we can rewrite things to call api instead of using store, then this is all unnecessary...

// derived store that filters each level of UI data (level1=topic, level2=subtopic, level3=layers) based on geography
// This works, but re-rendering has the downstream effect of needing to override shadow dom again, which I couldn't figure out how to correct.
// To recreate the issue, filter to Hawaii, then filter to CONUS...the calcite-list-items aren't height: 19px when they re-render.
// export const filteredNationalItems = derived(
//     [nationalItems, geography], ([$nationalItems, $geography]) => {
//         if (!$geography) {
//             return $nationalItems
//         } if ($geography) {
//             return $nationalItems.map(category => {
//                 return {...category, subtopic: category.subtopic.map(subtopic => {
//                     return {...subtopic, layers: subtopic.layers.filter(lyr => lyr.areaGeog.includes($geography))};
//                 }).filter(subtopic => subtopic.layers.length > 0)}
//             }).filter(category => category.subtopic.some(subtopic => subtopic.layers.length > 0))    
//         }
//     }
// )

// This is the in-between code from filtering (above) to using an isVisible prop in each level of UI data (level1=topic, level2=subtopic, level3=layers)
// export const filteredNationalItems = derived(
//     [nationalItems, geography], ([$nationalItems, $geography]) => {
//         if (!$geography) {
//             return $nationalItems
//         } if ($geography) {
//             return $nationalItems.map(category => {
//                 return {...category, subtopic: category.subtopic.map(subtopic => {
//                     return {...subtopic, layers: subtopic.layers.map(lyr => {
//                         return {...lyr, ...((lyr.areaGeog.includes($geography)) ? {isVisible: true} : {isVisible: false})}
//                     })}
//                 })}
//             })    
//         }
//     }
// )

// Got this working
// This was trying to get around re-rendering components that drop the shadow dom overriding css in DataList.svelte, but they still get re-rendered. 
// Maybe would have to change the svelte html to not have an {#if} statement?
export const filteredNationalItems = derived(
    [nationalItems, geography], ([$nationalItems, $geography]) => {
        if (!$geography) {
            return $nationalItems
        } if ($geography) {
            return $nationalItems.map(category => {
                const subObj = category.subtopic.map(subtopic => {
                    const lyrObj = subtopic.layers.map(layers => {
                        return {...layers, ...((layers.areaGeog.includes($geography)) ? {isVisible: true} : {isVisible: false})}
                    });
                    const isSubVis = lyrObj.some(layers => layers.isVisible);
                    return {...subtopic, layers: lyrObj, isVisible: isSubVis}
                });
                const isCatVis = subObj.some(subtopic => subtopic.isVisible);
                return {...category, subtopic: subObj, isVisible: isCatVis}
            })    
        }
    }
)