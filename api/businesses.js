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
    const existingBusiness = await Business.findOne({
      name: req.body.name,
      address: req.body.address
    });

    if (existingBusiness) {
      console.log('Business already exists:', existingBusiness);
      return res.status(409).json({ error: "Business already exists with this name and address" });
    }

    const lastBusiness = await Business.findOne().sort({ id: -1 });
    const newId = lastBusiness ? lastBusiness.id + 1 : 1;

    const newBusiness = new Business({
      ...req.body,
      id: newId
    });

    const result = await newBusiness.save();
    res.status(201).json({
      id: result.id,
      links: {
        business: `/businesses/${result.id}`
      }
    });
  } catch (error) {
    console.error('Failed to save new business:', error);
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ id: parseInt(req.params.id) }); // Use findOne with numeric id
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
router.put('/:id', async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    if (!business) {
      res.status(404).json({ error: "Business not found" });
    } else {
      res.status(200).json({
        id: business.id,
        links: {
          business: `/businesses/${business.id}`
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
router.delete('/:id', async (req, res) => {
  try {
    const result = await Business.findOneAndDelete({ id: parseInt(req.params.id) });
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
