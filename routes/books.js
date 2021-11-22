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

// The default route for the collection of books. Includes the ability for pagination.
router.get("/", asyncHandler(async (req, res, next) => {
  await Book.findAndCountAll({limit: req.query.limit, offset: req.skip})
  .then(results => {
    const itemCount = results.count;
    const pageCount = Math.ceil(results.count / req.query.limit);
    res.render('index', {
      books: results.rows,
      pageCount: pageCount,
      itemCount: itemCount,
      pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
    });
  }).catch(err => next(err));
}));

// The search route for the site
router.get('/search', asyncHandler(async(req, res, next) =>{
  const search = req.query.search.toLowerCase();
  if(search.length > 0) {
    await Book.findAndCountAll({
      limit: req.query.limit, 
      offset: req.skip,
      where:{
        [Op.or]:[
          {
            title:{[Op.like]: `%${search}%`}
          },
          {
            author:{[Op.like]: `%${search}%`}
          },
          {
            genre:{[Op.like]: `%${search}%`}
          },
          {
            year:{[Op.like]: `%${search}%`}
          }
        ]
      }
    })
    .then(results => {
      const itemCount = results.count;
      const pageCount = Math.ceil(results.count / req.query.limit);
      res.render('index', {
        books: results.rows,
        pageCount: pageCount,
        itemCount: itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
      });
    }).catch(err => next(err));
  } else {
    res.redirect('/index');
  }
}));

// The route to create new books
router.get('/new', asyncHandler(async (req, res, next) => {
  res.render("new-book", {
    book: {},
    title: "Create New Book"
  });
}));

// The route for the submittal of new books
router.post('/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    console.log(book.title + ' by ' + book.author + ' has been added to the database');
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', {
        book,
        errors: error.errors,
        title: 'New Book'
      });
    } else {
      throw error;
    }
  }
}));

// Route for specific books by ID
router.get('/:id', asyncHandler(async (req, res, next) => {
  let book;
  book = await Book.findByPk(req.params.id);
  if (book) {
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', {
      book,
      title: book.title
    });
  } else {
    next();
  }
}));

// Route to update a book by ID
router.post('/:id', asyncHandler(async (req, res, next) => {
  let book;
  book = await Book.findByPk(req.params.id);
  try {
    await book.update(req.body);
    console.log(book.title + ' by ' + book.author + ' has been updated');
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      await Book.build(req.body);
      res.render('update-book', {
        book,
        errors: error.errors,
        title: 'Update Book'
      });
    } else {
      throw error;
    }
  }
}));

// Route to delete book by ID - confirmation page
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

// Route to delete book by ID
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

// Route for page that does not exist
router.get('/page-not-found', (err, req, res) => {
  res.render('page-not-found', {
    error: err
  });
});

module.exports = router;