const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/allData', controller.getAllData);
router.get('/yoopies/allContact', controller.getAllContactYoopies);
router.get('/yoopies/newContact', controller.getAllContactYoopies);
router.get('/voscours/allContact', controller.getAllContactVoscours);
router.get('/voscours/newContact', controller.getNewContactVoscours);
router.get('/newKPI', controller.getNewKPI);
router.get('/allKPI', controller.getAllKPI);
router.get('/allNewFiles/:plateforme', controller.getAllNewFiles);

router.post('/search/list/:teacherType/:distMax', controller.list);
router.post('/search/raw/:teacherType/:distMax', controller.raw);
// router.patch('/:plateforme', controller.update);

module.exports = router;
