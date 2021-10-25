const utils = require('./utils/utils');
const voscours = require('./voscours');
const yoopies = require('./yoopies');

const update = async (p, a) => {
  switch (p) {
    case 'voscours':
      await voscours.update(a);
      break;
    case 'yoopies':
      await yoopies.update(a);
      break;
    default:
      break;
  }
};

update(process.env.P, process.env.A);
