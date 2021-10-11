const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/allData/:teacherType', controller.getAllData);
router.get('/allContact/:teacherType', controller.getAllContact);
router.get('/newContact/:teacherType', controller.getNewContact);
router.get('/newKPI/:teacherType', controller.getNewKPI);
router.get('/allKPI/:teacherType', controller.getAllKPI);
router.get('/allNewFiles/:teacherType', controller.getAllNewFiles);

router.post('/:teacherType/:distMax', controller.teachersNear);
// router.patch('/:plateforme', controller.update);

module.exports = router;
