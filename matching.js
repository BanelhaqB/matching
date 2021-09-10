const utils = require('./utils');
const _ = require('lodash');

const convertSubject = (sub) => {
  let val = '';
  switch (sub) {
    case 'Mathématiques':
      val = 'MATHS';
      break;
    case 'Français':
      val = 'LITTERATURE';
      break;
    case 'Anglais':
      val = 'ENGLISH';
      break;
    case 'Multi-matières (primaire uniquement)':
      val = 'HOMEWORK_HELP';
      break;
    case 'Physique-chimie':
      val = 'PHYSICS_CHEMISTRY';
      break;
    default:
      break;
  }

  return val;
};

const convertdispo = (dispo) => {
  let val = '';
  if (dispo.includes('Lundi')) {
    val = 'MONDAY';
  } else if (dispo.includes('Mardi')) {
    val = 'TUESDAY';
  } else if (dispo.includes('Mercredi')) {
    val = 'WEDNESDAY';
  } else if (dispo.includes('Jeudi')) {
    val = 'THURSDAY';
  } else if (dispo.includes('Vendredi')) {
    val = 'FRIDAY';
  } else if (dispo.includes('Samedi')) {
    val = 'SATURDAY';
  } else if (dispo.includes('Dimanche')) {
    val = 'SUNDAY';
  }
  return val;
};

const dispoMatch = (dispo1, dispo2) => {};

const distanceBetween = (lat1, lng1, lat2, lng2) => {
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;
  lng1 = (lng1 * Math.PI) / 180;
  lng2 = (lng2 * Math.PI) / 180;

  const dist =
    6371 *
    Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
    );

  return dist;
};

const filterTeachers = (s, teachers, distLimit) => {
  let teachersNear = _.map(teachers, function (t) {
    if (
      t.dist <= distLimit &&
      t.subjects.includes(convertSubject(s.subject)) &&
      t.availability.includes(convertdispo(s.dispos))
    )
      return t;
  });

  teachersNear = _.without(teachersNear, undefined);

  return teachersNear;
};

const teachersNear = async (s, teachersType, distLimit) => {
  const teachers = await utils.readCSV(
    `data/teachers-${teachersType}.csv`,
    ','
  );

  teachers.map((t, idx) => {
    t.dist = distanceBetween(s.lat, s.lng, t.lat, t.lng);
  });

  return teachersType === 'yoopies'
    ? teachers
    : filterTeachers(s, teachers, distLimit);
};

exports.addTeacherNear = async (s, teachersType, distLimit) => {
  const teachers = await teachersNear(s, teachersType, distLimit);

  const data = {};
  console.log(data, teachersType, 'yoopies', teachersType !== 'yoopies');
  if (teachersType !== 'yoopies') {
    data[`liste-${teachersType}`] = `${teachers.length} profs: ${_.orderBy(
      teachers,
      ['dist']
    )
      .map((t) => `${t.slug} - ${Math.floor(t.dist * 100) / 100}km`)
      .join(' | ')}`;
    // ------------------- 1 -----------------
    data[`prof-${teachersType}-1-slug`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].slug
      : '--';
    data[`prof-${teachersType}-1-presentiel`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].locations.includes('TEACHER_S_PLACE')
      : '--';
    data[`prof-${teachersType}-1-phone`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].phone_number
      : '--';
    data[`prof-${teachersType}-1-url`] = _.orderBy(teachers, ['dist'])[0]
      ? `https://www.meetinclass.com/${_.orderBy(teachers, ['dist'])[0].slug}`
      : '--';

    // ------------------- 2 -----------------
    data[`prof-${teachersType}-2-slug`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].slug
      : '--';
    data[`prof-${teachersType}-2-presentiel`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].locations.includes('TEACHER_S_PLACE')
      : '--';
    data[`prof-${teachersType}-2-phone`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].phone_number
      : '--';
    data[`prof-${teachersType}-2-url`] = _.orderBy(teachers, ['dist'])[1]
      ? `https://www.meetinclass.com/${_.orderBy(teachers, ['dist'])[1].slug}`
      : '--';

    // ------------------- 3 -----------------
    data[`prof-${teachersType}-3-slug`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].slug
      : '--';
    data[`prof-${teachersType}-3-presentiel`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].locations.includes('TEACHER_S_PLACE')
      : '--';
    data[`prof-${teachersType}-3-phone`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].phone_number
      : '--';
    data[`prof-${teachersType}-3-url`] = _.orderBy(teachers, ['dist'])[2]
      ? `https://www.meetinclass.com/${_.orderBy(teachers, ['dist'])[2].slug}`
      : '--';
  } else {
    data[`liste-${teachersType}`] = `${teachers.length} profs: ${_.orderBy(
      teachers,
      ['dist']
    )
      .map((t) => `${t.slug} - ${Math.floor(t.dist * 100) / 100}km`)
      .join(' | ')}`;
    data[`liste-${teachersType}-1-slug`] = _.orderBy(teachers, [
      'dist',
    ])[0].slug;
    data[`liste-${teachersType}-1-firstname`] = _.orderBy(teachers, [
      'dist',
    ])[0].firstname;
    data[`liste-${teachersType}-1-phone`] = _.orderBy(teachers, [
      'dist',
    ])[0].phone_number;
    data[`liste-${teachersType}-1-url`] = _.orderBy(teachers, ['dist'])[0].url;
    data[`liste-${teachersType}-2-slug`] = _.orderBy(teachers, [
      'dist',
    ])[1].slug;
    data[`liste-${teachersType}-2-firstname`] = _.orderBy(teachers, [
      'dist',
    ])[1].firstname;
    data[`liste-${teachersType}-2-phone`] = _.orderBy(teachers, [
      'dist',
    ])[1].phone_number;
    data[`liste-${teachersType}-2-url`] = _.orderBy(teachers, ['dist'])[1].url;
    data[`liste-${teachersType}-3-slug`] = _.orderBy(teachers, [
      'dist',
    ])[2].slug;
    data[`liste-${teachersType}-3-firstname`] = _.orderBy(teachers, [
      'dist',
    ])[2].firstname;
    data[`liste-${teachersType}-3-phone`] = _.orderBy(teachers, [
      'dist',
    ])[2].phone_number;
    data[`liste-${teachersType}-3-url`] = _.orderBy(teachers, ['dist'])[2].url;
  }

  return data;
};

// const addTeacherSlugNear = async (s, teachersType, distLimit) => {
//   const teachers = await teachersNear(s, teachersType, distLimit);

//   return _.orderBy(teachers, ['dist']).map((t) => {
//     const o = {
//       slug: t.slug,
//       email: t.email,
//       dist: Math.floor(t.dist * 100) / 100,
//     };
//     return o;
//   });
// };

const findTeachers = async (distLimit) => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const students = await utils.readCSV('data/waiting.csv', ',');
  // const emails = [];

  for await (const s of students) {
    // let emails = [];
    // emails = emails.concat(await addTeacherSlugNear(s, 'certified', distLimit));
    // emails = emails.concat(await addTeacherSlugNear(s, 'on', distLimit));
    // emails = emails.concat(await addTeacherSlugNear(s, 'off', distLimit));
    s['profs-certified'] = await addTeacherNear(s, 'certified', distLimit);
    s['profs-on'] = await addTeacherNear(s, 'on', distLimit);
    s['profs-off'] = await addTeacherNear(s, 'off', distLimit);
    // s['profs-yoopies'] = await addTeacherNear(s, 'yoopies', distLimit);
    // console.log(emails);
    await utils.convertToCSV([s], 'data/matching-profs3.csv');

    idx++;
    utils.logProgress(idx, students.length, `Students`, startAt);
  }

  //   await utils.convertToCSV(students, 'data/waiting-profs');
};

const main = async () => {
  // await findTeachers(10);
  const s = {
    level: '5ème',
    subject: 'MATHS',
    dispos: 'Les samedis de 11h à 13h',
    lat: 43.6410248,
    lng: 1.460189,
  };
  // console.log(await addTeacherNear(s, 'certified', 10));
};

main();
