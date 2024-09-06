<script>
import { admin_path } from 'src/stores/general.js';

import { onMount } from 'svelte';
import * as utilities from '@usepa-ngst/utilities';

let defaultPath = 'home';
let screen;
let screenName;
let isMounted = false;

$: $admin_path, loadPath();

window.ea.setAdminPathAdminIndex = (path)=>{
    $admin_path = path;
};

onMount(async () => {
    isMounted = true;
    await loadPath();
});

async function loadPath() {
    if (!isMounted) return;
    //using relativeURLfactory so we can get rid of any ? or #
    let adminURL = utilities.relativeURLfactory($admin_path);
    //note: get rid of leading/trailing / relativeURLfactory adds to pathname
    let path = adminURL.pathname.replace(/^\//,'').replace(/\/$/,'') || defaultPath;
    console.log(path);
    // Note have to explicity state import instead of using say import(variable)
    // because rollup won't find the import
    if (path==='home') {
        screen = (await import('src/pages/admin/Home.svelte')).default;
        screenName = 'home';
    } else if (/^tables(\/|$)/.test(path)) {
        screen = (await import('src/pages/admin/tables/Index.svelte')).default;
        screenName = 'tables';
    } else if (path==='users') {
        screen = (await import('src/pages/admin/Users.svelte')).default;
        screenName = 'users';
    }
}

</script>
<style>
    .logo {
        grid-area: logo;
    }
    .name {
        grid-area: name;
        text-align:right;
        padding-right:2em;
    }

    .banner {
        display: grid;
        gap: 0em;
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
                "logo name";
        align-items: center;
    }

    button.logout {
        background: white;
        color: #0066CC;
        margin-left:.5em;
        padding: 0em .35em .25em;

    }

    nav.main {
    	background-color:#5cb85c;
        display: flex;
        flex-wrap: wrap;
/*        border-top: .1em solid white; */
        padding-left: 2.25em;
    }

    nav.main a {
        text-decoration: none;
        display: block;
        padding: .25em 1em .5em;
        text-align: center;
    	color:white;
        margin: 0;
        font-weight:bold;
    }

    nav a:hover {
        color: #ffff00;
    }

    nav a.active {
    	background-color:white;
    	color:#5cb85c;
    }

</style>

<div  class='header' >
    <div class='banner' >
        <div class='logo'>
            <img height='40' src='/ea/client/images/logo.png' alt='ea/admin ' />
        </div>
    </div>
    <nav class='main' >
        <a href='/ea/admin/home/' class:active={screenName==='home'}>Home</a>
        <a href='/ea/admin/tables/' class:active={screenName==='tables'}>Tables</a>
        <a href='/ea/admin/users/' class:active={screenName==='users'}>Users</a>
    </nav>
</div>

<svelte:component this={screen} />


