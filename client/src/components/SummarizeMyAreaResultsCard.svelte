<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";

    export let inputHeaders = [];
    export let inputData = [];
    export let outputHeaders = [];
    export let outputData = [];

    let inputTableContainer;
    let outputTableContainer;

    function renderTable(container, headers, data) {
        d3.select(container).selectAll("*").remove();

        let table = d3.select(container).append("table");

        table
            .append("thead")
            .append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .attr("class", (d) => d.cl)
            .text((d) => d.head);

        table
            .append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .selectAll("td")
            .data((row) => headers.map((header) => row[header.d]))
            .enter()
            .append("td")
            .html((cell) => cell);
    }

    onMount(() => {
        renderTable(inputTableContainer, inputHeaders, inputData);
        renderTable(outputTableContainer, outputHeaders, outputData);
    });
</script>

<calcite-card style="padding-bottom: 8px">
    <div
        id="gridded-map-input-table-wrapper"
        class="table-wrapper"
        bind:this={inputTableContainer}
    ></div>
    <div
        id="gridded-map-output-table-wrapper"
        class="table-wrapper"
        bind:this={outputTableContainer}
    ></div>
</calcite-card>

<style>
    .table-wrapper :global(table tr:nth-of-type(odd)) {
        background-color: #f9f9f9;
        color: #141414
    }

    .table-wrapper :global(table tr:nth-of-type(even)) {
        background-color: #f0f0f0;
        color: #141414
    }

    .table-wrapper :global(table) {
        border-collapse: collapse;
        border-spacing: 0;
    }

    .table-wrapper :global(table td) {
        border-bottom: 1px solid #d0d0d0;
    }

    #gridded-map-input-table-wrapper {
        padding-bottom: 8px;
        width: 100%
    }

    #gridded-map-input-table-wrapper :global(table) {
        width: 100%;
    }

    #gridded-map-output-table-wrapper :global(th) {
        padding: 4px 6px;
        border-bottom: 1px solid #d0d0d0;
    }

    #gridded-map-output-table-wrapper {
        text-align: right;
        width: 100%
    }

    #gridded-map-output-table-wrapper :global(table) {
        width: 100%;
    }
</style>