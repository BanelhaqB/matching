const utils = require('./utils/utils');
const _ = require('lodash');

// Get all teachers
const allTeachers = async (teachersType) =>
  teachersType === 'yoopies'
    ? await utils.readCSV(`data/yoopies/data-yoopies.csv`, ',')
    : await utils.readCSV(`data/dataclips/dataclip-teachers.csv`, ',');

// Filtre teacher
const filterTeachers = (s, allTeachers, teachersType) => {
  let teachers = [];

  if (teachersType === 'yoopies') {
    teachers = _.filter(
      allTeachers,
      (t) => t.subjects.includes(s.subject) && t.tel !== 'Téléphone caché'
    );
  } else {
    teachers = _.filter(
      allTeachers,
      (t) =>
        t.levels.includes(s.level) &&
        t.subjects.includes(s.subject) &&
        t.availability.includes(utils.convertdispo(s.dispos))
    );

    switch (teachersType) {
      case 'certified':
        teachers = _.filter(teachers, function (t) {
          return t.status === 'ON' && t.Certification == 'CERTIFIED';
        });
        break;
      case 'on':
        teachers = _.filter(teachers, function (t) {
          return t.status === 'ON' && t.Certification !== 'CERTIFIED';
        });
        break;
      case 'off':
        teachers = _.filter(teachers, {
          status: 'OFF',
        });
        break;
      default:
        break;
    }
  }

  //   teachers = _.without(teachers, undefined);

  return teachers;
};
// Add Dist & nb cours
const addDistAndCours = async (teachers, student) => {
  let courses = await utils.readCSV('data/dataclips/dataclip-cours.csv', ',');

  teachers.map((t) => {
    t.dist = utils.distanceBetween(
      student.lat,
      student.lng,
      t.lat * 1,
      t.lng * 1
    );
  });

  teachers.map(async (t) => {
    t.cours = Object.keys(
      _.groupBy(
        _.filter(courses, { slug: t.slug }),
        (c) => `${c.Jour}-${c.Heure}`
      )
    ).length;
  });
};

// Teacher near
const teachersNear = (allTeachers, distMax) =>
  _.filter(allTeachers, (t) => t.dist <= distMax && t.cours <= 4);

exports.raw = async (student, teachersType, distMax) => {
  let teachers = await allTeachers(teachersType);
  teachers = filterTeachers(student, teachers, teachersType);
  await addDistAndCours(teachers, student);
  teachers = teachersNear(teachers, distMax);
  teachers = _.orderBy(teachers, ['dist']);

  const data = {
    nbTeachers: teachers.length,
  };

  data['prof-1-slug'] =
    teachersType === 'yoopies' ? teachers[0].id : teachers[0].slug;
  data['prof-1-dist'] = Math.floor(teachers[0].dist * 100) / 100;
  data['prof-1-presentiel'] =
    teachersType === 'yoopies'
      ? ''
      : teachers[0].locations.includes('TEACHER_S_PLACE');
  data['prof-1-url'] =
    teachersType === 'yoopies'
      ? teachers[0].url
      : `https://meetinclass.com/${teachers[0].slug}`;
  data['prof-2-slug'] =
    teachersType === 'yoopies' ? teachers[1].id : teachers[1].slug;
  data['prof-2-dist'] = Math.floor(teachers[1].dist * 100) / 100;
  data['prof-2-presentiel'] =
    teachersType === 'yoopies'
      ? ''
      : teachers[1].locations.includes('TEACHER_S_PLACE');
  data['prof-2-url'] =
    teachersType === 'yoopies'
      ? teachers[1].url
      : `https://meetinclass.com/${teachers[1].slug}`;
  data['prof-3-slug'] =
    teachersType === 'yoopies' ? teachers[2].id : teachers[2].slug;
  data['prof-3-dist'] = Math.floor(teachers[2].dist * 100) / 100;
  data['prof-3-presentiel'] =
    teachersType === 'yoopies'
      ? ''
      : teachers[2].locations.includes('TEACHER_S_PLACE');
  data['prof-3-url'] =
    teachersType === 'yoopies'
      ? teachers[2].url
      : `https://meetinclass.com/${teachers[2].slug}`;
  data['all'] = `${_.map(
    teachers,
    (t) =>
      `${teachersType === 'yoopies' ? t.id : t.slug},${
        teachersType === 'yoopies' ? t.prenom : t.firstname
      },${teachersType === 'yoopies' ? t.tel : t.email}`
  ).join(';')}`;

  return data;
};

exports.list = async (student, teachersType, distMax) => {
  let teachers = await allTeachers(teachersType);
  teachers = filterTeachers(student, teachers, teachersType);
  await addDistAndCours(teachers, student);
  teachers = _.orderBy(teachersNear(teachers, distMax), ['dist']);

  return teachers.map(function (t) {
    return {
      slug: teachersType === 'yoopies' ? t.id : t.slug,
      prenom: teachersType === 'yoopies' ? t.prenom : t.firstname,
      nom: teachersType === 'yoopies' ? t.nom : t.lastname,
      dist: Math.floor(t.dist * 100) / 100,
      tel: teachersType === 'yoopies' ? t.tel : t.phone_number,
      email: t.email,
      url:
        teachersType === 'yoopies'
          ? t.url
          : `https://meetinclass.com/${t.slug}`,
      status: t.status,
      Certification: t.Certification,
      quiz: t.Quiz,
      presentiel:
        teachersType === 'yoopies'
          ? ''
          : t.locations.includes('TEACHER_S_PLACE'),
      dateInscritpion: t.registered_at,
    };
  });
};
