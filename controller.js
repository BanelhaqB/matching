const matching = require('./matching');
// const crons = require('./crons');
// console.log(matching.addTeacherNear);

exports.teachersNear = async (req, res, next) => {
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

// exports.cron = async (req, res, next) => {
//   crons.appCron(req.params.typeCron);
// };
