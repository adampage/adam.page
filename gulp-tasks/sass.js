const {dest, src} = require('gulp');
const cleanCSS = require('gulp-clean-css');
const sassProcessor = require('gulp-sass');

// Use canonical Sass to compile.
sassProcessor.compiler = require('sass');

// Create a helpful production flag.
const isProduction = process.env.NODE_ENV === 'production';

// Take the arguments passed in from Gulp’s `dest()` method and determine where
// its output file should go.
const calculateOutput = ({history}) => {

  // By default, we’ll assume the CSS file should be loaded as its own request.
  let response = './dist/assets';

  // If the source filename has been identified as critical, then compile
  // it into `src/_includes` so that templates can inline it with <style>.
  const isCritical = history[0].includes('/critical/');

  if (isCritical) {
    response = './src/_includes/css';
  }

  return response;
};

// Process every source Sass file and caculate their output.
const sass = () => {
  return src('./src/assets/scss/{critical,stylesheets}/*.scss')
    .pipe(sassProcessor().on('error', sassProcessor.logError))
    .pipe(
      cleanCSS(
        isProduction
          ? {
              level: 2
            }
          : {}
      )
    )
    .pipe(dest(calculateOutput, {sourceMaps: !isProduction}));
};

module.exports = sass;
