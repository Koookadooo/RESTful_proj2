const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');  // Require mongoose here

const Business = require('./models/businesses.js');
const Review = require('./models/reviews.js');
const Photo = require('./models/photos.js');

const businesses = require('./data/businesses.json');
const reviews = require('./data/reviews.json');
const photos = require('./data/photos.json');

const app = express();
const port = process.env.PORT || 8000;

// MongoDB connection setup
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://root:password@db:27017/mydatabase?authSource=admin';
mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Initialize the database with the data from the JSON files if not already done
mongoose.connection.once('open', () => {
  console.log("MongoDB connection established.");
  initializeDatabase();  // Call to initialize data once connected
});

async function initializeDatabase() {
  for (let business of businesses) {
    await Business.findOneAndUpdate({ id: business.id }, business, { upsert: true });
  }
  console.log('Businesses initialized.');

  for (let review of reviews) {
    await Review.findOneAndUpdate({ id: review.id }, review, { upsert: true });
  }
  console.log('Reviews initialized.');

  for (let photo of photos) {
    await Photo.findOneAndUpdate({ id: photo.id }, photo, { upsert: true });
  }
  console.log('Photos initialized.');
}

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
const api = require('./api');

app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      err: "Server error.  Please try again later."
  })
})

app.listen(port, function() {
  console.log("== Server is running on port", port);
});
