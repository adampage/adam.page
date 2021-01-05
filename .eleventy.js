// Plugins
const pluginPWA = require('eleventy-plugin-pwa');

// Transforms
const htmlMinTransform = require('./src/transforms/html-min-transform.js');

// Libraries
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

// Data extensions
const yaml = require("js-yaml");

// Create a helpful production flag
const isProduction = process.env.NODE_ENV === 'production';

module.exports = config => {

  // Pass images through to build folder.
  config.addPassthroughCopy('./src/assets/');

  // Markdown overrides.
  let markdownLibrary = markdownIt({
    html: true,
    xhtmlOut: true
  }).use(markdownItAnchor, {
    level: 1
  });
  config.setLibrary("md", markdownLibrary);

  // Add yaml support for data files
  config.addDataExtension("yaml", contents => yaml.load(contents));

  // If in the production environment
  if (isProduction) {

    // Minify HTML
    config.addTransform('htmlmin', htmlMinTransform);

    // Configure progressive web app.
    config.addPlugin(pluginPWA);
    config.addPassthroughCopy('./src/manifest.webmanifest');

    // Passthrough .htaccess Apache configuration.
    config.addPassthroughCopy('./src/.htaccess');
  }

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist'
    }
  };
};
