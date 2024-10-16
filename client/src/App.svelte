<script>
    import page from 'page';
    import { admin_path} from 'src/stores/general.js';

    let locationUrl = new URL(window.location);

    let current;
    let currentName;

    // Map routes to page. If a route is hit the current
    // reference is set to the route's component

    page('/ea/public/*', async function (ctx) {
        current = (await import('src/pages/Public.svelte')).default;
        currentName = 'public';
    });
    page('/ea/client/*', async function (ctx) {
        current = (await import('src/pages/Public.svelte')).default;
        currentName = 'public';
    });
    //add these redirects for vite de server. IIS already does the redirect
    page.redirect('/ea/public', '/ea/public/');
    page.redirect('/ea/client', '/ea/client/');

    page('/ea/admin/*', async function (ctx) {
//        console.log(ctx);
        let path = ctx.pathname.replace(/\/ea\/admin\//,'');
        //get rid of trailing slash
        path = path.replace(/\/$/,'');
        $admin_path = path;
        //Don't want to keep binding base admin component everytime they click client side admin route
        //Just want to change the path and reload individual admin page/screen
        if (currentName !== 'admin') {
            let Admin = await import('src/pages/admin/Index.svelte');
            current = Admin.default;
        }
        currentName = 'admin';
    });
    page.redirect('/ea/admin', '/ea/admin/');

    // activate router
    page.start();

</script>

<svelte:component this={current} />