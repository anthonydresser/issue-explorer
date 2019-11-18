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
        service.get<{ owner: string, name: string, labels: string }>('/api/repo/:owner/:name/issues', (req, res) => this.getApi(req, res, ApiType.graph, (req, res, api) => this.getIssues(req, res, api)));
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
            case ApiType.graph:
                const graph = graphql.graphql.defaults({
                    headers: {
                        authorization: `token ${token}`
                    }
                });
                (next as GraphApiAcceptor<T>)(req, res, graph);
        }
    }

    private async getRepos(req: Request<ParamsDictionary>, res: Response, api: octokit): Promise<void> {
        const repos: octokit.Response<Repo[]> = await api.repos.list({ per_page: 100 });
        res.send(repos.data.map(r => ({ owner: r.owner.login, name: r.name })) as api.getReposResponse);
    }

    private async getIssues(req: Request<{ owner: string, name: string, labels: string }>, res: Response, api: IGraphQL): Promise<void> {
        const { owner, name } = req.params;
        const { labels } = req.query;
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

export function createGithub(server: Express): void {
    new Github(server);
}
