const matching = require('./matching');
const utils = require('./utils/utils');
const _ = require('lodash');
const fs_sync = require('fs');
const fs = require('fs').promises;
// const scraping = require('./scraping');
// const crons = require('./crons');
// console.log(matching.addTeacherNear);

exports.teachersNear = async (req, res, next) => {
  console.log(req.params.teacherType);
  const data = await matching.addTeacherNear(
    req.body,
    req.params.teacherType,
    req.params.distMax * 1
  );

  console.log(data);
  console.log(req.body);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getAllData = async (req, res, next) => {
  console.log(req.params.teacherType);
  console.log(req.params.teacherType);

  const data = await utils.readCSV(
    `data/${req.params.teacherType}/data/data-${req.params.teacherType}.csv`,
    ','
  );

  console.log(data);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getAllContact = async (req, res, next) => {
  console.log(req.params.teacherType);
  console.log(req.params.teacherType);

  const data = (
    await utils.readCSV(
      `data/${req.params.teacherType}/data/data-${req.params.teacherType}.csv`,
      ','
    )
  ).map((e) => {
    return {
      id: e.id,
      url: e.url,
      firstname: e.firstname,
      lastname: e.lastname,
      phone: e.phone_number,
      subjects: e.subjects,
      city: e.city,
    };
  });

  console.log(data);

  res.status(200).json({
    status: 'success',
    data,
  });
};

exports.getNewContact = async (req, res, next) => {
  console.log(req.params.teacherType);
  console.log(req.body);

  try {
    const data = (
      await utils.readCSV(
        `data/${req.params.teacherType}/data/new/new-data-${req.body.d}:${req.body.m}:${req.body.y}.csv`,
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

  console.log(data);

  res.status(200).json({
    status: data ? 'success' : 'failed',
    data: data ? data : '--',
  });
};

exports.getNewKPI = async (req, res, next) => {
  console.log(req.params.teacherType);
  console.log(req.body);

  let data = -1;

  try {
    data = JSON.parse(
      await fs.readFile(
        `data/${req.params.teacherType}/data/kpi/kpi-${req.body.d}:${req.body.m}:${req.body.y}.json`
      )
    );

    console.log(data);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    status: 'success',
    data: data,
  });
};

exports.getAllKPI = async (req, res, next) => {
  console.log(req.params.teacherType);

  let data = -1;
  const kpis = [];
  const allFiles = fs_sync.readdirSync(
    `data/${req.params.teacherType}/data/kpi/`
  );

  for await (const file of allFiles) {
    try {
      data = JSON.parse(
        await fs.readFile(`data/${req.params.teacherType}/data/kpi/${file}`)
      );
      kpis.push(data);
    } catch (error) {
      console.log(error);
    }
  }

  console.log(kpis);
  res.status(200).json({
    status: 'success',
    data: kpis,
  });
};

// exports.update = async (req, res, next) => {
//   const kpi = await scraping.update(req.params.plateforme);

//   console.log(
//     console.log(
//       `${req.params.plateforme} : Update database yoopies succesful 🎉`
//     )
//   );

//   res.status(200).json({
//     status: 'success',
//     msg: `${req.params.plateforme} : Update database yoopies succesful 🎉`,
//     kpi,
//   });
// };

// exports.cron = async (req, res, next) => {
//   crons.appCron(req.params.typeCron);
// };
