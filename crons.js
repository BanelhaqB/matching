const utils = require('./utils/utils');
const scraping = require('./scraping');
const _ = require('lodash');
const Cron = require('cron').CronJob;

// const appCron = async (type, startMin) => {
//   var dataclipsJob = new Cron(
//     `${startMin} * * * *`,
//     async () => {
//       console.log('-----------------------');
//       console.log('prospects...');
//       await utils.dataclip('prospects');
//       console.log('prospects OK!');

//       console.log('teachers...');
//       await utils.dataclip('teachers');
//       console.log('teachers OK!');

//       console.log('cours...');
//       await utils.dataclip('cours');
//       console.log('cours OK!');

//       console.log('waiting...');
//       await utils.dataclip('waiting');
//       console.log('waiting OK!');
//       console.log('-----------------------');
//       console.log("-- Everthing's OK 👌 --");
//       const date = new Date()
//         .toISOString()
//         .replace('T', ' ')
//         .replace('.', ' |');
//       console.log(date);
//       console.log('-----------------------');
//     },
//     null,
//     true,
//     'Europe/Paris'
//   );

//   var XMLJob = new Cron(
//     `${startMin} 20 * * 2`,
//     async () => {
//       console.log('-----------------------');
//       await scraping.update('yoopies', 'sitemap');
//       console.log('-----------------------');
//       console.log('-- Sitemaps update OK 👌 --');

//       const date = new Date()
//         .toISOString()
//         .replace('T', ' ')
//         .replace('.', ' |');
//       console.log(date);
//       console.log('-----------------------');
//     },
//     null,
//     true,
//     'Europe/Paris'
//   );

//   var updateYoopiesJob = new Cron(
//     `${startMin} 10 * * 1`,
//     async () => {
//       console.log('-----------------------');
//       await scraping.update('yoopies', 'data');
//       console.log('-----------------------');
//       console.log('-- New Data scraped 🎉 --');

//       const date = new Date()
//         .toISOString()
//         .replace('T', ' ')
//         .replace('.', ' |');
//       console.log(date);
//       console.log('-----------------------');
//     },
//     null,
//     true,
//     'Europe/Paris'
//   );

//   switch (type) {
//     case 'dataclips':
//       dataclipsJob.start();
//       console.log(
//         `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
//       );
//       break;
//     case 'sitemap':
//       XMLJob.start();
//       console.log(
//         `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
//       );
//       break;
//     case 'data':
//       updateYoopiesJob.start();
//       console.log(
//         `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
//       );
//       break;
//     default:
//       console.log('Aucun cron pour cette fonctionnalité pour le moment');
//       break;
//   }
// };

const appCron = async (type, startMin) => {
  switch (type) {
    case 'dataclips':
      new Cron(
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

      console.log(
        `Cron : ${process.env.CRON} - ON - Running every hours at ${process.env.START}min`
      );
      break;
    case 'sitemap':
      new Cron(
        `${startMin} 2 * * 1`,
        async () => {
          console.log('-----------------------');
          await scraping.update('yoopies', 'sitemap');
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
    case 'data':
      new Cron(
        `${startMin} 3 * * 1`,
        async () => {
          console.log('-----------------------');
          await scraping.update('yoopies', 'data');
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
    default:
      console.log('Aucun cron pour cette fonctionnalité pour le moment');
      break;
  }
};

appCron(process.env.CRON, process.env.START);
