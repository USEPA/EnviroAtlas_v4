import { writable } from "svelte/store";

// don't have to call this state; shared between components (App and AppShell)
export const viewState = writable({
    view: null
})

// Seperate map and view to stop initWidgets from running twice
export const mapState = writable({
    map: null
})

export const ecat = writable({
    yearThresholds: [],
})