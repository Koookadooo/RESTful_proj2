const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  userid: { type: Number, required: true },
  businessid: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  caption: String
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;