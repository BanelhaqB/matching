const matching = require('./matching');
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
