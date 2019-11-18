export namespace api {
    export type getReposResponse = { owner: string, name: string }[];

    export type getLabelsResponse = { name: string, color: string }[];

    export type getTagsResponse = { name: string, date: string }[];

    export type getIssuesResponse = { count: number };
}
