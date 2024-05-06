const router = require('express').Router();
const Photo = require('../models/photos.js');
const Business = require('../models/businesses.js');

/*
* Route to return a list of photos.
*/
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const totalDocuments = await Photo.countDocuments();
    const lastPage = Math.ceil(totalDocuments / numPerPage);
    const photos = await Photo.find({})
                              .skip((page - 1) * numPerPage)
                              .limit(numPerPage);

    const links = {};
    if (page < lastPage) {
      links.nextPage = `/photos?page=${page + 1}`;
      links.lastPage = `/photos?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/photos?page=${page - 1}`;
      links.firstPage = '/photos?page=1';
    }

    res.status(200).json({
      photos,
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
 * Route to create a new photo.
 */
router.post('/', async (req, res) => {
  try {
    const businessExists = await Business.findOne({ id: parseInt(req.body.businessid) });
    if (!businessExists) {
      console.log(`No business found with ID ${req.body.businessid}`);
      return res.status(404).json({ error: "Business not found" });
    }

    const lastPhoto = await Photo.findOne().sort({ id: -1 });
    const newId = lastPhoto ? lastPhoto.id + 1 : 1;

    const newPhoto = new Photo({
      ...req.body,
      id: newId
    });
    await newPhoto.save();
    res.status(201).json({
      id: newPhoto.id,
      links: {
        photo: `/photos/${newPhoto.id}`,
        business: `/businesses/${newPhoto.businessid}`
      }
    });
  } catch (error) {
    console.error('Failed to save new photo:', error);
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findOne({ id: parseInt(req.params.id) });  // Use findOne with numeric id
    if (!photo) {
      return res.status(404).send("Photo not found");
    }
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedPhoto = await Photo.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    if (!updatedPhoto) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(200).json({
      id: updatedPhoto.id,  // Use numeric id for updated photo
      links: {
        photo: `/photos/${updatedPhoto.id}`,
        business: `/businesses/${updatedPhoto.businessid}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to update the photo" });
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Photo.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!result) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
