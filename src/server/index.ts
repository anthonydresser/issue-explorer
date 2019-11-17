import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import url from 'url';
import fs from 'fs';
import qs from 'querystring';
import { createGithub } from './github';
import { oauth_cookie } from './constants';
import request from 'request';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const frontEnd = path.join(__dirname, '..', 'frontend');
const index = path.join(frontEnd, 'index.html');

const creds: { clientid: string, clientsecret: string } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'creds.json')).toString());

const port = process.env['PORT'] || 3000;

const server = express();


server.use((req, res, next) => {
	console.log('Request for', req.url, 'received at', Date.now());
	next();
});
server.use(cookieParser());

createGithub(server);
server.get('/', (req, res) => {
	// if we don't have a cookie token request one
	const token = req.cookies ? req.cookies[oauth_cookie] : undefined;
	if (!token) {
		res.redirect(`http://github.com/login/oauth/authorize?client_id=${creds.clientid}&redirect_uri=http://localhost:3000/oauth_redirect`);
		return;
	}
	res.sendFile(index);
});
server.use(express.static(frontEnd, { extensions: ['mjs'] }));

server.get<{ code: string }>('/oauth_redirect', (req, res) => {
	const code = req.query.code;
	if (!code) {
		res.redirect('/');
		return;
	}
	request.post(`https://github.com/login/oauth/access_token?client_id=${creds.clientid}&redirect_uri=http://localhost:3000/oauth_redirect&client_secret=${creds.clientsecret}&code=${code}`, undefined, (error, response, body) => {
		const qsBody = qs.parse(body);
		const token = qsBody.access_token;
		if (token) {
			res.cookie(oauth_cookie, token);
		}
		res.redirect('/');
	});
});

server.listen(port, () => console.log('server listening on port', port));
