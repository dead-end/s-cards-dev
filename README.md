# S-Cards-Dev

The development project for s-cards.

# Setup s-cards-dev

## Setup the svelte project

Get the svelte template, remove the typescript and update the dependencies.

```bash
npx degit sveltejs/template s-cards-dev

cd s-cards-dev

rm scripts/setupTypeScript.js

npm install
```

## Add configuration for the js formatter.

Create the a javascript formatter file: `prettier.config.js` (see: https://prettier.io/docs/en/configuration.html for details).

```bash
module.exports = {
 singleQuote: true,
};
```

## Deploy to github pages

Adding a task to deploy the deploy artifacts to github pages. Create a github project `s-cards` and configure
github pages for the root path.

Install `gh-pages` (see: https://blog.stranianelli.com/svelte-et-github-english/ for details).

```bash
npm install gh-pages --save-dev
```

Change all links in the `public/index.html` to relative links.

Add the deploy task to the `package.json` file.

```js
    "deploy": "node ./gh-pages.js"
```

Create a deploy script.

```js
var ghpages = require('gh-pages');

ghpages.publish(
  'public',
  {
    branch: 'main',
    repo: 'https://github.com/dead-end/s-cards.git'
  },
  () => {
    console.log('Deploy Complete!');
  }
);
```

## Usage

```bash
npm run build

npm run deploy
```

## Configuration

Backup: `https://api.github.com/repos/dead-end/backup/contents/`

File: `ipad`
