// const scrap = require('./scrap');
// const utils = require('./utils/utils');

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
