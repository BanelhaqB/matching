const utils = require('./utils/utils');
const _ = require('lodash');
const fs = require('fs').promises;

const filterTeachers = (s, teachers, distLimit) => {
  let teachersNear = _.map(teachers, function (t) {
    if (
      t.dist <= distLimit &&
      t.subjects.includes(s.subject) &&
      t.availability.includes(utils.convertdispo(s.dispos))
    )
      return t;
  });

  teachersNear = _.without(teachersNear, undefined);

  return teachersNear;
};

const teachersNear = async (s, teachersType, distLimit) => {
  const allTeachers = await utils.readCSV(
    `data/dataclips/dataclip-teachers.csv`,
    ','
  );

  let teachers = [];

  switch (teachersType) {
    case 'certified':
      teachers = _.filter(allTeachers, function (t) {
        return t.status === 'ON' && t.Certification == 'CERTIFIED';
      });
      break;
    case 'on':
      teachers = _.filter(allTeachers, function (t) {
        return t.status === 'ON' && t.Certification !== 'CERTIFIED';
      });
      break;
    case 'off':
      teachers = _.filter(allTeachers, {
        status: 'OFF',
      });
      break;
    case 'yoopies':
      teachers = _.filter(allTeachers, {
        status: 'on',
        Certification: 'CERTIFIED',
      });
      break;
    default:
      break;
  }

  teachers.map((t, idx) => {
    t.dist = utils.distanceBetween(s.lat, s.lng, t.lat, t.lng);
  });

  return teachersType === 'yoopies'
    ? teachers
    : filterTeachers(s, teachers, distLimit);
};

exports.addTeacherNear = async (s, teachersType, distLimit) => {
  const teachers = await teachersNear(s, teachersType, distLimit);

  const data = {};

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
  console.log('prospects...');
  await utils.dataclip('prospects');
  console.log('prospects OK!');

  console.log('teachers...');
  await utils.dataclip('teachers');
  console.log('teachers OK!');

  console.log('cours...');
  await utils.dataclip('cours');
  console.log('cours OK!');

  console.log('waiting...');
  await utils.dataclip('waiting');
  console.log('waiting OK!');
};

// main();
