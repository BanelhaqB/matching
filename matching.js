const utils = require('./utils/utils');
const _ = require('lodash');
const fs = require('fs').promises;

const filterTeachers = (s, teachers, distLimit, yoopies) => {
  let teachersNear = [];
  if (!yoopies) {
    teachersNear = _.map(teachers, function (t) {
      if (
        t.dist <= distLimit &&
        t.subjects.includes(s.subject) &&
        t.availability.includes(utils.convertdispo(s.dispos)) &&
        t.cours < 4
      )
        return t;
    });

    teachersNear = _.without(teachersNear, undefined);
  } else {
    teachersNear = _.map(teachers, function (t) {
      if (t.dist <= distLimit && t.subjects.includes(s.subject)) return t;
    });

    teachersNear = _.without(teachersNear, undefined);
  }

  // console.log(teachersNear);
  return teachersNear;
};

// const countCourses = async (teacher) => {
//   let courses = await utils.readCSV('data/dataclips/dataclip-cours.csv');

//   courses = _.filter(courses, { slug: teacher.slug });

//   // console.log(courses, courses.length);
//   return courses.length;
// };

const teachersNear = async (s, teachersType, distLimit) => {
  const allTeachers = await utils.readCSV(
    `data/dataclips/dataclip-teachers.csv`,
    ','
  );

  let courses = await utils.readCSV('data/dataclips/dataclip-cours.csv', ',');
  // console.log(
  //   courses,
  //   _.filter(courses, { slug: 'manon32' }),
  //   _.filter(courses, { slug: 'manon32' }).length,
  //   courses.length
  // );
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
      teachers = await utils.readCSV(`data/yoopies/data/data-yoopies.csv`, ',');
      break;
    default:
      break;
  }

  teachers.map((t, idx) => {
    console.log(t);
    console.log(s.lat, s.lng, t.lat * 1, t.lng * 1);
    t.dist = utils.distanceBetween(s.lat, s.lng, t.lat * 1, t.lng * 1);
  });
  console.log(s);
  teachers.map(async (t, idx) => {
    // console.log({ slug: t.slug });
    // // courses = _.filter(courses, { slug: t.slug });
    // console.log(
    //   _.groupBy(
    //     _.filter(courses, { slug: t.slug }),
    //     (c) => `${c.Jour}-${c.Heure}`
    //   )
    // );
    t.cours = Object.keys(
      _.groupBy(
        _.filter(courses, { slug: t.slug }),
        (c) => `${c.Jour}-${c.Heure}`
      )
    ).length;
  });

  // console.log(teachers);
  return teachersType === 'yoopies'
    ? filterTeachers(s, teachers, distLimit, 'yoopies')
    : filterTeachers(s, teachers, distLimit);
};

exports.addTeacherNear = async (s, teachersType, distLimit) => {
  const teachers = await teachersNear(s, teachersType, distLimit);
  // console.log('s', s);
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
    data[`prof-${teachersType}-1-cours`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].cours
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
    data[`prof-${teachersType}-2-cours`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].cours
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
    data[`prof-${teachersType}-3-cours`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].cours
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
    data[`allprofs`] = `${_.map(
      _.orderBy(teachers, ['dist']),
      (t) => `${t.slug},${t.firstname},${t.email}`
    ).join(';')}`;
  } else {
    data[`liste-${teachersType}`] = `${teachers.length} profs: ${_.orderBy(
      teachers,
      ['dist']
    )
      .map((t) => `${t.id} - ${Math.floor(t.dist * 100) / 100}km`)
      .join(' | ')}`;
    data[`liste-${teachersType}-1-slug`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].id
      : '--';
    data[`liste-${teachersType}-1-firstname`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].firstname
      : '--';
    data[`liste-${teachersType}-1-phone`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].phone_number
      : '--';
    data[`liste-${teachersType}-1-url`] = _.orderBy(teachers, ['dist'])[0]
      ? _.orderBy(teachers, ['dist'])[0].url
      : '--';
    data[`liste-${teachersType}-2-slug`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].id
      : '--';
    data[`liste-${teachersType}-2-firstname`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].firstname
      : '--';
    data[`liste-${teachersType}-2-phone`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].phone_number
      : '--';
    data[`liste-${teachersType}-2-url`] = _.orderBy(teachers, ['dist'])[1]
      ? _.orderBy(teachers, ['dist'])[1].url
      : '--';
    data[`liste-${teachersType}-3-slug`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].id
      : '--';
    data[`liste-${teachersType}-3-firstname`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].firstname
      : '--';
    data[`liste-${teachersType}-3-phone`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].phone_number
      : '--';
    data[`liste-${teachersType}-3-url`] = _.orderBy(teachers, ['dist'])[2]
      ? _.orderBy(teachers, ['dist'])[2].url
      : '--';
    data[`allprofs`] = `${_.map(
      _.orderBy(teachers, ['dist']),
      (t) => `${t.id},${t.firstname},${t.phone_number}`
    ).join(';')}`;
  }

  return data;
};

const isMatchable = (s, g, teachers) => {
  let teacherOk = false;
  teachers.forEach((t) => {
    if (g.teacher === t.slug) teacherOk = true;
  });
  // console.log(
  //   teachers.map((t) => t.slug),
  //   g.teacher,
  //   teacherOk
  // );

  // console.log('------------------------------');
  // console.log('Stdent:', s);
  // console.log('Groupe:', g);
  // console.log(
  //   'Total:',
  //   teacherOk &&
  //     g.students.length < 7 &&
  //     s.subject === g.subject &&
  //     (utils.convertdispoNumber(s.dispos) === g.day ||
  //       utils.convertdispoNumber(s.dispos) === '-1') &&
  //     utils.levelMatch(s.level, g.level)
  // );
  // console.log('Teacher:', teacherOk);
  // console.log('Size:', g.students.length < 7);
  // console.log('Subject:', s.subject === g.subject);
  // console.log(
  //   'dispo:',
  //   utils.convertdispoNumber(s.dispos),
  //   g.day,
  //   utils.convertdispoNumber(s.dispos) === g.day ||
  //     utils.convertdispoNumber(s.dispos) === '-1',
  //   utils.convertdispoNumber(s.dispos) === g.day,
  //   utils.convertdispoNumber(s.dispos) === '-1'
  // );
  // console.log('level:', utils.levelMatch(s.level, g.level));
  // console.log('------------------------------');

  return (
    teacherOk &&
    g.students.length < 7 &&
    s.subject === g.subject &&
    (utils.convertdispoNumber(s.dispos) === g.day ||
      utils.convertdispoNumber(s.dispos) === '-1') &&
    utils.levelMatch(s.level, g.level)
  );
};

// const dispoTeacher = (s)

const createGroup = async (s, teachers, groupes) => {
  console.log(`nb teahcers: ${teachers.length}`);
  for await (const t of teachers) {
    const dispo = await utils.dispoMatch(s, t, groupes);
    // console.log(dispo);
    if (dispo !== -1) {
      groupes.push({
        teacher: t.slug,
        subject: s.subject,
        level: utils.convertLevel(s.level),
        day: utils.convertDay(dispo.day),
        start: dispo.start,
        end: dispo.end,
        students: [s],
      });
    }
  }
  // teachers.forEach((t) => {});

  return groupes;
};

const matching = async (students, distMax) => {
  let groupes = [];
  const nonMatchable = [];

  for await (const s of students) {
    // Get profs certifiés
    const profsCertif = await teachersNear(s, 'certified', distMax);
    let isMatched = false;
    groupes.forEach((g) => {
      // console.log(isMatched);
      if (isMatchable(s, g, profsCertif)) {
        // console.log(isMatched);
        if (!isMatched) g.students.push(s);
        isMatched = true;
      }
      // if (isMatched) break;
    });
    if (!isMatched) {
      groupes = await createGroup(s, profsCertif, groupes);
      // console.log(groupes);
    }
    // const groupeNear = _.filter(groupes, {prof: })

    // Création groupe
    // Ajout dans groupe
    // matchable
    // Non matchable
  }
  // console.log(groupes, groupes[0]);
  groupes.forEach((g) => {
    console.log(g);
  });
};

const main = async () => {
  // await findTeachers(10);
  // const s = {
  //   level: '5ème',
  //   subject: 'MATHS',
  //   dispos: 'Les samedis de 11h à 13h',
  //   lat: 43.6410248,
  //   lng: 1.460189,
  // };
  // console.log(await addTeacherNear(s, 'certified', 10));
  // matching(students, 10);
};

main();
