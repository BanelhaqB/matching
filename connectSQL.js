// connect().then((pool) => searchTeacher('TROISIEME', 'MATHS', 47.952213, 1.828199, 'ON', 10, pool);)

const searchTeacher = async (
  level,
  subject,
  dispos,
  lat,
  lng,
  type,
  distance,
  pool
) => {
  const days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  dispos = dispos.length === 0 ? [1, 2, 3, 4, 5, 6, 7] : dispos;

  const status = type === 'OFF' ? 'OFF' : 'ON';
  const certification =
    type === 'ON'
      ? "AND t.certification <> 'CERTIFIED'"
      : "AND t.certification = 'CERTIFIED'";

  const query = `SELECT t.slug,
  u.firstname "Prénom",
  u.lastname "Nom",
  to_char(earth_distance(ll_to_earth(${lat}, ${lng}), ll_to_earth(t.lat, t.lng)) / 1000, 'FM9.9 km') "Distance",
  u.phone_number "Téléphone",
  u.email "Email",
  'https://www.meetinclass.com/' || t.slug "Page Prof",
  case 
  when t.quizz_results_json IS null then 'Non'  
  ELSE 'Oui' 
  end "Quiz",
  case 
  when 'TEACHER_S_PLACE' = ANY (t.locations) then 'Non' 
  ELSE 'Oui' 
  end "Cours à domicile",
  (SELECT count(*) from (SELECT s.course_id from subscription s join course c on c.id = s.course_id WHERE c.teacher_id = t.id AND c.day = ANY ('{${dispos.join(
    ','
  )}}'::int[]) group by s.course_id, c.max_seats
  having count(*) = c.max_seats) as full_course) "Cours plein"
FROM teacher t 
JOIN users u ON u.id = t.user_id 
JOIN teacher ON earth_distance(ll_to_earth(${lat}, ${lng}), ll_to_earth(t.lat, t.lng)) / 1000 <= ${distance}  AND '${level}' = ANY (t.levels) AND '${subject}' = ANY (t.subjects),
jsonb_array_elements(t.availability) as av
WHERE t.status = '${status}'
${type === 'OFF' ? '' : certification}
AND av->>'day' = ANY ('{${dispos.map((d) => days[d - 1]).join(',')}}')

GROUP BY 1,2,3,4,5,6,7,8,9,t.lat,t.lng, t.id
ORDER BY earth_distance(ll_to_earth(${lat}, ${lng}), ll_to_earth(t.lat, t.lng)) / 1000, t.slug`;

  // console.log(query);
  const res = await pool.query(query);

  return res;
};

exports.search = async () => {
  const teachers = (
    await searchTeacher(
      'TROISIEME',
      'MATHS',
      [6, 7],
      47.952213,
      1.828199,
      'CERTIFIED',
      10,
      pool
    )
  ).rows;

  // console.log(teachers);

  return teachers;
};
