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
      body: `{"operationName":"phoneVerifGetThread","variables":{"id":${id}},"query":"query phoneVerifGetThread($id: Int!) {\\n  ad(id: $id) {\\n user {\\n phone\\n phoneE164\\n firstName\\n lastName\\n id\\n __typename\\n }\\n __typename\\n }\\n }\\n"}`,
      headers: {
        Bearer:
          ' eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE2NjQ3NTE5NTIsInVzZXJuYW1lIjoicGF1bGluZS5wZXJyaW5wQGdtYWlsLmNvbSIsImlkIjo1Mjg2MDE5LCJpYXQiOiIxNjMzMTk1MDAwIn0.RWAiF8T6EbwqMMhgVTPZ1hd8tb8rpRP4TQ6UgjuN0hvbpVxrfCKSKMB33bVvyyCCckVFZnK9GVkEtdraelnrcYmmFtHPiP0mvJenZohtmmrKo9Hgqd1-rsHvmRU_NOIB95ikSh53u9MRFms-oL91RdDSea8IRaW77waTOdeibIiZdn2hBbTC1e65p_eZk9yO8qMBfePhB3vLlFy0ZE1rD1OGHLNaDZA4w9memNl3ytNd6-ujhUROeGlQ6_SuZWOOXmbmgtcBtkXbxWufbQFyYGjO44rsRlD9UerG6w7cXWFpgTd0vbh5hpfblyVcmi-QJPK3Y59cVydcpu0JKubWYRLMR4eYygFmO98UDSDJdXqITZBiyq2RqfErZAmLTcOvzcLnZjCMFfMYVRw8KWnr0A0yAU7S5xcMywwuN395bXqyf6UvWfEm0lkWgRHDQLzA3QH4dWoxtOlJZIdSzCMP5bTR6rOQ__WN1Mj4nyYgoyarKi-mG6D6nAcYSRYNJgVKwOCTJcW5tZRtcpAs6F3lNtgQkTLMOHT1VCXW05DjEf0VLFZElAXB-GuHKVkxLtSdE2wGD5cdxI3gDoNXfGH-zhdzhr1AIs6EYtmGO5ujH-KmdQeuNIwZm2uRASPkb1VuKg5Rzzigk7sbkTP0MJgGI5oQDHpqF_LLJkzAzUI7DhU',
        cookie:
          'gtm_initialTrafficSource=utmcsr=google|utmcmd=organic|utmccn=(not set)|utmctr=(not provided); ab.storage.deviceId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"7fb8df22-0d6b-2c44-7553-cc0f8bdbefe7","c":1630311199131,"l":1630311199131}; _hjid=a18a1415-e123-47fa-8f0b-cd3ef8d51ade; _fbp=fb.1.1630311199398.1601125712; __stripe_mid=fb2d586d-5a94-4a4e-93c0-e22d088fb943f1bd30; intercom-id-spudblno=0bbe0329-f581-43c0-a9c2-ef94fee9a804; _hdu=hdu_Unk7rhcEsgvJGG6m0c4DPBD2JCXgFcw4; axeptio_authorized_vendors=,google_analytics,Google_Ads,facebook_pixel,amplitude,hotjar,intercom,; axeptio_all_vendors=,google_analytics,Google_Ads,facebook_pixel,amplitude,hotjar,intercom,; axeptio_cookies={"$$token":"rx30q0pgv63qerf9enkkg","$$date":"2021-08-30T08:56:14.795Z","$$completed":true,"google_analytics":true,"Google_Ads":true,"facebook_pixel":true,"amplitude":true,"hotjar":true,"intercom":true}; __utmzzses=1; device_view=full; gtm_session=1; _gid=GA1.2.1897611601.1633194392; yoopies-spses.9fbd=*; _hjIncludedInSessionSample=0; _hjAbsoluteSessionInProgress=0; _hds=hds_rLPARXlMQykErfPALKhQFFPl8T64CBHq; type=student; address={"latitude":48.856614,"longitude":2.3522219,"city":"Paris","cityKey":"Paris","formattedAddress":"Paris, \u00cele de France, France","street":null,"country":"France","zipCode":null,"countryCode":"FR"}; __stripe_sid=00ac9d85-e8cf-43a6-9ed1-e65521d7acafcff4eb; viewedOuibounceModal=true; firstAccessMedium=email; firstAccessSource=braze; firstAccessCampaign=fr_e_b2c_exitpremium_leave_part1_bts21; PHPSESSID=lo1plj46djscb5guihhp2tsc2t; REMEMBERME=WW9vcGllc1xDb3JlQnVuZGxlXEVudGl0eVxVc2VyOk1qSTFNRFkzTXpjMk5UQTJNelF6Tnc9PToxNjM0NDA0MjgzOmM1NWJhZGViNDU2OTAyNDlkODM5ZWYzYjNlMzkyNWNiN2Q5ODhkYzNiZWM3ZTljMjViMmExNTA1ZjBlNDNhY2E=; ab.storage.userId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"5286019","c":1633194684172,"l":1633194684172}; _dc_gtm_UA-21096154-6=1; gtm_referral_route_name=search_profile; gtm_route_name=show_thread; yoopies-spid.9fbd=39a839fd-5b7a-42d8-8b0e-4e3b993ff04a.1630311199.21.1633195003.1633009118.6632a2b3-78a6-4d95-ab51-f697abeffa73; ab.storage.sessionId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"4a289bbd-430a-b499-21a0-54517fbf9c3a","e":1633196802719,"c":1633194684174,"l":1633195002719}; _ga=GA1.2.271618902.1630311199; _dc_gtm_UA-136366356-1=1; _ga_SREN84X3EX=GS1.1.1633193744.25.1.1633195003.1; intercom-session-spudblno=ZjAwNkJZS3RSZDB4T2FGZnk1YWtMaFhEWG01ZHBSTHdOTEx0THU0QlpIcXp4VXc2NEVpWTFYdFg2V1pJcDNCeS0tZjdwY3pVeHZLUmtLMXJnWjlMb0x4dz09--8f7c994ef29c64b9b25293e3802b3201f68b91ea',
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

const scrapData = async (url, prenom, nom, tel, id) => {
  return new Promise((resolve, reject) => {
    const fct = async ($, response, html, config, dataArr) => {
      const prof = {
        id,
        url,
        prenom,
        nom,
        tel,
        age: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
        )
          .text()
          .trim()
          .split(' ans')[0],
        experience: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
        )
          .text()
          .trim()
          .split(', ')[1]
          ? $(
              '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
            )
              .text()
              .trim()
              .split(', ')[1]
              .split(' an')[0]
              .replace('Plus de ', '+')
          : 'none',
        description: `${$(
          '#profile-sitter-content > div > div:nth-child(1) > div > div > div > h3'
        )
          .text()
          .trim()} \n ${$(
          '#profile-sitter-content > div > div:nth-child(1) > div > div > div > p'
        )
          .text()
          .trim()}`,
        science:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(1)'
          ).attr('class') === 'available ',
        langues:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(2)'
          ).attr('class') === 'available ',
        info:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(3)'
          ).attr('class') === 'available ',
        musique:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(4)'
          ).attr('class') === 'available ',
        aidedevoirs:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(5)'
          ).attr('class') === 'available ',
        lat: $(
          '#profile-map > div > div > div > section > div.col-md-10.main.col-xs-16 > div > google-map'
        ).attr(':latitude'),
        lgt: $(
          '#profile-map > div > div > div > section > div.col-md-10.main.col-xs-16 > div > google-map'
        ).attr(':longitude'),
        ville: $('#breadcrumb > li:nth-child(3) > a')
          .attr('href')
          .split('/')[4],
        disponible: $('#layout-applicant > div.yp-paused-ad > img').attr('src')
          ? false
          : true,
        verified: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-4.col-xs-16 > figure > span'
        ).attr('data-toggle')
          ? true
          : false,
      };

      console.log(prof);
      // await utils.convertToCSV([prof], 'data/yp/data-prof.csv');
    };

    utils.scrapTemplate(url, fct, resolve, {
      headers: {
        Bearer:
          ' eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE2NjQ3NTE5NTIsInVzZXJuYW1lIjoicGF1bGluZS5wZXJyaW5wQGdtYWlsLmNvbSIsImlkIjo1Mjg2MDE5LCJpYXQiOiIxNjMzMTk1MDAwIn0.RWAiF8T6EbwqMMhgVTPZ1hd8tb8rpRP4TQ6UgjuN0hvbpVxrfCKSKMB33bVvyyCCckVFZnK9GVkEtdraelnrcYmmFtHPiP0mvJenZohtmmrKo9Hgqd1-rsHvmRU_NOIB95ikSh53u9MRFms-oL91RdDSea8IRaW77waTOdeibIiZdn2hBbTC1e65p_eZk9yO8qMBfePhB3vLlFy0ZE1rD1OGHLNaDZA4w9memNl3ytNd6-ujhUROeGlQ6_SuZWOOXmbmgtcBtkXbxWufbQFyYGjO44rsRlD9UerG6w7cXWFpgTd0vbh5hpfblyVcmi-QJPK3Y59cVydcpu0JKubWYRLMR4eYygFmO98UDSDJdXqITZBiyq2RqfErZAmLTcOvzcLnZjCMFfMYVRw8KWnr0A0yAU7S5xcMywwuN395bXqyf6UvWfEm0lkWgRHDQLzA3QH4dWoxtOlJZIdSzCMP5bTR6rOQ__WN1Mj4nyYgoyarKi-mG6D6nAcYSRYNJgVKwOCTJcW5tZRtcpAs6F3lNtgQkTLMOHT1VCXW05DjEf0VLFZElAXB-GuHKVkxLtSdE2wGD5cdxI3gDoNXfGH-zhdzhr1AIs6EYtmGO5ujH-KmdQeuNIwZm2uRASPkb1VuKg5Rzzigk7sbkTP0MJgGI5oQDHpqF_LLJkzAzUI7DhU',
        // cookie:
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
  const dataPhone = await scrapPhone(464849);
  console.log(dataPhone);
  // scrap data
  // --------------------------------------------------------------
  // const data = await scrapData(
  //   'https://yoopies.fr/aide-devoir-domicile/paris/soutien-scolaire-langue-anglaise/1181612',
  //   dataPhone.firstName,
  //   dataPhone.lastName,
  //   dataPhone.phoneE164,
  //   dataPhone.id
  // );
  // console.log(data);
  // --------------------------------------------------------------
  // scrap all data new ids
  // --------------------------------------------------------------
  // --------------------------------------------------------------
};

main();
