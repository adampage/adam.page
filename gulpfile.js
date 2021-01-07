const {parallel, watch} = require('gulp');

// Import all task configurations.
const sass = require('./gulp-tasks/sass.js');

// Define a method to watch source Sass files and run configured tasks.
const watcher = () => {
  watch(
    [
      './src/assets/scss/**/*.scss',
      '!./src/assets/scss/data/*.scss'
    ],
    {
      ignoreInitial: true
    },
    sass
  );
};

// Connect the watcher metehod to a Gulp `watch` task.
exports.watch = watcher;

// For the default `gulp` command, run each task in parallel.
exports.default = parallel(sass);
