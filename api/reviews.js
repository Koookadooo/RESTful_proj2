const router = require('express').Router();
const Review = require('../models/reviews.js');
const Business = require('../models/businesses.js');


/*
* Route to return a list of reviews.
*/
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const totalDocuments = await Review.countDocuments();
    const lastPage = Math.ceil(totalDocuments / numPerPage);
    const reviews = await Review.find({})
      .skip((page - 1) * numPerPage)
      .limit(numPerPage);

    const links = {};
    if (page < lastPage) {
      links.nextPage = `/reviews?page=${page + 1}`;
      links.lastPage = `/reviews?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/reviews?page=${page - 1}`;
      links.firstPage = '/reviews?page=1';
    }

    res.status(200).json({
      reviews,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: totalDocuments,
      links
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to create a new review.
 */
router.post('/', async (req, res) => {
  try {
    const businessExists = await Business.findOne({ id: parseInt(req.body.businessid) });
    if (!businessExists) {
      console.log(`No business found with ID ${req.body.businessid}`);
      return res.status(404).json({ error: "Business not found" });
    }

    const existingReview = await Review.findOne({
      userid: req.body.userid,
      businessid: req.body.businessid
    });
    if (existingReview) {
      console.log('Duplicate review detected:', existingReview);
      return res.status(409).json({ error: "Review already posted by this user for this business" });
    }

    const lastReview = await Review.findOne().sort({ id: -1 });
    const newId = lastReview ? lastReview.id + 1 : 1;

    const newReview = new Review({
      ...req.body,
      id: newId
    });
    await newReview.save();
    res.status(201).json({
      id: newReview.id,
      links: {
        review: `/reviews/${newReview.id}`,
        business: `/businesses/${newReview.businessid}`
      }
    });
  } catch (error) {
    console.error('Failed to save new review:', error);
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({ id: parseInt(req.params.id) }); // Use findOne with numeric id
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
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({ id: parseInt(req.params.id) });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if ((req.body.businessid && parseInt(req.body.businessid) !== review.businessid) ||
        (req.body.userid && parseInt(req.body.userid) !== review.userid)) {
      return res.status(403).json({ error: "Cannot change the business or user ID associated with this review" });
    }

    review.stars = req.body.stars || review.stars;
    review.dollars = req.body.dollars || review.dollars;
    review.review = req.body.review || review.review;
    await review.save(); 

    res.status(200).json({
      id: review.id,
      links: {
        review: `/reviews/${review.id}`,
        business: `/businesses/${review.businessid}`
      }
    });
  } catch (error) {
    console.error('Failed to update the review:', error);
    res.status(400).json({ error: "Failed to update the review" });
  }
});


/*
 * Route to delete a review.
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Review.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!result) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
