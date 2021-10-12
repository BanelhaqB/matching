// const scrap = require('./scrap');
const utils = require('./utils/utils');
const _ = require('lodash');

// const getCSV = async () => {
//   return new Promise((resolve) =>
//     scrap.post({
//       url: `https://data.heroku.com/dataclips/uxipvjjzpyuvvrguqnvmhvigmjpm.csv`,
//       //   contentType: 'x-www-form-urlencoded',
//       //   body: 'geocoding%5Bcountry%5D=fr&geocoding%5Brayon%5D=9&geocoding%5BuserPosition%5D%5Blat%5D=48.9362731&geocoding%5BuserPosition%5D%5Blng%5D=2.2221787&geocoding%5BuserPosition%5D%5BshowDistance%5D=true&nombreResultat=700&limit=700',
//       onSuccess: async ($, response, html, config) => {
//         if (response.statusCode !== 200) {
//           console.error(
//             `loading of ${config.url} failed, response code= ${response.statusCode}`
//           );
//           resolve();
//           return;
//         }

//         console.log(JSON.parse(response, response.body));
//         // resolve(JSON.parse(response.body));
//       },
//       onError: (error) => {
//         console.log('error:', error);
//         resolve();
//       },
//     })
//   );
// };

// getCSV();

const cleanCSV = async () => {
  const data = await utils.readCSV(
    'data/yoopies/data/data-yoopies-Fiiii.csv',
    ','
  );

  console.log('cleaning data...');
  const nd = _.map(data, function (t) {
    return {
      id: t.id,
      url: t.url,
      prenom: t.firstname,
      nom: t.lastname,
      tel: t.phone_number,
      age: t.age,
      experience: t.experience,
      description: t.description,
      science: t.science,
      langues: t.langues,
      info: t.info,
      musique: t.musique,
      aidedevoirs: t.aidedevoirs,
      lat: t.lat,
      lgt: t.lng,
      ville: t.city,
      disponible: t.avaible,
      verified: t.verified,
      subjects: utils.converstYoopiesSubject(
        t.science * 1,
        t.langues * 1,
        t.info * 1,
        t.musique * 1,
        t.aidedevoirs * 1
      ),
    };
  });

  //   console.log(nd);

  let idx = 0;
  //   console.log(nd[0], nd[25208], nd[25209]);
  for await (const t of nd) {
    // console.log(t);
    // if ((idx >= 25196 && idx <= 25201) || idx === 1) console.log(t);
    // t.id = t.url.split('/')[t.url.split('/').length - 1];

    await utils.convertToCSV([t], 'data/yoopies/data/data-yoopies-Finale.csv');

    idx++;
    // console.log(idx, '/', data.length);
  }
  //   console.log(data.length, '--->', nd.length);
};

cleanCSV();
