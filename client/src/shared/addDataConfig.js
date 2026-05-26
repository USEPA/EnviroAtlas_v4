export const addDataConfig = {
    myOrg: 'https://epa.maps.arcgis.com',
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
        },
        {
            name: "ArcGIS Online",
            value: "agol",
        },
    ],
    typeOptions: [
        {
            name: "Map Service",
            value: "map_service",
        },
        {
            name: "Feature Service",
            value: "feature_service",
        },
        {
            name: "Image Service",
            value: "image_service",
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
            sortOrder: "asc",
            selected: "true"
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
            sortOrder: "desc"
        },
        {
            name: "Date",
            value: "modified",
            sortOrder: "desc"
        },
    ]
}