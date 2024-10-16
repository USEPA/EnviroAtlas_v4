<script>
import { admin_path } from 'src/stores/general.js';
import { onMount } from 'svelte';
import * as utilities from '@usepa-ngst/utilities';

let defaultPath = 'topics';
let screen;
let screenName;
let isMounted = false;

$: $admin_path, loadPath();

onMount(async () => {
    isMounted = true;
    await loadPath();
});

async function loadPath() {
    if (!isMounted) return;
    //using relativeURLfactory so we can get rid of any ? or #
    //note: get rid of leading/trailing / relativeURLfactory adds to pathname
    let adminPath = utilities.relativeURLfactory($admin_path);

    let path = adminPath.pathname.replace(/^\//,'').replace(/\/$/,'');
    path = path.replace(/tables(\/)?/,'') || defaultPath;
    console.log(path);

    // Note have to explicity state import instead of using say import(variable)
    // because rollup won't find the import
    if (path==='topics') {
        screen = (await import('src/pages/admin/tables/topics.svelte')).default;
        screenName = 'topics';
    } else if (path==='sub_topics') {
        screen = (await import('src/pages/admin/tables/sub_topics.svelte')).default;
        screenName = 'sub_topics';
    } else  {
        screen = (await import('src/components/NotFound.svelte')).default;
        screenName = '';
    }

}

</script>

<style>
    nav {
        background-color: #0066CC;
        grid-area: menu;
        padding:.5em .5em .5em .5em;
    }
    nav a {
        color:white;
        display:block;
        padding:.25em .5em;
        font-weight:bold;
        text-decoration:none;
    }
    nav a.active {
    	background-color:#ffffff;
    	color:#0066CC;
    }
    nav a:hover {
        text-decoration:underline;
    }

    .content {
        grid-area: content;
        padding:1em;
    }

    .grid {
        display: grid;
        height:100vh;
        gap: 0em;
        grid-template-columns: auto 1fr;
        grid-template-areas:
                "menu content";
    }

</style>

<div class='grid'>
    <nav class='menu'>
        <a href='/ea/admin/tables/topics' class:active={screenName==='topics'}>Topics</a>
        <a href='/ea/admin/tables/sub_topics' class:active={screenName==='sub_topics'}>Sub Topics</a>
    </nav>
    <div class='content'>
        <svelte:component this={screen} />
    </div>
</div>
