const router = require('express').Router();
const Review = require('../models/reviews.js'); // Require the Mongoose model for reviews
const Business = require('../models/businesses.js'); // Assume Business model is required to check business existence

/*
 * Route to create a new review.
 */
router.post('/', async (req, res) => {
  try {
    // Check if the business exists
    const businessExists = await Business.findById(req.body.businessid);
    if (!businessExists) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if the user has already reviewed this business
    const existingReview = await Review.findOne({ userid: req.body.userid, businessid: req.body.businessid });
    if (existingReview) {
      return res.status(403).json({ error: "User has already posted a review of this business" });
    }

    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json({
      id: newReview._id,
      links: {
        review: `/reviews/${newReview._id}`,
        business: `/businesses/${newReview.businessid}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewID);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewID);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Ensure the user and business ID match the original (they cannot change these with an update)
    if (req.body.businessid && req.body.businessid !== review.businessid.toString()) {
      return res.status(403).json({ error: "Cannot change the business associated with this review" });
    }
    if (req.body.userid && req.body.userid !== review.userid) {
      return res.status(403).json({ error: "Cannot change the user ID associated with this review" });
    }

    review.stars = req.body.stars || review.stars;
    review.dollars = req.body.dollars || review.dollars;
    review.review = req.body.review || review.review;
    await review.save();

    res.status(200).json({
      links: {
        review: `/reviews/${review._id}`,
        business: `/businesses/${review.businessid}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to update the review" });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async (req, res) => {
  try {
    const result = await Review.findByIdAndDelete(req.params.reviewID);
    if (!result) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
