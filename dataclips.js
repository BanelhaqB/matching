const utils = require('./utils/utils');
const fs = require('fs').promises;

exports.getDataclip = async (type) => {
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

    await utils.scrapTemplate(
      `https://data.heroku.com/dataclips/${idDataclip}.csv`,
      fct,
      resolve
    );
  });
};
