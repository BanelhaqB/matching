exports.converstYoopiesSubject = (s, l, i, m, hh) => {
  const val = [];
  if (s === 1) val.push('MATHS,PHYSICS_CHEMISTRY,BIOLOGY,SI');
  if (l === 1) val.push('LITTERATURE,ENGLISH');
  if (hh === 1) val.push('HOMEWORK_HELP');

  // console.log(val.join(','));
  return `[${val.join(',')}]`;
};
