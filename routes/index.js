var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect("/books")
});

module.exports = router;