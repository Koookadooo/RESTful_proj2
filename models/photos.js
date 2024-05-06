const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userid: { type: Number, required: true },
  businessid: { type: Number, ref: 'Business', required: true },
  caption: String
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;