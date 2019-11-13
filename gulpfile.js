"use strict"
const gulp = require('gulp');
const server = require('./build/server');
const compile = require('./build/compile');
const rimraf = require('./build/utils').rimraf

gulp.task('compile', gulp.series(rimraf('out'), gulp.parallel(compile.compileFrontEnd(), compile.compileServer())));

gulp.task('watch', gulp.series(rimraf('out'), ['compile'], gulp.parallel(() => gulp.watch([compile.frontendSource, compile.frontendResources], compile.compileFrontEnd()), () => gulp.watch([compile.serverSources, compile.serverResources], compile.compileServer()))));

gulp.task('server', gulp.series(server.createServer(), () => gulp.watch('out/server/**', server.updateServer())))
