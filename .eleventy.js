// Plugins
const pluginPWA = require('eleventy-plugin-pwa');
const inclusiveLangPlugin = require("@11ty/eleventy-plugin-inclusive-language");

// Transforms
const htmlMinTransform = require('./src/transforms/html-min-transform.js');

// Libraries
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

// Data extensions
const yaml = require("js-yaml");

// Create a helpful production flag.
const isProduction = process.env.NODE_ENV === 'production';

module.exports = config => {

  // Pass static assets through to build folder.
  config.addPassthroughCopy({'src/assets/static': 'assets'});

  // Markdown overrides.
  let markdownLibrary = markdownIt({
    html: true,
    xhtmlOut: true
  }).use(markdownItAnchor, {
    level: 1
  });
  config.setLibrary("md", markdownLibrary);

  // Add yaml support for data files.
  config.addDataExtension("yaml", contents => yaml.load(contents));

  // Check for inclusive language.
  config.addPlugin(inclusiveLangPlugin, {
    templateFormats: ["md","html"],
    words: "crazy,insane,lame,simply,obviously,basically,of course,clearly,just,everyone knows,however,easy"
  });

  // If building for the production environment...
  if (isProduction) {

    // Minify HTML
    config.addTransform('htmlmin', htmlMinTransform);

    // Configure progressive web app.
    config.addPlugin(pluginPWA);
    config.addPassthroughCopy('./src/manifest.webmanifest');

    // Passthrough .htaccess Apache configuration.
    config.addPassthroughCopy('./src/.htaccess');
  }

  // Configure 11ty to use the .eleventyignore instead of .gitignore to enable
  // inlining of compiled critical.css.
  config.setUseGitIgnore(false);

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
