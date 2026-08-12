export class SearchController {
    constructor() {
        this.q = {
            query: null,
            filter: null,
            num: 20,
            sortOrder: "desc",
            sortField: null,
            start: 1
        };
        this.scope = "group:6ff29ebf559b405caee1e15fc69209aa";
        this.types = 'type:"Map Service" OR type:"Feature Service" OR type:"Image Service"';
        this.qText = "";
        this.loading = false;
        this.error = null;
        this.searchResults = [];
        this.total = 0;
        this.nextStart = -1;
        this.response = null;
    }
}