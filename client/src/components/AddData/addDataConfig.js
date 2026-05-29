export const addDataConfig = {
    myOrg: 'https://epa.maps.arcgis.com',
    agol: 'https://www.arcgis.com/sharing/rest/search',
    scopeOptions: [
        {
            name: "EnviroAtlas Picks",
            value: "curated",
            selected: true,
            filter: "group:6ff29ebf559b405caee1e15fc69209aa"
        },
        {
            name: "EPA GeoPlatform Public Content",
            value: "myOrg",
            filter:"orgid:cJ9YHowT8TU7DUyn"
        },
        {
            name: "ArcGIS Online",
            value: "agol",
        },
    ],
    typeOptions: [
        {
            name: "Map Service",
            value: "Map Service",
        },
        {
            name: "Feature Service",
            value: "Feature Service",
        },
        {
            name: "Image Service",
            value: "Image Service",
        },
    ],
    sortOptions: [
        {
            name: "Relevance",
            value: "relevance",
            sortOrder: "asc"
        },
        {
            name: "Title",
            value: "title",
            sortOrder: "asc"
        },
        {
            name: "Owner",
            value: "owner",
            sortOrder: "asc"
        },
        {
            name: "Rating",
            value: "avgrating",
            sortOrder: "desc"
        },
        {
            name: "Views",
            value: "numviews",
            sortOrder: "desc",
            selected: "true"
        },
        {
            name: "Date",
            value: "modified",
            sortOrder: "desc"
        },
    ],
    itemsPerPage: 20,
}