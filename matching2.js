const utils = require('./utils/utils');
const _ = require('lodash');

// Get profs
const getTeachers = async (status, certifiaction, locations) =>
  _.map(
    _.filter(
      _.filter(
        await utils.readCSV(`data/dataclips/dataclip-teachers.csv`, ','),
        {
          Certification: certifiaction,
          status,
        }
      ),
      (t) => t.locations.includes(locations)
    ),
    (t) => {
      return {
        slug: t.slug,
        firstname: t.firstname,
        lastname: t.lastname,
        levels: t.levels,
        subjects: t.subjects,
        dispos: utils.convertDisposTeaacher(t.availability),
        adresse: t.private_address,
        lng: t.lng.replace(',', '.') * 1,
        lat: t.lat.replace(',', '.') * 1,
        email: t.email,
        phone_number: t.phone_number,
        status: t.status,
        certification: t.Certification,
        locations: t.locations,
      };
    }
  );

// Get liste d'attente
const getStudentsPrimary = async () =>
  _.filter(await utils.readCSV(`waiting-list.csv`, ','), (s) =>
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(s.level)
  );

const getStudents = async () =>
  _.map(await utils.readCSV(`waiting-list.csv`, ','), (s) => {
    return {
      level: utils.convertLevelStudent(s.level),
      subject: utils.convertSubject(s.subject),
      dispos: utils.convertDayStudent(s.dispos),
      firstname_p: s.firstname_p,
      lastname_p: s.lastname_p,
      firstname_s: s.firstname_s,
      lastname_s: s.lastname_s,
      adresse: s.adresse,
      zip_code: s.zip_code,
      lng: s.lng.replace(',', '.') * 1,
      lat: s.lat.replace(',', '.') * 1,
      email: s.email,
      phone_number: s.phone_number,
      city: s.city,
      Submitted_at: s.Submitted_at,
      Token: s.Token,
    };
  });

// score ditance km
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
  // console.log(dist);
  return dist;
};

// score level

// score dispo

// Segmentation subjects

// Clustering

const main = async () => {
  const allTeachers = await getTeachers('ON', 'CERTIFIED', 'TEACHER_S_PLACE');
  console.log(allTeachers[0], allTeachers.length);

  //   const allStudents = await getStudents();
  //   console.log(allStudents, allStudents.length);
};

main();
