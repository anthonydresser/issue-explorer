import express from 'express';
import path from 'path';
import url from 'url';
import { addModules } from './modules';
import { createGithub } from './github';

const port = process.env['PORT'] || 3000;

const server = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const frontEnd = path.join(__dirname, '..', 'frontend');
const index = path.join(frontEnd, 'index.html');

server.use((req, res, next) => {
  console.log('Request for', req.url, 'received at', Date.now());
  next();
});

addModules(server);
createGithub(server);
server.use(express.static(frontEnd, { extensions: ['mjs'] }));
server.get('/', (req, res) => res.sendFile(index));

server.listen(port, () => console.log('server listening on port', port));
