import { Express, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import octokit from '@octokit/rest'
import { api } from '../api';
import { oauth_cookie } from './constants';
import { graphql as IGraphQL } from '@octokit/graphql/dist-types/types';
import graphql from '@octokit/graphql';

interface Repo {
    name: string;
    owner: {
        login: string
    }
}

enum ApiType {
    graph,
    rest
}

type GraphApiAcceptor<T extends ParamsDictionary> = (req: Request<T>, res: Response, api: IGraphQL) => void;
type RestApiAcceptor<T extends ParamsDictionary> = (req: Request<T>, res: Response, api: octokit) => void;


class Github {
    constructor(service: Express) {
        service.get('/api/repos', (req, res) => this.getApi(req, res, ApiType.rest, (req, res, api) => this.getRepos(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/issues', (req, res) => this.getApi(req, res, ApiType.graph, (req, res, api) => this.getIssues(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/issues/timeline', (req, res) => this.getApi(req, res, ApiType.graph, (req, res, api) => this.getIssuesTimeline(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/labels', (req, res) => this.getApi(req, res, ApiType.rest, (req, res, api) => this.getLabels(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/tags', (req, res) => this.getApi(req, res, ApiType.rest, (req, res, api) => this.getTags(req, res, api)));
    }

    private getApi<T extends ParamsDictionary>(req: Request<T>, res: Response, type: ApiType.graph, next: GraphApiAcceptor<T>): void;
    private getApi<T extends ParamsDictionary>(req: Request<T>, res: Response, type: ApiType.rest, next: RestApiAcceptor<T>): void;
    private getApi<T extends ParamsDictionary>(req: Request<T>, res: Response, type: ApiType, next: GraphApiAcceptor<T> | RestApiAcceptor<T>): void {
        const token = req.cookies ? req.cookies[oauth_cookie] : undefined;
        if (!token) {
            res.status(403);
            return;
        }

        switch (type) {
            case ApiType.rest:
                const rest = new octokit({ auth: token });
                (next as RestApiAcceptor<T>)(req, res, rest);
                break;
            case ApiType.graph:
                const graph = graphql.graphql.defaults({
                    headers: {
                        authorization: `token ${token}`
                    }
                });
                (next as GraphApiAcceptor<T>)(req, res, graph);
                break;
        }
    }

    private async getRepos(req: Request<ParamsDictionary>, res: Response, api: octokit): Promise<void> {
        const repos: octokit.Response<Repo[]> = await api.repos.list({ per_page: 100 });
        res.send(repos.data.map(r => ({ owner: r.owner.login, name: r.name })) as api.getReposResponse);
    }

    private async getIssues(req: Request<{ owner: string, name: string }>, res: Response, api: IGraphQL): Promise<void> {
        const { owner, name } = req.params;
        const labels = req.query.labels as string;
        const decodedLabels = labels ? decodeURIComponent(labels) : undefined

        let queryString = `repo:${owner}/${name} is:open is:issue`;

        if (decodedLabels) {
            queryString += decodedLabels.split(',').reduce((p, l) => p + ` label:\\"${l}\\"`, '');
        }

        const { search } = await api(`
            query {
                search(type:ISSUE, query:"${queryString}") {
                    issueCount
                }
            }
        `) as { search: { issueCount: number } };

        res.send({ count: search.issueCount } as api.getIssuesResponse);
    }

    private async getIssuesTimeline(req: Request<{ owner: string, name: string }>, res: Response, api: IGraphQL): Promise<void> {
        const { owner, name } = req.params;
        const labels = req.query.labels as string;
        const segments = Number(req.query.segments as string);
        const start = new Date(req.query.start as string);
        const end = new Date(req.query.end as string);

        const step = Math.round((end.getTime() - start.getTime()) / segments);

        const timeStamps: string[] = [];
        for (let i = 0; i <= segments; i++) {
            timeStamps.push(new Date(start.getTime() + (i * step)).toISOString().replace(/\.\d{3}\w$/, ''));
        }

        const decodedLabels = labels ? decodeURIComponent(labels) : undefined

        let queryString = `repo:${owner}/${name} is:issue`;

        if (decodedLabels) {
            queryString += decodedLabels.split(',').reduce((p, l) => p + ` label:\\"${l}\\"`, '');
        }

        res.send(await splitTimelineQuery(timeStamps, queryString, api));
    }

    private async getLabels(req: Request<{ owner: string, name: string }>, res: Response, api: octokit): Promise<void> {
        const { owner, name } = req.params;
        const labels = await api.issues.listLabelsForRepo({ owner, repo: name, per_page: 100 });
        res.send(labels.data.map(r => ({ name: r.name, color: r.color })) as api.getLabelsResponse);
    }

    private async getTags(req: Request<{ owner: string, name: string }>, res: Response, api: octokit): Promise<void> {
        const { owner, name } = req.params;
        const labels = await api.repos.listReleases({ owner, repo: name, per_page: 100 });
        res.send(labels.data.map(r => ({ name: r.name, date: r.published_at })) as api.getTagsResponse);
    }
}

async function splitTimelineQuery(timeStamps: Array<string>, queryString: string, api: IGraphQL): Promise<api.getIssuesTimelineResponse> {
    const queryTimes: Array<Array<string>> = []
    const step = 50;
    let i = 0;
    while ((i + 1) * step < timeStamps.length) {
        queryTimes.push(timeStamps.slice(i * step, ((i + 1) * step) - 1));
        i++;
    }
    if (i * step !== timeStamps.length - 1) {
        queryTimes.push(timeStamps.slice(i * step, timeStamps.length - 1));
    }

    const responses = await Promise.all(queryTimes.map(async t => {
        const query = `query {
            ${t.map((time, i) => `
                closed${i}: search(type:ISSUE, query:"${queryString} is:closed closed:>${time} created:<${time}") {
                    issueCount
                }
                open${i}: search(type:ISSUE, query:"${queryString} is:open created:<${time}") {
                    issueCount
                }`)}
            }
        `;
        const response = await api(query) as { [key: string]: { issueCount: number } };
        return t.map((v, i) => {
            return { time: v, count: response[`closed${i}`].issueCount + response[`open${i}`].issueCount };
        });
    }));

    return responses.reduce((p, c) => p.concat(...c), []) as api.getIssuesTimelineResponse;
}

export function createGithub(server: Express): void {
    new Github(server);
}
