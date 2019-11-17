import { Express, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import octokit from '@octokit/rest'
import { api } from '../api';
import { oauth_cookie } from './constants';

interface Repo {
    name: string;
    owner: {
        login: string
    }
}

class Github {
    constructor(service: Express) {
        service.get('/api/repos', (req, res) => this.getApi(req, res, (req, res, api) => this.getRepos(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/issues', (req, res) => this.getApi(req, res, (req, res, api) => this.getIssues(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/labels', (req, res) => this.getApi(req, res, (req, res, api) => this.getLabels(req, res, api)));
        service.get<{ owner: string, name: string }>('/api/repo/:owner/:name/tags', (req, res) => this.getApi(req, res, (req, res, api) => this.getTags(req, res, api)));
    }

    private getApi<T extends ParamsDictionary>(req: Request<T>, res: Response, next: (req: Request<T>, res: Response, api: octokit) => any): void {
        const token = req.cookies ? req.cookies[oauth_cookie] : undefined;
        if (!token) {
            res.status(403);
            return;
        }

        const api = new octokit({ auth: token });
        next(req, res, api);
    }

    private async getRepos(req: Request<ParamsDictionary>, res: Response, api: octokit): Promise<void> {
        const repos: octokit.Response<Repo[]> = await api.repos.list({ per_page: 100 });
        res.send(repos.data.map(r => ({ owner: r.owner.login, name: r.name })) as api.getReposResponse);
    }

    private async getIssues(req: Request<{ owner: string, name: string }>, res: Response, api: octokit): Promise<void> {
        throw 'not implemented';
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
