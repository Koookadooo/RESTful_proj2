const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userid: { type: Number, required: true },
  businessid: { type: Number, ref: 'Business', required: true },
  dollars: { type: Number, required: true },
  stars: { type: Number, required: true },
  review: String
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;