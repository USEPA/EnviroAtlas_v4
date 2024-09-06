//"General Store" aka Dollar General
//For some sets of data might want to put them in their own store otherwise can put stuff in here so we don't have tons of files for a few variables
import { writable } from "svelte/store";

//making stores more atomic so change in one small thing doesn't trigger a whole objcet
//that was biting me in BLT
//Note: wanted to export an object of writable() fields but can't consume like admin.$path or $(admin.path)
export const admin_path = writable('');

//Fields can be addded to this main object also, but changing one field will update all that consume.
//But this could work for adding stuff like functions that need to be shared.
export const admin = writable({});
