const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userid: { type: Number, required: true },
  businessid: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  dollars: { type: Number, required: true },
  stars: { type: Number, required: true },
  review: String
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;