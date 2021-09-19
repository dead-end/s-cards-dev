var ghpages = require('gh-pages');

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'main',
    repo: 'https://github.com/dead-end/s-cards.git',
  },
  () => {
    console.log('Deploy Complete!');
  }
);
