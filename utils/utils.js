let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const ObjectsToCsv = require('objects-to-csv');
const csvParser = require('csv-parser');
const fs = require('fs');
const { resolve } = require('path');
const scrap = require('../scrap');

// cheerio = cheerioAdv.wrap(cheerio);

// -----------------------------------------------------------------------
// ----------------------------   UTILS    -------------------------------
// -----------------------------------------------------------------------

exports.convertToCSV = async (obj, path) => {
  const csv = new ObjectsToCsv(obj);

  await csv.toDisk(path, { append: true });
};

exports.convertToCSVUpdate = async (obj, path) => {
  const csv = new ObjectsToCsv(obj);

  await csv.toDisk(path, { append: false });
};

exports.readCSV = async (path, separator) => {
  return new Promise((resolve) => {
    const results = [];

    fs.createReadStream(path)
      .pipe(csvParser({ separator }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // console.log(`${results.length} itmes readed`);
        resolve(results);
      });
  });
};

exports.scrapTemplate = async (url, fct, resolve, config) => {
  scrap.get({
    url,
    referer: url,
    onSuccess: async ($, response, html, config) => {
      if (response.statusCode !== 200) {
        console.error(
          `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
        );
        console.log(response.error, response.stack);
        resolve();
        return;
      }

      let data = [];

      data = await fct($, response, html, config, data);

      // console.log(html);

      resolve(html);
    },
    onError: (error) => {
      console.log('error:', error);
      resolve();
    },
  });
};

exports.logProgress = (index, totale, name, startAt) => {
  const pourcentage = Math.round((index / totale) * 100);

  console.log(
    `${name} : ${index}/${totale} ----- ${pourcentage}% ----- (start at : ${startAt})`
  );
};

exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.convertSubject = (sub) => {
  let val = '';
  switch (sub) {
    case 'Mathématiques':
      val = 'MATHS';
      break;
    case 'Français':
      val = 'LITTERATURE';
      break;
    case 'Anglais':
      val = 'ENGLISH';
      break;
    case 'Multi-matières (primaire uniquement)':
      val = 'HOMEWORK_HELP';
      break;
    case 'Physique-chimie':
      val = 'PHYSICS_CHEMISTRY';
      break;
    default:
      break;
  }

  return val;
};

exports.convertdispo = (dispo) => {
  let val = '';
  if (dispo.includes('Lundi')) {
    val = 'MONDAY';
  } else if (dispo.includes('Mardi')) {
    val = 'TUESDAY';
  } else if (dispo.includes('Mercredi')) {
    val = 'WEDNESDAY';
  } else if (dispo.includes('Jeudi')) {
    val = 'THURSDAY';
  } else if (dispo.includes('Vendredi')) {
    val = 'FRIDAY';
  } else if (dispo.includes('Samedi')) {
    val = 'SATURDAY';
  } else if (dispo.includes('Dimanche')) {
    val = 'SUNDAY';
  }
  return val;
};

exports.dispoMatch = (dispo1, dispo2) => {};

exports.distanceBetween = (lat1, lng1, lat2, lng2) => {
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;
  lng1 = (lng1 * Math.PI) / 180;
  lng2 = (lng2 * Math.PI) / 180;

  const dist =
    6371 *
    Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
    );

  return dist;
};

exports.dataclip = async (type) => {
  return new Promise(async (resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      await fs.writeFile(`data/dataclips/dataclip-${type}.csv`, html, (err) => {
        if (err) throw err;
      });
      // console.log(typeof html);
      resolve();
    };
    let idDataclip = '';
    switch (type) {
      case 'teachers':
        idDataclip = 'uxipvjjzpyuvvrguqnvmhvigmjpm';
        break;
      case 'cours':
        idDataclip = 'vumzpfstskwebkddnssfscydgwyj';
        break;
      case 'waiting':
        idDataclip = 'clsfedrroholiywgbvmjooabwjtw';
        break;
      case 'prospects':
        idDataclip = 'kqamppsccburqtvgllvyorprfukt';
        break;
      default:
        break;
    }

    await this.scrapTemplate(
      `https://data.heroku.com/dataclips/${idDataclip}.csv`,
      fct,
      resolve
    );
  });
};

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
