const utils = require('./utils/utils');
const utilsYoopies = require('./utils/yoopies/utils');
const _ = require('lodash');
const fs = require('fs').promises;
const scrap = require('./scrap');

// ------- SITEMAPS ---------

// Download sitemap
const downloadSitemap = async (xml) => {
  return new Promise(async (resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      await fs.writeFile(
        `data/yoopies/sitemaps/sitemap-yoopies-${xml + 1}.xml`,
        html,
        (err) => {
          if (err) throw err;
        }
      );

      console.log(`yoopies : sitemap ${xml + 1} -- is writted ✅`);
      resolve();
    };

    console.log(`yoopies : sitemap ${xml + 1} -- is being scrapped 🛠`);

    await utils.scrapTemplate(
      `https://yoopies.fr/sitemap${xml + 1}.xml`,
      fct,
      resolve
    );
  });
};

// Clean sitemap
const cleanSitemap = async (xml) => {
  return new Promise(async (resolve) => {
    const urls = [];

    const data = await fs.readFile(
      `data/yoopies/sitemaps/sitemap-yoopies-${xml + 1}.xml`,
      'utf8'
    );

    const array = data.split('\n').map((e) => e.trim());

    array.forEach((line) => {
      if (
        line.substring(0, 10) === '<loc>https' &&
        line.split('https://yoopies.fr/')[1].split('-')[0] === 'cours'
      )
        urls.push({
          url: line.substring(5, line.length - 6),
          id: line.substring(5, line.length - 6).split('/')[
            line.substring(5, line.length - 6).split('/').length - 1
          ],
        });
    });

    await utils.convertToCSV(urls, `data/yoopies/urls/urls-yoopies.csv`, false);

    console.log(`yoopies : sitemap ${xml + 1} -- is clean ✅`);

    resolve(urls);
  });
};

// Filtre urls
const filterURLS = async () => {
  const urls = await utils.readCSV(`data/yoopies/urls/urls-yoopies.csv`, ',');

  // keep only profil url
  let urlsFiltred = _.filter(urls, (e) => {
    return e.id * 1 > 0;
  });

  // Deleting doublons
  urlsFiltred = _.uniqBy(urlsFiltred, 'id');

  await utils.convertToCSV(
    urlsFiltred,
    `data/yoopies/urls/urls-yoopies.csv`,
    true
  );

  console.log(
    `yoopies : URLS are filtred ✅ - (${urlsFiltred.length} unique url)`
  );
  console.log(`----------------------------------------`);
};

// ---- Scrap all sitemap
const scrapAllSitemap = async () => {
  console.log(`yoopies : Update sitemaps starting... 🛠`);
  for await (const xml of _.range(36)) {
    await downloadSitemap(xml);
    await cleanSitemap(xml);
  }

  await filterURLS();
  console.log(`yoopies : All stiemaps are clean 🎉`);
};

// -------- DATA -----------

// Get new urls
const getNew = async () => {
  console.log(`yoopies : Counting new accounts... 🛠`);

  const urls = await utils.readCSV(`data/yoopies/urls/urls-yoopies.csv`, ',');
  let oldURLS = await utils.readCSV(`data/yoopies/data-yoopies.csv`, ',');
  let errorURLS = await utils.readCSV(
    `data/yoopies/errors/errors-yoopies.csv`,
    ','
  );

  oldURLS = oldURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  errorURLS = errorURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  const newURLS = _.filter(urls, (e) => {
    return (
      !oldURLS.map((u) => u.id).includes(e.id) ||
      !errorURLS.map((u) => u.id).includes(e.id)
    );
  });

  await utils.convertToCSV(
    newURLS,
    `data/yoopies/new/new-urls-${utils.getDayToday(true)}.csv`,
    true
  );

  console.log(`yoopies : ${newURLS.length} new accounts 📥`);
};

// Scrap phone
const scrapPhone = async (id) => {
  return new Promise(async (resolve) => {
    const Bearer =
      ' eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE2NjQ3NTE5NTIsInVzZXJuYW1lIjoicGF1bGluZS5wZXJyaW5wQGdtYWlsLmNvbSIsImlkIjo1Mjg2MDE5LCJpYXQiOiIxNjMzMTk1MDAwIn0.RWAiF8T6EbwqMMhgVTPZ1hd8tb8rpRP4TQ6UgjuN0hvbpVxrfCKSKMB33bVvyyCCckVFZnK9GVkEtdraelnrcYmmFtHPiP0mvJenZohtmmrKo9Hgqd1-rsHvmRU_NOIB95ikSh53u9MRFms-oL91RdDSea8IRaW77waTOdeibIiZdn2hBbTC1e65p_eZk9yO8qMBfePhB3vLlFy0ZE1rD1OGHLNaDZA4w9memNl3ytNd6-ujhUROeGlQ6_SuZWOOXmbmgtcBtkXbxWufbQFyYGjO44rsRlD9UerG6w7cXWFpgTd0vbh5hpfblyVcmi-QJPK3Y59cVydcpu0JKubWYRLMR4eYygFmO98UDSDJdXqITZBiyq2RqfErZAmLTcOvzcLnZjCMFfMYVRw8KWnr0A0yAU7S5xcMywwuN395bXqyf6UvWfEm0lkWgRHDQLzA3QH4dWoxtOlJZIdSzCMP5bTR6rOQ__WN1Mj4nyYgoyarKi-mG6D6nAcYSRYNJgVKwOCTJcW5tZRtcpAs6F3lNtgQkTLMOHT1VCXW05DjEf0VLFZElAXB-GuHKVkxLtSdE2wGD5cdxI3gDoNXfGH-zhdzhr1AIs6EYtmGO5ujH-KmdQeuNIwZm2uRASPkb1VuKg5Rzzigk7sbkTP0MJgGI5oQDHpqF_LLJkzAzUI7DhU';
    const cookie =
      'gtm_initialTrafficSource=utmcsr=google|utmcmd=organic|utmccn=(not set)|utmctr=(not provided); ab.storage.deviceId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"7fb8df22-0d6b-2c44-7553-cc0f8bdbefe7","c":1630311199131,"l":1630311199131}; _hjid=a18a1415-e123-47fa-8f0b-cd3ef8d51ade; _fbp=fb.1.1630311199398.1601125712; __stripe_mid=fb2d586d-5a94-4a4e-93c0-e22d088fb943f1bd30; intercom-id-spudblno=0bbe0329-f581-43c0-a9c2-ef94fee9a804; _hdu=hdu_Unk7rhcEsgvJGG6m0c4DPBD2JCXgFcw4; axeptio_authorized_vendors=,google_analytics,Google_Ads,facebook_pixel,amplitude,hotjar,intercom,; axeptio_all_vendors=,google_analytics,Google_Ads,facebook_pixel,amplitude,hotjar,intercom,; axeptio_cookies={"$$token":"rx30q0pgv63qerf9enkkg","$$date":"2021-08-30T08:56:14.795Z","$$completed":true,"google_analytics":true,"Google_Ads":true,"facebook_pixel":true,"amplitude":true,"hotjar":true,"intercom":true}; __utmzzses=1; device_view=full; gtm_session=1; _gid=GA1.2.1897611601.1633194392; yoopies-spses.9fbd=*; _hjIncludedInSessionSample=0; _hjAbsoluteSessionInProgress=0; _hds=hds_rLPARXlMQykErfPALKhQFFPl8T64CBHq; type=student; address={"latitude":48.856614,"longitude":2.3522219,"city":"Paris","cityKey":"Paris","formattedAddress":"Paris, \u00cele de France, France","street":null,"country":"France","zipCode":null,"countryCode":"FR"}; __stripe_sid=00ac9d85-e8cf-43a6-9ed1-e65521d7acafcff4eb; viewedOuibounceModal=true; firstAccessMedium=email; firstAccessSource=braze; firstAccessCampaign=fr_e_b2c_exitpremium_leave_part1_bts21; PHPSESSID=lo1plj46djscb5guihhp2tsc2t; REMEMBERME=WW9vcGllc1xDb3JlQnVuZGxlXEVudGl0eVxVc2VyOk1qSTFNRFkzTXpjMk5UQTJNelF6Tnc9PToxNjM0NDA0MjgzOmM1NWJhZGViNDU2OTAyNDlkODM5ZWYzYjNlMzkyNWNiN2Q5ODhkYzNiZWM3ZTljMjViMmExNTA1ZjBlNDNhY2E=; ab.storage.userId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"5286019","c":1633194684172,"l":1633194684172}; _dc_gtm_UA-21096154-6=1; gtm_referral_route_name=search_profile; gtm_route_name=show_thread; yoopies-spid.9fbd=39a839fd-5b7a-42d8-8b0e-4e3b993ff04a.1630311199.21.1633195003.1633009118.6632a2b3-78a6-4d95-ab51-f697abeffa73; ab.storage.sessionId.4ce5672b-fcad-4636-ab80-3d8ec8e3e400={"g":"4a289bbd-430a-b499-21a0-54517fbf9c3a","e":1633196802719,"c":1633194684174,"l":1633195002719}; _ga=GA1.2.271618902.1630311199; _dc_gtm_UA-136366356-1=1; _ga_SREN84X3EX=GS1.1.1633193744.25.1.1633195003.1; intercom-session-spudblno=ZjAwNkJZS3RSZDB4T2FGZnk1YWtMaFhEWG01ZHBSTHdOTEx0THU0QlpIcXp4VXc2NEVpWTFYdFg2V1pJcDNCeS0tZjdwY3pVeHZLUmtLMXJnWjlMb0x4dz09--8f7c994ef29c64b9b25293e3802b3201f68b91ea';

    scrap.post({
      url: 'https://yoopies.fr/graphql',
      body: `{"operationName":"phoneVerifGetThread","variables":{"id":${id}},"query":"query phoneVerifGetThread($id: Int!) {\\n  ad(id: $id) {\\n user {\\n phone\\n phoneE164\\n firstName\\n lastName\\n id\\n __typename\\n }\\n __typename\\n }\\n }\\n"}`,
      headers: {
        Bearer,
        cookie,
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

        resolve(obj.data.ad.user);
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    });
  });
};

// Scrap data
const scrapData = async (url, prenom, nom, tel, id) => {
  return new Promise((resolve, reject) => {
    const Bearer =
      ' eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE2NjQ3NTE5NTIsInVzZXJuYW1lIjoicGF1bGluZS5wZXJyaW5wQGdtYWlsLmNvbSIsImlkIjo1Mjg2MDE5LCJpYXQiOiIxNjMzMTk1MDAwIn0.RWAiF8T6EbwqMMhgVTPZ1hd8tb8rpRP4TQ6UgjuN0hvbpVxrfCKSKMB33bVvyyCCckVFZnK9GVkEtdraelnrcYmmFtHPiP0mvJenZohtmmrKo9Hgqd1-rsHvmRU_NOIB95ikSh53u9MRFms-oL91RdDSea8IRaW77waTOdeibIiZdn2hBbTC1e65p_eZk9yO8qMBfePhB3vLlFy0ZE1rD1OGHLNaDZA4w9memNl3ytNd6-ujhUROeGlQ6_SuZWOOXmbmgtcBtkXbxWufbQFyYGjO44rsRlD9UerG6w7cXWFpgTd0vbh5hpfblyVcmi-QJPK3Y59cVydcpu0JKubWYRLMR4eYygFmO98UDSDJdXqITZBiyq2RqfErZAmLTcOvzcLnZjCMFfMYVRw8KWnr0A0yAU7S5xcMywwuN395bXqyf6UvWfEm0lkWgRHDQLzA3QH4dWoxtOlJZIdSzCMP5bTR6rOQ__WN1Mj4nyYgoyarKi-mG6D6nAcYSRYNJgVKwOCTJcW5tZRtcpAs6F3lNtgQkTLMOHT1VCXW05DjEf0VLFZElAXB-GuHKVkxLtSdE2wGD5cdxI3gDoNXfGH-zhdzhr1AIs6EYtmGO5ujH-KmdQeuNIwZm2uRASPkb1VuKg5Rzzigk7sbkTP0MJgGI5oQDHpqF_LLJkzAzUI7DhU';

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
        lng: $(
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

      prof.subjects = utilsYoopies.converstYoopiesSubject(
        prof.science * 1,
        prof.langues * 1,
        prof.info * 1,
        prof.musique * 1,
        prof.aidedevoirs * 1
      );

      await utils.convertToCSV(
        [prof],
        `data/yoopies/new/new-data-${utils.getDayToday(false)}.csv`,
        false
      );

      await utils.convertToCSV([prof], `data/yoopies/data-yoopies.csv`, false);
    };

    utils.scrapTemplate(url, fct, resolve, reject, {
      headers: {
        Bearer,
      },
    });
  });
};

// Scrap all new
const scrapAllNew = async () => {
  const newURLS = await utils.readCSV(
    `data/yoopies/new/new-urls-${utils.getDayToday()}.csv`,
    ','
  );

  let idx = 1;
  for await (const newUrl of newURLS) {
    const dataPhone = await scrapPhone(newUrl.id);
    try {
      await scrapData(
        newUrl.url,
        dataPhone.firstName,
        dataPhone.lastName,
        dataPhone.phoneE164 ? dataPhone.phoneE164 : 'Téléphone caché',
        dataPhone.id
      );
    } catch (error) {
      prof = { id: dataPhone.id, url: newUrl.url, code: error };
      await utils.convertToCSV(
        [prof],
        `data/yoopies/errors/errors-yoopies.csv`,
        false
      );
    }

    console.log(
      `yoopies : Teacher ${newUrl.id} -- is scraped ✅  (${idx}/${
        newURLS.length
      } - ${Math.floor((idx / newURLS.length) * 100)}%)`
    );

    idx++;
  }
  console.log(`yoopies : All new accounts are scraped 🎉`);
};

// Get KPI
const getKPIs = async () => {
  const newTeachers = await utils.readCSV(
    `data/yoopies/new/new-data-${utils.getDayToday()}.csv`,
    ','
  );

  const newPhoneNumbers = _.filter(
    newTeachers,
    (e) => e.tel !== 'Téléphone caché'
  );

  const kpi = {
    date: utils.getDayToday(),
    profs: newTeachers.length,
    phones:
      newTeachers.length - _.countBy(newTeachers, 'tel')['Téléphone caché'],
    science: _.countBy(newPhoneNumbers, 'science')['1'] * 1,
    langues: _.countBy(newPhoneNumbers, 'langues')['1'] * 1,
    info: _.countBy(newPhoneNumbers, 'info')['1'] * 1,
    musique: _.countBy(newPhoneNumbers, 'musique')['1'] * 1,
    aidedevoirs: _.countBy(newPhoneNumbers, 'aidedevoirs')['1'] * 1,
    cities: _.countBy(newPhoneNumbers, 'ville'),
  };

  await fs.writeFile(
    `data/yoopies/kpi/kpi-${utils.getDayToday()}.json`,
    JSON.stringify(kpi),
    (err) => {
      if (err) throw err;
    }
  );

  console.log(`yoopies : ${kpi.phones} new phone numbers scraped 🎉`);

  return kpi;
};

exports.update = async (action) => {
  switch (action) {
    case 'sitemap':
      await scrapAllSitemap();
      break;
    case 'data':
      await getNew();
      await scrapAllNew();
      await getKPIs();
      break;
    default:
      break;
  }
};
