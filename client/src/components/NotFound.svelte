<script>
    export let error;
</script>

<div class:hidden={error} >
    <div style="height:10em;display: flex;flex-direction: column;justify-content: center;align-items: center;text-align:center">
        <div style='margin-top:.5em'>
            <strong style='font-size:1.15em;color:red'>Page Not Found</strong>
        </div>
    </div>
</div>

{#if error}
<div style="color:red">
    <h4 >{error.head  || 'Enviro Atlas produced the following errors:' }</h4>
    <ul>
    {#each error.list || [] as item}
        <li>{item}</li>
    {/each}
    </ul>
</div>
{/if}