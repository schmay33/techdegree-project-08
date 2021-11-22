var express = require('express');
var router = express.Router();

// The default route to the collection of books
router.get('/', (req, res, next) => {
  res.redirect("/books");
});

module.exports = router;