const searching = require('./searching');
const utils = require('./utils/utils');
const _ = require('lodash');
const fs_sync = require('fs');
const fs = require('fs').promises;

exports.raw = async (req, res, next) => {
  const data = await searching.raw(
    req.body,
    req.params.teacherType,
    req.params.distMax * 1
  );

  // console.log(data);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.list = async (req, res, next) => {
  const data = await searching.list(
    req.body,
    req.params.teacherType,
    req.params.distMax * 1
  );

  // console.log(data);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getAllData = async (req, res, next) => {
  const allData = await utils.readCSV(`data/yoopies/data-yoopies.csv`, ',');

  const data = [];

  allData.forEach((t) => {
    if (t.tel !== 'Téléphone caché') data.push(t);
  });

  // console.log(data.length);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getAllContactYoopies = async (req, res, next) => {
  const allData = await utils.readCSV(`data/yoopies/data-yoopies.csv`, ',');

  const data = [];

  allData.forEach((e) => {
    if (e.tel !== 'Téléphone caché')
      data.push({
        id: e.id,
        url: e.url,
        prenom: e.prenom,
        nom: e.nom,
        tel: e.tel,
        subjects: e.subjects,
        ville: e.ville,
      });
  });

  // console.log(data.length);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getNewContactYoopies = async (req, res, next) => {
  let data = -1;
  try {
    data = (
      await utils.readCSV(
        `data/yoopies/new/new-data-${req.query.d}:${req.query.m}:${req.query.y}.csv`,
        ','
      )
    ).map((e) => {
      return {
        id: e.id,
        url: e.url,
        firstname: e.prenom,
        lastname: e.nom,
        phone: e.tel,
        subjects: e.subjects,
        city: e.ville,
      };
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getNewKPI = async (req, res, next) => {
  let data = -1;

  try {
    data = JSON.parse(
      await fs.readFile(
        `data/yoopies/kpi/kpi-${req.query.d}:${req.query.m}:${req.query.y}.json`
      )
    );
  } catch (error) {
    console.log(error);
  }

  // console.log(data);
  res.status(200).json({
    status: 'success',
    data: data,
  });
};

exports.getAllKPI = async (req, res, next) => {
  console.log(req.params.teacherType);

  let data = -1;
  let kpis = [];
  const allFiles = fs_sync.readdirSync(`data/yoopies/kpi/`);

  for await (const file of allFiles) {
    try {
      data = JSON.parse(await fs.readFile(`data/yoopies/kpi/${file}`));
      // console.log(data, data.date);
      data.date = `${data.date.split(':')[0]}/${data.date.split(':')[1]}/${
        data.date.split(':')[2]
      }`;

      data.dateISO = new Date(
        `${data.date.split('/')[1] * 1 - 1}/${
          data.date.split('/')[0] * 1 + 1
        }/${data.date.split('/')[2]}`
      );

      kpis.push(data);
    } catch (error) {
      console.log(error);
    }
  }

  kpis = _.orderBy(kpis, 'dateISO', 'desc');
  // console.log(kpis);
  res.status(200).json({
    status: 'success',
    data: kpis,
  });
};

exports.getAllNewFiles = async (req, res, next) => {
  let allFiles = fs_sync.readdirSync(`data/yoopies/kpi/`).map((e) => {
    return {
      date: `${e.split('-')[1].split('.')[0].split(':')[0]}/${
        e.split('-')[1].split('.')[0].split(':')[1]
      }/${e.split('-')[1].split('.')[0].split(':')[2]}`,
      dateISO: new Date(
        `${e.split('-')[1].split('.')[0].split(':')[1] * 1 - 1}/${
          e.split('-')[1].split('.')[0].split(':')[0] * 1 + 1
        }/${e.split('-')[1].split('.')[0].split(':')[2]}`
      ),
    };
  });

  allFiles = _.orderBy(allFiles, 'dateISO', 'desc');

  // console.log(allFiles);
  res.status(200).json({
    status: 'success',
    data: allFiles,
  });
};

exports.getAllContactVoscours = async (req, res, next) => {
  const data = await utils.readCSV(`data/voscours/data-voscours.csv`, ',');

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getNewContactVoscours = async (req, res, next) => {
  let data = -1;
  try {
    data = await utils.readCSV(
      `data/voscours/new/new-data-${req.query.d}:${req.query.m}:${req.query.y}.csv`,
      ','
    );
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    status: 'success',
    data,
  });
};
