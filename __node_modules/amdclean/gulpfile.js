/*
  AMDClean Build File
*/
var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  jshint = require('gulp-jshint'),
  jasmine = require('gulp-jasmine'),
  rename = require("gulp-rename");

gulp.task('minify', function() {
  gulp.src(['src/amdclean.js'])
    .pipe(uglify())
    .pipe(rename('amdclean.min.js'))
    .pipe(gulp.dest('build/'));
});

gulp.task('lint', function() {
  gulp.src('src/amdclean.js')
    .pipe(jshint({
      'evil': true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
  gulp.src('test/specs/convert.js')
      .pipe(jasmine());
});

// The default task (called when you run `gulp`)
gulp.task('default', function() {
  gulp.run('lint', 'test', 'minify');
});

gulp.task('amdclean-watch', function() {
  gulp.watch('src/amdclean.js', function(event) {
    gulp.run('lint', 'test', 'minify');
  });
});