let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const ObjectsToCsv = require('objects-to-csv');
const csvParser = require('csv-parser');
const fs = require('fs');
const { resolve } = require('path');
const scrap = require('../scrap');
const _ = require('lodash');

// cheerio = cheerioAdv.wrap(cheerio);

// -----------------------------------------------------------------------
// ----------------------------   UTILS    -------------------------------
// -----------------------------------------------------------------------

exports.convertToCSV = async (obj, path, newFile) => {
  const csv = new ObjectsToCsv(obj);

  await csv.toDisk(path, { append: !newFile });
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
    headers: config ? config.headers : '',
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

exports.converstYoopiesSubject = (s, l, i, m, hh) => {
  const val = [];
  if (s === 1) val.push('MATHS,PHYSICS_CHEMISTRY,BIOLOGY,SI');
  if (l === 1) val.push('LITTERATURE,ENGLISH');
  if (hh === 1) val.push('HOMEWORK_HELP');

  // console.log(val.join(','));
  return `[${val.join(',')}]`;
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
  if (dispo.includes('undi')) {
    val = 'MONDAY';
  } else if (dispo.includes('ardi')) {
    val = 'TUESDAY';
  } else if (dispo.includes('ercredi')) {
    val = 'WEDNESDAY';
  } else if (dispo.includes('eudi')) {
    val = 'THURSDAY';
  } else if (dispo.includes('endredi')) {
    val = 'FRIDAY';
  } else if (dispo.includes('amedi')) {
    val = 'SATURDAY';
  } else if (dispo.includes('imanche')) {
    val = 'SUNDAY';
  }
  return val;
};

exports.convertDay = (day) => {
  let val = '';
  switch (day) {
    case 'MONDAY':
      val = '1';
      break;
    case 'TUESDAY':
      val = '2';
      break;
    case 'WEDNESDAY':
      val = '3';
      break;
    case 'THURSDAY':
      val = '4';
      break;
    case 'FRIDAY':
      val = '5';
      break;
    case 'SATURDAY':
      val = '6';
      break;
    case 'SUNDAY':
      val = '7';
      break;
    default:
      break;
  }

  return val;
};

exports.convertdispoNumber = (dispo) => {
  let val = '';
  if (dispo.includes('undi')) {
    val = '1';
  } else if (dispo.includes('ardi')) {
    val = '2';
  } else if (dispo.includes('ercredi')) {
    val = '3';
  } else if (dispo.includes('eudi')) {
    val = '4';
  } else if (dispo.includes('endredi')) {
    val = '5';
  } else if (dispo.includes('amedi')) {
    val = '6';
  } else if (dispo.includes('imanche')) {
    val = '7';
  } else if (dispo.includes('Je ne connais pas encore mes disponibilités')) {
    val = '-1';
  }
  return val;
};

exports.convertLevel = (lvl) => {
  let val = '';
  switch (lvl) {
    case 'CP':
      val = 'HH';
      break;
    case 'CE1':
      val = 'HH';
      break;
    case 'CE2':
      val = 'HH';
      break;
    case 'CM1':
      val = 'HH';
      break;
    case 'CM2':
      val = 'HH';
      break;
    case 'SIXIEME':
      val = '6-5';
      break;
    case 'CINQUIEME':
      val = '6-5';
      break;
    case 'QUATRIEME':
      val = '4-3';
      break;
    case 'TROISIEME':
      val = '4-3';
      break;
    case 'SECONDE':
      val = '2-1-T';
      break;
    case 'PREMIERE':
      val = '2-1-T';
      break;
    case 'PREMIERE_STMG':
      val = '2-1-T';
      break;
    case 'PREMIERE_STI2D':
      val = '2-1-T';
      break;
    case 'TERMINALE':
      val = '2-1-T';
    case 'TERMINALE_STI2D':
      val = '2-1-T';
      break;
    case 'TERMINALE_STMG':
      val = '2-1-T';
      break;
    case 'TERMINALE_S':
      val = '2-1-T';
      break;
    case 'TERMINALE_ES':
      val = '2-1-T';
      break;
    case 'TERMINALE_L':
      val = '2-1-T';
      break;
    default:
      break;
  }

  return val;
};

exports.levelMatch = (lvlS, lvlG) => lvlG.includes(this.convertLevel(lvlS));

exports.dispoMatch = async (s, t, groupes) => {
  // Toute les dispos prof
  let dispos = JSON.parse(t.availability);
  const dataclipCours = await this.readCSV(
    'data/dataclips/dataclip-cours.csv',
    ','
  );

  const cours = Object.keys(
    _.groupBy(
      _.filter(dataclipCours, { slug: t.slug }),
      (c) => `${c.Jour}-${c.Heure}`
    )
  );
  // console.log(`${t.slug} : ${cours}`);
  const coursCreated = _.filter(groupes, { teacher: t.slug }).map(
    (c) => `${c.Jour}-${c.Heure}`
  );
  // console.log(`${t.slug} : ${coursCreated}`);
  // Dispos prof croisé avec dispo élèves
  // console.log(dispos);
  // console.log(s.dispos);
  // console.log(this.convertdispo(s.dispos));

  dispos = _.filter(dispos, { day: this.convertdispo(s.dispos) });

  // if (dispos.length !== 0) console.log(dispos);

  // Dispos privées des cours existants profs
  let dispoFinale = -1;
  dispos.forEach((d) => {
    let start = ['MONDAY', 'TUESDAY', 'THURSDAY', 'FRIDAY'].includes(d.day)
      ? '17:00'
      : d.day === 'WEDNESDAY'
      ? '14:00'
      : d.start_time;
    const end = d.end_time;
    // console.log(start, end, start.split(':')[0] * 1 > end.split(':')[0] * 1);
    while (start.split(':')[0] * 1 < end.split(':')[0] * 1) {
      // console.log(
      //   !cours.includes(`${this.convertDay(d.day)}-${start}:00`) &&
      //     !coursCreated.includes(`${this.convertDay(d.day)}-${start}:00`),
      //   !cours.includes(`${this.convertDay(d.day)}-${start}:00`),
      //   !coursCreated.includes(`${this.convertDay(d.day)}-${start}:00`)
      // );
      if (
        !cours.includes(`${this.convertDay(d.day)}-${start}:00`) &&
        !coursCreated.includes(`${this.convertDay(d.day)}-${start}:00`)
      ) {
        // console.log('!!!!!!!!!!!!!!!!!!!');
        dispoFinale = {
          day: d.day,
          start,
          end: `${start.split(':')[0] * 1 + 2}:00`,
        };
        break;
      }

      start = `${start.split(':')[0] * 1 + 2}:00}`;
    }
  });

  return dispoFinale;
};

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
  // console.log(dist);
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

exports.getDayToday = () => {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; //months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${day}:${month}:${year}`;
};

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
