# adam.page

⚠ _**This repository is in active development and is not production-ready.**_

I’m Adam Page, an accessibility-focused user experience designer and frontend
developer in Portland, Oregon, USA.  I use this repository to build & manage my
personal website at [http://adam.page](http://adam.page).  Please check it out!

## Development

adam.page is built with the static site generator
[Eleventy](https://www.11ty.dev/).  If you’re new to Eleventy, I recommend
[Piccalilli](https://piccalil.li/)’s online course [Learn Eleventy from
Scratch](https://piccalil.li/course/learn-eleventy-from-scratch/).

### Requirements

* A command line interface (e.g., operating system’s native terminal,
  [Hyper](https://hyper.is/), [iTerm](https://iterm2.com/))
* [Git](https://git-scm.com/), a version control system.
* [Node.js](https://nodejs.org/), a JavaScript runtime.

### Installation

1. Clone this repository.
2. Navigate into its root directory.
3. Run `npm install`.

### Running the website dynamically

1. Run `npm start`.
    * Note: `npm start` is an alias for `npm run start`.
2. Review the “Access URLs” in the output and view any of them in your web
   browser.
    * On the computer that is running the project, view the running website at
      [http://localhost:8080](http://localhost:8080).
    * On any device that is connected to the same local network, view the
      running website at the URL labeled “External”.

### Building the static website

1. Run `npm run build`.
2. The static files of the completed build will appear in the `dist` directory
   at the root.
   * All static HTML files in the build will have automatically been
     [minified](https://en.wikipedia.org/wiki/Minification_(programming)).

## License

This work may be adapted & shared under the terms of the [CC BY-NC-SA
4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International) license.
