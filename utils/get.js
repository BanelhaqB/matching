const GetSitemapLinks = require("get-sitemap-links").default;
const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");

(async () => {
  const array = await GetSitemapLinks(
    "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=Profesores"
  );
  const csv = new ObjectsToCsv(
    array.map((a) => {
      return { referer: a };
    })
  );
  await csv.toDisk("./datas.csv");
})();
