const router = require('express').Router();
const Photo = require('../models/photos.js');
const Business = require('../models/businesses.js');

/*
 * Route to create a new photo.
 */
router.post('/', async (req, res) => {
  try {
    // Validate existence of the business before saving the photo
    const businessExists = await Business.findById(req.body.businessid);
    if (!businessExists) {
      return res.status(404).json({ error: "Business not found" });
    }

    const newPhoto = new Photo(req.body);
    await newPhoto.save();
    res.status(201).json({
      id: newPhoto._id,
      links: {
        photo: `/photos/${newPhoto._id}`,
        business: `/businesses/${newPhoto.businessid}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoID);
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
router.put('/:photoID', async (req, res) => {
  try {
    const updatedPhoto = await Photo.findByIdAndUpdate(req.params.photoID, req.body, { new: true });
    if (!updatedPhoto) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(200).json({
      links: {
        photo: `/photos/${updatedPhoto._id}`,
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
router.delete('/:photoID', async (req, res) => {
  try {
    const result = await Photo.findByIdAndDelete(req.params.photoID);
    if (!result) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
