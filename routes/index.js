const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (request, response, next) => {
  response.render('index', { title: 'Express' });
});

router.get('/testrunner', (request, response, next) => {
  response.render('testrunner', { title: 'Express' });
});

module.exports = router;
