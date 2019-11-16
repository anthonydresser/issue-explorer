import { Express, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import octokit from '@octokit/rest'
import fs from 'fs';
import path from 'path';
import url from 'url';
import { api } from '../api';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const creds: { creds: string } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'creds.json')).toString());

class Github {
    private readonly api = new octokit({ auth: creds.creds });

    constructor(service: Express) {
        service.get('/api/repos', (req, res) => this.getRepos(req, res))
    }

    private async getRepos(req: Request<ParamsDictionary>, res: Response): Promise<void> {
        const repos: octokit.Response<{ full_name: string }[]> = await this.api.repos.list({ affiliation: 'owner,collaborator,organization_member', visibility: 'all' });
        res.send(repos.data.map(r => ({ name: r.full_name,  })) as api.getReposResponse)
    }
}

export function createGithub(server: Express): void {
    new Github(server);
}
