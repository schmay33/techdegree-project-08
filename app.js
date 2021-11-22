var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var books = require('./routes/books');

// Use Express-Paginate module
const paginate = require('express-paginate');

const db = require('./models');
const sequelize = db.sequelize;

var app = express();

sequelize.sync()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// Use PUG as the view engine
app.set('view engine', 'pug');
// Add Paginate middleware
app.use(paginate.middleware(10, 50));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error();
  error.status = 404;
  error.message = "Looks like this page does not exist!";
  next(error);
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(404).render("page-not-found", { err });
    console.log(error);
  }
  /* // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error'); */
});

module.exports = app;