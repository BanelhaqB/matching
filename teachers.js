const utils = require('./utils/utils');
const _ = require('lodash');
const fs = require('fs').promises;
const path = require('path');
// const fetch = require('node-fetch');
const scrap = require('./scrap');

const getSitemap = async (plateforme, xml) => {
  return new Promise(async (resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      //   console.log('-', 1);
      //   console.log(html.length);
      await fs.writeFile(
        `data/sitemap-${plateforme}-${xml + 1}.xml`,
        html,
        (err) => {
          if (err) throw err;
        }
      );
      //   await writeFileAsync(`data/sitemap-${plateforme}-${xml + 1}.xml`, html);

      //   fs.writeFile(`data/sitemap-${plateforme}.xml`, html, (err) => {
      //     if (err) throw err;
      //   });
      //   console.log('-', 2);
      resolve();
    };

    console.log(`https://${plateforme}.fr/sitemap${xml + 1}.xml`);
    await utils.scrapTemplate(
      `https://${plateforme}.fr/sitemap${xml + 1}.xml`,
      fct,
      resolve
    );
  });
};

const cleanXML = async (xml, plateforme, type) => {
  return new Promise(async (resolve) => {
    const urls = [];

    const data = await fs.readFile(xml, 'utf8');
    const array = data.split('\n').map((e) => e.trim());

    switch (plateforme) {
      case 'yoopies':
        array.forEach((line) => {
          if (
            line.substring(0, 10) === '<loc>https' &&
            line.split('https://yoopies.fr/')[1].split('-')[0] === type
          )
            urls.push({
              url: line.substring(5, line.length - 6),
              id: line.substring(5, line.length - 6).split('/')[
                line.substring(5, line.length - 6).split('/').length - 1
              ],
            });
        });
        break;
      default:
        break;
    }

    resolve(urls);
  });
};

const filterURLS = async (csvIn, csvOut) => {
  const array = await utils.readCSV(csvIn, ',');
  let arrayFiltred = _.filter(array, (e) => {
    return e.id * 1 > 0;
  });
  console.log(array.length, arrayFiltred.length);

  arrayFiltred = _.uniqBy(arrayFiltred, 'id');

  console.log(array.length, arrayFiltred.length);
  await utils.convertToCSV(arrayFiltred, csvOut);
};

const getNew = async (csvIn, csvOut) => {
  const allIDs = await utils.readCSV('data/urls-yoopies-filtred.csv', ',');
  let oldURLS = await utils.readCSV('data/yoopies-all-teachers.csv', ',');
  oldURLS = oldURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  const newURLS = _.filter(allIDs, (e) => {
    return !oldURLS.map((u) => u.id).includes(e.id);
  });

  //   const newURLS = [];

  //   allIDs.forEach((e) => {
  //     if (!oldURLS.includes(e.id)) newURLS.push(url);
  //   });
  await utils.convertToCSV(newURLS, 'data/yoopies-new-ids.csv');
  //   console.log(newURLS, allIDs.length, oldURLS.length, newURLS.length);
};

const scrapPhone = async (id) => {
  return new Promise(async (resolve) => {
    scrap.post({
      url: 'https://yoopies.fr/graphql',
      body: '{"operationName":"phoneVerifGetThread","variables":{"id":1000342},"query":"query phoneVerifGetThread($id: Int!) {\\n  ad(id: $id) {\\n user {\\n phone\\n phoneE164\\n firstName\\n lastName\\n id\\n __typename\\n }\\n __typename\\n }\\n }\\n"}',
      headers: {
        Bearer:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE2NjIwNjAxOTMsInVzZXJuYW1lIjoicGF1bGluZS5wZXJpbnBAZ21haWwuY29tIiwiaWQiOjUyOTIzNTksImlhdCI6IjE2MzA1MDMyNDEifQ.hRt1HCc4AUK4NsT_I3YC9pEjwjBiESshKdQH2GKaMTE9iilZgcJ8EJxGRStpUklyK0H0ugu8ivYLSnCKnqh_TRAaIix0RFPd8D4W2X4WEPumaC5S-GBpn3GJvAMxen8bYBX90HQ5HDFiAzqxm_a2tuBP-v4gxf1F1F1pUz6YfMvd7LVOfaB-Ew6a16_qwOVAxHrxFPPhREAPPgv0SGW0wFm5-IKpSQznVWvcBJjBWncYNgSl36kNbBWizFoU64D-xeXNHDdYUlfXtrf3LgjCAyvk7TvIDfiZvkDkgrfv_OW9InB1RBp_jSmLMILh06bdQjxNajP_7UeCiwMrrGQyb_b_4QsrWKuANiGtHcJZZHyOdTMZSjlHpoB6ZjRfpJKz9skB9tf5vOJ8w_JSFkDaWXmRZTVB8XLweoIRMAv_vaqB4pNYRRufk-THNVUMtlpVlwnQbmIjxPxnMJs0zFWxSWggSE5sA6p0gpnnD-9XjBv03IgbWMb6966dOFEsMRLxc0N2D4IJRoDhGCejguae0qM3m1NGNWijtcTOLMh4ByykKuPhQEjN9D63zQl9_PHfgWIIGID4ZIT8x-SLO2tl5qH-oUKYa7MzP_RCoom5NFoU-1UbPJasugRINLe_RNJzIyqF_EJlo6aBYAR67Jq0hsIZXhsY3fM3BrOZYfrdOdg',
      },
      referer: 'https://yoopies.fr/',
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
          );
          console.log(response.error, response.stack);
          resolve();
          return;
        }

        const obj = JSON.parse(html);

        // console.log(html);

        resolve(obj.data.ad.user);
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    });
  });
};

const main = async () => {
  // Scrap all url from sitemaps
  // --------------------------------------------------------------
  //   for await (const xml of _.range(36)) {
  //     await getSitemap('yoopies', xml);
  //     clean all XML
  //     const urls = await cleanXML(
  //       `data/sitemap-yoopies-${xml + 1}.xml`,
  //       'yoopies',
  //       'cours'
  //     );
  //     await utils.convertToCSV(urls, 'data/urls-yoopies.csv');
  //   }
  // --------------------------------------------------------------
  // delete doublons - (id)
  // --------------------------------------------------------------
  // await filterURLS('data/urls-yoopies.csv', 'data/urls-yoopies-filtred.csv');
  // --------------------------------------------------------------
  // get only new ids
  // --------------------------------------------------------------
  //   await getNew();
  // --------------------------------------------------------------
  // scrap name - phone new ids
  // --------------------------------------------------------------
  console.log(await scrapPhone(1000342));
  // --------------------------------------------------------------
  // scrap all data new ids
  // --------------------------------------------------------------
  // --------------------------------------------------------------
};

main();
