"use strict"
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const gulp = require('gulp');
const path = require('path');
const filter = require('gulp-filter');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const frontendSource = 'src/frontend/**/*.{tsx,ts}';
const frontendResources= 'src/frontend/**/*.{html,css,svg}';
const frontendSass = 'src/frontend/**/*.scss';
const frontendConfig = 'src/frontend/tsconfig.json';

const serverSources = 'src/server/**/*.ts'
const serverResources = 'src/server/**/*.{html,css,svg}'
const serverConfig = 'src/server/tsconfig.json'

function compileServer() {
    const jsFilter = filter('**/*.js', { restore: true });
    const task = () => {
        const resources = gulp.src(serverResources, { base: 'src' })
            .pipe(gulp.dest('out'));
        const sources = gulp.src(serverSources, { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(typescript(serverConfig))
        .pipe(sourcemaps.write('.', {
            sourceRoot: path.join(__dirname, '..', 'src')
        }))
        .pipe(jsFilter)
        .pipe(rename({
            extname: '.mjs'
        }))
        .pipe(jsFilter.restore)
        .pipe(gulp.dest('out'));
        return merge(resources, sources);
    };
    task.taskName = 'compile-server'
    task.displayName = 'compile-server'
    return task;
}

function compileFrontEnd() {
    const task = () => {
        const resources = gulp.src(frontendResources, { base: 'src' })
            .pipe(gulp.dest('out'));
        const sasses = gulp.src(frontendSass, { base: 'src' })
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('out'));
        const sources = gulp.src(frontendSource, { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(typescript(frontendConfig))
        .pipe(sourcemaps.write())
        .pipe(rename({
            extname: '.mjs'
        }))
        .pipe(gulp.dest('out'));
        return merge(resources, sources, sasses);
    };
    task.taskName = 'compile-frontend'
    task.displayName = 'compile-frontend'
    return task;
}

exports.frontendSource = frontendSource;
exports.frontendResources = frontendResources;
exports.frontendSass = frontendSass;
exports.serverSources = serverSources;
exports.serverResources = serverResources;
exports.compileServer = compileServer;
exports.compileFrontEnd = compileFrontEnd;
