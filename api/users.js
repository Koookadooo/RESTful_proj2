const router = require('express').Router();

const Business = require('../models/businesses.js');
const Review = require('../models/reviews.js');
const Photo = require('../models/photos.js');

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async (req, res) => {
  try {
    const userid = parseInt(req.params.userid);
    const userBusinesses = await Business.find({ ownerid: userid });
    res.status(200).json({ businesses: userBusinesses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async (req, res) => {
  try {
    const userid = parseInt(req.params.userid);
    const userReviews = await Review.find({ userid: userid });
    res.status(200).json({ reviews: userReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async (req, res) => {
  try {
    const userid = parseInt(req.params.userid);
    const userPhotos = await Photo.find({ userid: userid });
    res.status(200).json({ photos: userPhotos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
