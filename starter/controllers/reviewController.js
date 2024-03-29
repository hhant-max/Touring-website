const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAync');
const handler = require('./handler');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: newReview,
  });
});

exports.getReview = handler.getOne(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
// exports.getAllReview()
