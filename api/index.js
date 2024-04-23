const router = module.exports = require('express').Router();

router.use('/businesses', require('./businesses'));
router.use('/reviews', require('./reviews'));
router.use('/photos', require('./photos'));
router.use('/users', require('./users'));
