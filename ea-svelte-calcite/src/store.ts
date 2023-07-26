import { writable } from "svelte/store";

// don't have to call this state; shared between components (App and AppShell)
export const state = writable({
    view: null,
    map: null
})

export const ecat = writable({
    yearThresholds: [],
})