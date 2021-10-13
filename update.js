const utils = require('./utils/utils');
const scraping = require('./scraping');

const update = async (a) => {
  await scraping.update('yoopies', a);
};

update(process.env.A);
