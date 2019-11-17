import { Express } from 'express';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const nodeModules = path.join(__dirname, '..', '..', 'node_modules');

export function addModules(server: Express): void {
    server.get('/preact', (req, res) => res.sendFile(path.join(nodeModules, 'preact', 'dist', 'preact.module.js')));
    server.get('/d3-selection', (req, res) => res.sendFile(path.join(nodeModules, 'd3-selection', 'dist', 'd3-selection.js')));
}
