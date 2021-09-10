const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/:teacherType/:distMax', controller.teachersNear);

module.exports = router;
