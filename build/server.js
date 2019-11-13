"use strict"
// @ts-check
const cp = require('child_process');
const path = require('path');

/**
 * @type {import('child_process').ChildProcess}
 */
let activeServer;

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'out', 'server', 'index.mjs');

function createServer() {
    const spawn = () => {
        if (activeServer) {
            console.log('Only one server active at a time');
            return Promise.resolve();
        }
        activeServer = cp.spawn("node", ["--experimental-modules", INDEX], { stdio: 'inherit' });
        return Promise.resolve();
    }

    spawn.taskName = 'spawn-server';
    spawn.displayName = 'spawn-server';
    return spawn;
}

function updateServer() {
    const update = () => {
        if (activeServer) {
            activeServer.kill();
            activeServer = undefined;
            return createServer()();
        }
        return Promise.resolve();
    }

    update.taskName = 'update-server';
    update.displayName = 'update-server';
    return update;
}

exports.createServer = createServer;
exports.updateServer = updateServer;