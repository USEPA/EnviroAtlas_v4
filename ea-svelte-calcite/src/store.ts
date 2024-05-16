import { writable } from "svelte/store";

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
}

export const smaViewModel = writable<SmaViewModel>({
    indicator: "nlcd",
    landcoverYear: null,
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
// let nlcdChange1Combobox,
// let nlcdChange2Combobox,
// let summaryUnitCombobox,
// let bufferDistance,

smaInputs.subscribe(value => {
    landcover = value.landcover;
    landcoverChange = value.landcoverChange;
    nlcdYearCombobox = value.nlcdYearCombobox;
});

export function resetSMA(): void {
    landcover.checked = true;
    landcoverChange.checked = false;
    nlcdYearCombobox.value = null;
}