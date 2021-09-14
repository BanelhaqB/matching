const utils = require('./utils/utils');
const _ = require('lodash');
const Cron = require('cron').CronJob;

const appCron = async (type, startMin) => {
  var dataclipsJob = new Cron(
    `${startMin} * * * *`,
    async () => {
      console.log('-----------------------');
      console.log('prospects...');
      await utils.dataclip('prospects');
      console.log('prospects OK!');

      console.log('teachers...');
      await utils.dataclip('teachers');
      console.log('teachers OK!');

      console.log('cours...');
      await utils.dataclip('cours');
      console.log('cours OK!');

      console.log('waiting...');
      await utils.dataclip('waiting');
      console.log('waiting OK!');
      console.log('-----------------------');
      console.log("-- Everthing's OK 👌 --");
      const date = new Date()
        .toISOString()
        .replace('T', ' ')
        .replace('.', ' |');
      console.log(date);
      console.log('-----------------------');
    },
    null,
    true,
    'Europe/Paris'
  );

  switch (type) {
    case 'dataclips':
      dataclipsJob.start();
      break;
    default:
      console.log('Aucun cron pour cette fonctionnalité pour le moment');
      break;
  }
};

console.log(
  `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
);

appCron(process.env.CRON, process.env.START);
