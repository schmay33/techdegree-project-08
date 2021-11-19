var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
const paginate = require('express-paginate');

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}


 
/* app.get('/', async (req, res, next) => {
 
  // This example assumes you've previously defined `Users`
  // as `const Users = sequelize.define('Users',{})` if you are using `Sequelize`
  // and that you are using Node v7.6.0+ which has async/await support
 
  
 
}); */

router.get("/", asyncHandler(async (req, res, next) => {
   await Book.findAndCountAll({limit: req.query.limit, offset: req.skip})
    .then(results => {
      const itemCount = results.count;
      console.log("Count:" + itemCount);
      const pageCount = Math.ceil(results.count / req.query.limit);
      res.render('paginate', {
        books: results.rows,
        pageCount: pageCount,
        itemCount: itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
      });
  }).catch(err => next(err))
}));


router.get('/new', asyncHandler(async (req, res, next) => {
  res.render("new-book", {
    book: {},
    title: "Create New Book"
  });
}));

router.post('/new', asyncHandler(async (req, res, next) => {
  let book;
  //new book entry is stored to a variable and submitted; user is redirected to home page
  try {
    book = await Book.create(req.body);
    console.log(book.title + ' by ' + book.author + ' has been added to the database');
    res.redirect('/books');
  } catch (error) {
    //catching validation errors; if they exist, current book entry creation is stalled,
    //and the page is rendered with the error message(s)
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', {
        book,
        errors: error.errors,
        title: 'New Book'
      });
    } else {
      //else, throw to global handler in app.js
      throw error;
    }
  }
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  let book;
  //book is selected & stored to a variable based on the id property in the url
  book = await Book.findByPk(req.params.id);
  if (book) {
    //renders update-book page with specific entry based on id
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', {
      book,
      title: book.title
    });
  } else {
    next();
  }
}));

router.post('/:id', asyncHandler(async (req, res, next) => {
  let book;
  book = await Book.findByPk(req.params.id);
  try {
    //method to update an entry's data, then user is redirected to homepage
    await book.update(req.body);
    console.log(book.title + ' by ' + book.author + ' has been updated');
    res.redirect('/books');
  } catch (error) {
    //catching validation errors; if they exist, current book entry creation is stalled,
    //and the page is rendered with the error message(s)
    if (error.name === 'SequelizeValidationError') {
      await Book.build(req.body);
      res.render('update-book', {
        book,
        errors: error.errors,
        title: 'Update Book'
      });
    } else {
      //else, throw to global handler in app.js
      throw error;
    }
  }
}));

router.get( '/:id/delete', asyncHandler(async(req, res) => {
  let book;
  book = await Book.findByPk(req.params.id);
  if (book) {
    //rendering delete-book page with the corresponding book entry based on id
    res.render( 'delete-book', { book, title: 'Delete Book' });
  } else {
    next();
  }
}));

router.post( '/:id/delete', asyncHandler( async( req, res, next )=>{
  let book;
  book = await Book.findByPk(req.params.id);
  if (book) {
    //deleted selected book entry, then redirecting to homepage
    await book.destroy();
    console.log(book.title + ' by ' + book.author + ' has been deleted');
    res.redirect('/books');
  } else {
    next();
  }
}));

router.get('/page-not-found', (err, req, res) => {
  res.render('page-not-found', {
    error: err
  });
});



module.exports = router;