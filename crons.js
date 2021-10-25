const utils = require('./utils/utils');
const yoopies = require('./yoopies');
const voscours = require('./voscours');
const dataclips = require('./dataclips');
const Cron = require('cron').CronJob;

const appCron = async (type, startMin) => {
  switch (type) {
    case 'dataclips':
      new Cron(
        `${startMin} * * * *`,
        async () => {
          console.log('-----------------------');
          console.log('prospects...');
          await dataclips.getDataclip('prospects');
          console.log('prospects OK!');

          console.log('teachers...');
          await dataclips.getDataclip('teachers');
          console.log('teachers OK!');

          console.log('cours...');
          await dataclips.getDataclip('cours');
          console.log('cours OK!');

          console.log('waiting...');
          await dataclips.getDataclip('waiting');
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

      console.log(
        `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
      );
      break;
    case 'sitemap-yoopies':
      new Cron(
        `${startMin} 2 * * 1`,
        async () => {
          console.log('-----------------------');
          await yoopies.update('sitemap');
          console.log('-----------------------');
          console.log('-- Sitemaps update OK 👌 --');

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
      console.log(`Cron : ${process.env.CRON} - ON ✅`);
      console.log(`Running every Monday at : 2h${process.env.START}min`);
      break;
    case 'data-yoopies':
      new Cron(
        `${startMin} 3 * * 1`,
        async () => {
          console.log('-----------------------');
          await yoopies.update('data');
          console.log('-----------------------');
          console.log('-- New Data scraped 🎉 --');

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
      console.log(`Cron : ${process.env.CRON} - ON ✅`);
      console.log(`Running every Monday at : 10h${process.env.START}min`);
      break;
    case 'sitemap-voscours':
      new Cron(
        `${startMin} 4 * * 1`,
        async () => {
          console.log('-----------------------');
          await voscours.update('sitemap');
          console.log('-----------------------');
          console.log('-- Sitemaps update OK 👌 --');

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
      console.log(`Cron : ${process.env.CRON} - ON ✅`);
      console.log(`Running every Monday at : 4h${process.env.START}min`);
      break;
    case 'contact-voscours':
      new Cron(
        `${startMin} 7 * * 1`,
        async () => {
          console.log('-----------------------');
          await voscours.update('contact');
          console.log('-----------------------');
          console.log('-- New profils contacted 🎉 --');

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
      console.log(`Cron : ${process.env.CRON} - ON ✅`);
      console.log(`Running every Monday at : 7h${process.env.START}min`);
      break;
    case 'messagerie-voscours':
      new Cron(
        `${startMin} 3 * * 2`,
        async () => {
          console.log('-----------------------');
          await voscours.update('messagerie');
          console.log('-----------------------');
          console.log('-- Emails scraped 🎉 --');

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
      console.log(`Cron : ${process.env.CRON} - ON ✅`);
      console.log(`Running every Tuesday at : 3h${process.env.START}min`);
      break;
    default:
      console.log('Aucun cron pour cette fonctionnalité');
      break;
  }
};

appCron(process.env.CRON, process.env.START);
