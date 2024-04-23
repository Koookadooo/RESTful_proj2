const router = require('express').Router();
const Business = require('../models/businesses.js'); // Require the Mongoose model

/*
 * Route to return a list of businesses.
 */
router.get('/', async (req, res) => {
  console.log('GET /');
  try {
    const page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const totalDocuments = await Business.countDocuments();
    const lastPage = Math.ceil(totalDocuments / numPerPage);
    const businesses = await Business.find({})
                                     .skip((page - 1) * numPerPage)
                                     .limit(numPerPage);

    const links = {};
    if (page < lastPage) {
      links.nextPage = `/businesses?page=${page + 1}`;
      links.lastPage = `/businesses?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/businesses?page=${page - 1}`;
      links.firstPage = '/businesses?page=1';
    }

    res.status(200).json({
      businesses,
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
 * Route to create a new business.
 */
router.post('/', async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const result = await newBusiness.save();
    res.status(201).json({
      id: result._id,
      links: {
        business: `/businesses/${result._id}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessid);
    if (!business) {
      res.status(404).json({ error: "Business not found" });
    } else {
      res.status(200).json(business);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to update data for a business.
 */
router.put('/:businessid', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.businessid, req.body, { new: true });
    if (!business) {
      res.status(404).json({ error: "Business not found" });
    } else {
      res.status(200).json({
        links: {
          business: `/businesses/${business._id}`
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async (req, res) => {
  try {
    const result = await Business.findByIdAndDelete(req.params.businessid);
    if (!result) {
      res.status(404).json({ error: "Business not found" });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
