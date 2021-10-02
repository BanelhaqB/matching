const matching = require('./matching');
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

  res.status(200).json({
    status: 'success',
    data,
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
