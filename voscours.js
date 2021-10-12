const utils = require('./utils/utils');
const _ = require('lodash');
const fs = require('fs').promises;
const scrap = require('./scrap');

const getSitemap = async () => {
  return new Promise(async (resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      await fs.writeFile(
        `data/voscours/sitemaps/sitemap-voscours.xml`,
        html,
        (err) => {
          if (err) throw err;
        }
      );

      console.log(`Voscours : sitemap -- is writted ✅`);
      resolve();
    };

    await utils.scrapTemplate(
      `https://www.voscours.fr/sitemap-anuncios.aspx?tipo=Profesores`,
      fct,
      resolve
    );
  });
};

const cleanXML = async (xml) => {
  return new Promise(async (resolve) => {
    const urls = [];

    const data = await fs.readFile(xml, 'utf8');

    let array = data
      .split('loc')
      .map((e) => e.trim().substring(1, e.trim().length - 2));

    array = _.filter(array, function (e) {
      return e[0] === 'h';
    });

    array = _.map(array, (e) => {
      return { id: e.split('-')[e.split('-').length - 1], url: e };
    });

    array = _.uniqBy(array, 'id');

    resolve(array);
  });
};

const getNew = async () => {
  const urls = await utils.readCSV(`data/voscours/urls/urls-voscours.csv`, ',');

  let oldURLS = await utils.readCSV(
    `data/voscours/data/data-voscours.csv`,
    ','
  );

  oldURLS = oldURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  const newURLS = _.filter(urls, (e) => {
    return !oldURLS.map((u) => u.id).includes(e.id);
  });

  await utils.convertToCSV(
    newURLS,
    `data/voscours/data/new/new-urls-${utils.getDayToday()}.csv`,
    true
  );

  console.log(`voscours : ${newURLS.length} new accounts 📥`);
};

// cleanXML('data/voscours/sitemaps/sitemap-voscours.xml');

const main = async () => {
  // await getSitemap();

  const urlsClean = await cleanXML(
    'data/voscours/sitemaps/sitemap-voscours.xml'
  );

  await utils.convertToCSV(
    urlsClean,
    'data/voscours/urls/urls-voscours.csv',
    true
  );
  console.log(urlsClean.length);

  await getNew();
};

main();
