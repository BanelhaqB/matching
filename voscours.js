const utils = require('./utils/utils');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const _ = require('lodash');
const fs = require('fs').promises;
const scrap = require('./scrap');
const randomUA = require('random-fake-useragent');

// ------- SITEMAPS ---------

// Download sitemap
const downloadSitemap = async () => {
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

// Clean sitemap
const cleanSitemap = async () => {
  return new Promise(async (resolve) => {
    const data = await fs.readFile(
      `data/voscours/sitemaps/sitemap-voscours.xml`,
      'utf8'
    );

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

    await utils.convertToCSV(
      array,
      `data/voscours/urls/urls-voscours.csv`,
      true
    );

    console.log(
      `voscours : sitemap -- is clean ✅ - (${array.length} unique url)`
    );

    resolve(array);
  });
};

// ---- Scrap all sitemap
const scrapAllSitemap = async () => {
  console.log(`voscours : Update sitemaps starting... 🛠`);
  // await downloadSitemap();
  await cleanSitemap();

  console.log(`voscours : Sitemap is clean 🎉`);
};

// -------- DATA -----------

// Get new urls
const getNew = async () => {
  console.log(`yoopies : Counting new accounts... 🛠`);

  const urls = await utils.readCSV(`data/voscours/urls/urls-voscours.csv`, ',');
  let oldURLS = await utils.readCSV(`data/voscours/urls-voscours.csv`, ',');
  // let errorURLS = await utils.readCSV(`data/voscours/errors-voscours.csv`, ',');

  oldURLS = oldURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  // errorURLS = errorURLS.map((e) => {
  //   return { url: e.url, id: e.id };
  // });

  // const newURLS = _.filter(urls, (e) => {
  //   return (
  //     !oldURLS.map((u) => u.id).includes(e.id) ||
  //     !errorURLS.map((u) => u.id).includes(e.id)
  //   );
  // });

  console.log(oldURLS.length, urls.length);
  const newURLS = _.filter(urls, (e) => {
    return !oldURLS.map((u) => u.id).includes(e.id);
  });

  await utils.convertToCSV(
    newURLS,
    `data/voscours/new/new-urls-${utils.getDayToday()}.csv`,
    true
  );

  await utils.convertToCSV(newURLS, `data/voscours/urls-voscours.csv`);

  console.log(`voscours : ${newURLS.length} new accounts 📥`);
};

// Scrap messagerie
// dotenv.config({ path: './config.env' });

const compte = {
  id: '6165e4072da5452890cab892',
  upt: 'RdiuwreN2UgpQ40hsMRYSZJdY_TWYyC_0',
};

const checkInOneConv = async (headers, email, phone, data, name, title) => {
  const idConv = conv.Id;
  const conversationPromise = await fetch(
    `https://www.tusclases.com/api_common/api/messages/gdlg?ucid=${compte.id}&upt=${compte.upt}&gid=${idConv}&l=fr&tzo=-120&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859
        `,
    {
      headers,
    }
  );

  const conversation = await conversationPromise.json();

  console.log('----------------------------------');
  // eslint-disable-next-line no-loop-func
  conversation.Messages.forEach((msg) => {
    // console.log(msg.Content);
    email = /\b([^\s]+@[^\s]+)\b/gi.exec(msg.Content);
    phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(msg.Content);

    if (email || phone) {
      email = email ? email[0] : null;
      phone = phone ? phone[0] : null;

      // console.log({ name, email, phon });
      data.push({ name, email, phone, title });
    }
  });
};

const getURL = async (idTeacher) => {
  return new Promise(async (resolve) => {
    scrap.get({
      url: `https://www.tusclases.com/api_common/api/messages/gdgci?ucid=${compte.id}&gid=${idTeacher}&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859&hp=false&spd=&sp=true`,
      body: ``,
      headers: {
        'User-Agent': randomUA.getRandom(),
      },
      referer: 'https://www.voscours.fr/account/messaging',
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
          );
          console.log(response.error, response.stack);
          resolve();
          return;
        }

        // console.log(html);
        const obj = JSON.parse(html);

        resolve(obj ? obj.OtherUser.ProfileUrl : '');
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    });
  });
};

const runThroughPage = async (page, data) => {
  const headers = {
    'User-Agent': randomUA.getRandom(),
  };

  const conversationsPromise = await fetch(
    `https://www.tusclases.com/api_common/api/messages/glg?ucid=${compte.id}&upt=${compte.upt}&l=fr&tzo=-120&ft=0&q=&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859&pid=9&lpd=${page}&igi=
    `,
    {
      headers,
    }
  );

  //

  const conversations = await conversationsPromise.json();

  for await (conv of conversations.Conversations) {
    let email = /\b([^\s]+@[^\s]+)\b/gi.exec(conv.LastMessage);
    let phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(
      conv.LastMessage
    );

    const name = conv.Participants[0].Name;
    const title = conv.AnuncioTitle;
    const idTeacher = conv.Id;
    if (email || phone) {
      const url = await getURL(idTeacher);

      console.log(url);
      phone = phone ? phone[0] : null;
      email = email
        ? email[0].replace('mail:', '').replace(`${phone}.`, '')
        : null;
      // const url = profil.OtherUser.ProfilUrl;

      console.log({ name, email, phone, title, url });
      data.push({ name, email, phone, title, url });
    } else {
      const nbUnreadMessage = conv.NUnreadMessages;
      if (nbUnreadMessage > 1) {
        console.log(`nb unreadmsg = ${nbUnreadMessage}`);

        await checkInOneConv(headers, email, phone, data, name, title);
      }
    }
  }

  const hasNextConv = conversations.Conversations.length > 1;
  return hasNextConv;
};

const runThroughAllPages = async (page, data) => {
  const hasNextConv = await runThroughPage(page, data);
  if (hasNextConv) {
    page++;
    data = await runThroughAllPages(page, data);
  }
  return data;
};

const getEmails = async () => {
  let data = [];
  data = await runThroughAllPages(0, data);
  await utils.convertToCSV(
    data,
    `data/voscours/new/new-data-${utils.getDayToday(false)}.csv`
  );
  await utils.convertToCSV(data, `data/voscours/data-voscours.csv`);

  // console.log(data, data.length, page);
};

const sendMsg = (referer) => {
  return new Promise((resolve, reject) => {
    scrap.get({
      url: referer,
      headers: {},
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode != 200) {
          console.error(
            'loading of ' +
              config.url +
              ' failed, response code=' +
              response.statusCode
          );
          prof = {
            url: referer,
            code: response.statusCode,
          };
          await utils.convertToCSV(
            [prof],
            `data/voscours/errors/errors-voscours.csv`,
            false
          );
          resolve();
          return;
        }
        let name = $($('.username')[0]).text();
        // console.log(name);
        let inputs = $("input[name='ctl00$m$ctl00$idad']");
        if (inputs.length == 1) {
          let input = $(inputs[0]);
          if (input != undefined) {
            let id = input.val();
            if (id == undefined || id == '') {
              prof = {
                url: referer,
                code: response.statusCode,
              };
              await utils.convertToCSV(
                [prof],
                `data/voscours/errors/errors-voscours.csv`,
                false
              );
              resolve();
            } else {
              console.log(`Sending message to ${name} 🛠`);
              fetch(`https://www.voscours.fr/contact-user.aspx?an=${id}`, {
                headers: {
                  accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                  'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7',
                  'cache-control': 'max-age=0',
                  'content-type': 'application/x-www-form-urlencoded',
                  'sec-ch-ua':
                    '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-fetch-dest': 'document',
                  'sec-fetch-mode': 'navigate',
                  'sec-fetch-site': 'same-origin',
                  'sec-fetch-user': '?1',
                  'upgrade-insecure-requests': '1',
                  Cookie:
                    '_ga_TTK4WVFXY0=GS1.1.1634845357.4.1.1634845451.60; _ga=GA1.1.1797286146.1634223297; UU=11211014161858; cfg2=20; G_ENABLED_IDPS=google; TCP_UI=E=pauline.perinp@gmail.com&N=Pauline&U=3391642&CPI=9&TK=RdiuwreN2UgpQ40hsMRYSZJdY_TWYyC_0; TCP_Auth=400d7e1e-d2bd-4fef-98dd-4efa825078b6; pp=1; AWSALBTG=Kz3ZYQzBjVoL1z6I3T9kffJgZ4jdXFRbRygwTbHlQbFC6QP9pf3cuHFwwT4GQhw7e1ZP4iOqDoqccRocBk2Xkl/15KksggQvuMXVlYuZNtN/7E0TVzN1s0eJ/VfSRgswjzHWoXkckN8BYitXMmTdRtdxb4l0iqmiPJGFR6cr0LKw; AWSALBTGCORS=Kz3ZYQzBjVoL1z6I3T9kffJgZ4jdXFRbRygwTbHlQbFC6QP9pf3cuHFwwT4GQhw7e1ZP4iOqDoqccRocBk2Xkl/15KksggQvuMXVlYuZNtN/7E0TVzN1s0eJ/VfSRgswjzHWoXkckN8BYitXMmTdRtdxb4l0iqmiPJGFR6cr0LKw; ua=0; ASP.NET_SessionId=lfeezxcgzeellgp53rkedlbi; _gid=GA1.2.330205917.1634845358; G_AUTHUSER_H=0',
                },
                referrer: `https://www.voscours.fr/contact-user.aspx?an=${id}`,
                referrerPolicy: 'strict-origin-when-cross-origin',
                body: `__EVENTTARGET=ctl00%24m%24link_siguiente&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUKMTIzOTIzMzE2MA9kFgJmD2QWBGYPZBYQAgMPFgIeBFRleHQFLjxtZXRhIG5hbWU9InJvYm90cyIgY29udGVudD0ibm9pbmRleCxmb2xsb3ciLz5kAgQPFgIfAGVkAgUPFgIfAGVkAgYPFgIfAGVkAgcPFgIfAGVkAggPFgIfAGVkAgsPFgIfAAVoPG1ldGEgcHJvcGVydHk9Im9nOkltYWdlIiBjb250ZW50PSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0Ly9pL3Zvc2NvdXJzXzEyMDB4NjMwX2ZmZi5wbmciLz5kAg0PFgIfAAVxPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiB0eXBlPSJ0ZXh0L2NzcyIgaHJlZj0iaHR0cHM6Ly9kMXJlYW5hNDg1MTYxdi5jbG91ZGZyb250Lm5ldC9jc3MvY29udGFjdC11c2VyLmNzcz92PTExMDAiLz5kAgEPZBYOAgIPZBYCZg8WAh4HVmlzaWJsZWhkAgMPFgIfAWhkAgQPZBYQAgEPFgIeBGhyZWYFZC9jb3Vycy1tYXRoZW1hdGlxdWVzL2V0dWRpYW50LWVjb2xlLWluZ2VuaWV1ci1kb25uZS1jb3Vycy1tYXRoZW1hdGlxdWVzLWx5Y2VlLXRvdXRlLWZpbGllcmVzLTE2Njk2ODZkAgIPFgIfAAUkRmFpdGVzIHZvdHJlIGRlbWFuZGUgZGUgY291cnMgw6AgQmlsZAIDDxYCHgNzcmMFP2h0dHBzOi8vZDFyZWFuYTQ4NTE2MXYuY2xvdWRmcm9udC5uZXQvaW1nL2NvbW1vbi9hdmF0YXJfMF8zLnN2Z2QCBQ8WAh8ABQNCaWxkAgYPFgIfAAUfPHN0cm9uZz48Yj4yMDwvYj7igqw8L3N0cm9uZz4vaGQCCQ9kFgJmDxYCHwAFG1LDqXBvbmQgZW4gcXVlbHF1ZXMgbWludXRlc2QCCg8WAh8BZxYCZg8WAh8ABThQbHVzIGRlIDIwIMOpbMOodmVzIG9udCBjb250YWN0w6kgQmlsIGxlcyBkZXJuaWVycyBqb3Vyc2QCCw9kFggCAQ8WAh8ABSlFeHBsaXF1ZXogY2UgcXVlIHZvdXMgc291aGFpdGV6IGFwcHJlbmRyZWQCAw8WBB4LcGxhY2Vob2xkZXIFtwFCb25qb3VyIEJpbCwgIEplIHJlY2hlcmNoZSB1biBwcm9mZXNzZXVyIGRlIE1hdGhzIGV0IGonYWkgcmVtYXJxdcOpIHZvdHJlIHByb2ZpbC4gSmUgc291aGFpdGVyYWlzIGNvbW1lbmNlciBhdSBwbHVzIHTDtHQuIFBvdXZlei12b3VzIHByZW5kcmUgY29udGFjdCBhdmVjIG1vaSBhZmluIHF1ZSBsJ29uIGVuIHBhcmxlID8eCWlubmVyaHRtbAXHAUJvbmpvdXIgQmlsLCAgSmUgcmVjaGVyY2hlIHVuIHByb2Zlc3NldXIgZGUgTWF0aHMgZXQgaiYjMzk7YWkgcmVtYXJxdSYjMjMzOyB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0JiMyNDQ7dC4gUG91dmV6LXZvdXMgcHJlbmRyZSBjb250YWN0IGF2ZWMgbW9pIGFmaW4gcXVlIGwmIzM5O29uIGVuIHBhcmxlID9kAgUPZBYGZg8WAh8BaBYEZg8WAh8EBQdQcsOpbm9tZAIBDxYCHwQFBkUtbWFpbGQCAQ9kFgJmDxYCHwQFDTA2NzggOTEgMjMgNDVkAgIPFgIfAWhkAgkPZBYCAgEPFgIfAAUJQ29udGFjdGVyZAIGDw8WAh8BaGQWAmYPFgIfAAUIMzk4wqA0NjhkAgsPFgIfAGVkAgwPFgIfAGVkAhEPFgIfAGRkZG8vn8%2BJa4zqoZcgPAznAqhKCb8nCyO35ID9W02oICwU&__VIEWSTATEGENERATOR=4A8FAB36&__EVENTVALIDATION=%2FwEdAASCIxKFpBqlGoC5rzEAzSy%2BU3hu%2BZOOwuE4ovy7z6O0nHk4io3nhNS4%2BibOR41B5giERIRjjAQaeedLySsM1hRnjdpB5yMoZ4mnjhnX8ZX97m0vE8oiDFtEOCT%2BTWqmlw0%3D&ctl00%24m%24input_textarea=Bonjour+${name}%2C%0D%0A%0D%0ANous+recherchons+un+professeur+particulier+pour+donner+cours+en+petit+groupe.+Seriez-vous+disponible+pour+en+discuter+%3F+N%27h%C3%A9sitez+pas+%C3%A0+me+communiquer+votre+email+pour+que+je+puisse+vous+envoyer+la+brochure+ainsi+que+votre+num%C3%A9ro+de+t%C3%A9l%C3%A9phone+afin+d%27en+discuter+de+vive-voix.+J%27esp%C3%A8re+pouvoir+%C3%A9changer+avec+vous+tr%C3%A8s+prochainement+%21%0D%0A%0D%0AEn+vous+souhaitant+une+bonne+journ%C3%A9e%2C%0D%0ABien+%C3%A0+vous.%0D%0APauline&ctl00%24m%24input_telefono=`,
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
              })
                .then((response) => response.text())
                .then(async (text) => {
                  try {
                    console.log(`voscours : Teacher ${id} is contacted ✅ `);
                    resolve();
                  } catch (e) {
                    // console.error(e);
                    prof = {
                      url: referer,
                      code: 'jsonMalForme',
                    };
                    await utils.convertToCSV(
                      [prof],
                      `data/voscours/errors/errors-voscours.csv`,
                      false
                    );
                    // logError(config.url, 'jsonMalForme');
                    resolve();
                  }
                });
            }
          } else {
            prof = {
              url: referer,
              code: 'trouvePasInput2',
            };
            await utils.convertToCSV(
              [prof],
              `data/voscours/errors/errors-voscours.csv`,
              false
            );
            // logError(config.url, 'trouvePasInput2');
            resolve();
          }
        } else {
          prof = {
            url: referer,
            code: 'trouvePasInput1',
          };
          await utils.convertToCSV(
            [prof],
            `data/voscours/errors/errors-voscours.csv`,
            false
          );
          // logError(config.url, 'trouvePasInput1');
          resolve();
        }
      },
      onError: async (error, response, html, config) => {
        console.error('error::' + error);
        prof = {
          url: referer,
          code: 'onError',
        };
        await utils.convertToCSV(
          [prof],
          `data/voscours/errors/errors-voscours.csv`,
          false
        );
        // logError(config.url, 'onError');
        resolve();
      },
    });
  });
};

const contactNew = async () => {
  const newUrls = await utils.readCSV(
    `data/voscours/new/new-urls-${utils.getDayToday()}.csv`,
    ','
  );

  for await (const url of newUrls) await sendMsg(url.url);

  console.log(`voscours : All new profils are contacted 🎉`);
};

exports.update = async (action) => {
  switch (action) {
    case 'sitemap':
      await scrapAllSitemap();
      await getNew();
      break;
    case 'contact':
      await contactNew();
      break;
    case 'messagerie':
      await getEmails();
      break;
    default:
      break;
  }
};
