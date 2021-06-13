const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//  set up environmental settings
dotenv.config({ path: './config/config.env' });

//  connect to database
connectDB();

// importing routes for bootcamps, courses, auth, users, and reviews
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// instantiating the express app
const app = express();

//  Middlware for recognizing requests as json format
app.use(express.json());

// make cookieParser available to express. Parse Cookie header and populate req.cookies
app.use(cookieParser());

//  use NODE_ENV if equal value and equal type as Development.
// morgan http request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//  module to make file loads easier in Node.JS
app.use(fileupload());

// standalone module that sanitizes inputs against query selector injection attacks:
app.use(mongoSanitize());

//Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

// xss is a module used to filter input from users to prevent XSS attacks.
app.use(xss());

// Simple rate limiting for node.js streams, capable of capping both read and write streams.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Express middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp());

// providing a Connect/Express middleware
app.use(cors());


// Transforms files with .hbs and .md with Handlebars and Markdown respectively.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

//  calls the middleware/error.js file
app.use(errorHandler);

// set port 5000 to be used by expres
const PORT = process.env.PORT || 5000;

// bind and listen the connections on port 5000.
// console logs out the Environment and port number.
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// console log out any rejected  promises. 
// A rejected promise represents an asynchronous operation that failed for some reason.
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
