const utils = require('./utils/utils');
const voscours = require('./voscours');

const update = async (a) => {
  await voscours.update(a);
};

update(process.env.A);
