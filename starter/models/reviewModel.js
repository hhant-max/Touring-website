const mongoose = require('mongoose');
const tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    //   review: String,
    //   rating: Number,
    //   createdAt: Date,
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.ObjectId,
      // ref name must be a model name
      ref: 'tour',
      required: [true, 'a review must have a tour'],
    },
    user: {
      type: mongoose.ObjectId,
      // mongoose.Schema.ObjectId
      ref: 'user',
      required: [true, 'a review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// dodument middleware and this indicatdes the document
reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: ['name', 'images'] });
  this.populate({ path: 'user', select: ['name', 'photo'] });

  next();
});

// give average rating for each tour
// averageRating is documetn methods ?????
reviewSchema.statics.averageRating = async function (tourId) {
  // first with only updating the tour wew want to update
  // console.log(tourId);
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        aveRat: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stas);
  // store into Tour

  if (stats.length > 0) {
    await tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // beacuse tour is when you create a review, tour is the fileds with it
  this.constructor.averageRating(this.tour);
});

// input like
/**
 *{
  _id: 63511bdf145cea48cd34ac52,
  review: 'test review update',
  rating: 2,
  user: null,
  tour: 5c88fa8cf4afda39709c2955,
  createdAt: 2022-10-20T09:58:55.351Z,
  __v: 0,
  id: '63511bdf145cea48cd34ac52'
}
 */
// eslint-disable-next-line prefer-arrow-callback
reviewSchema.post(/^findOneAnd/, function (reviewDoc) {
  if (reviewDoc) reviewDoc.constructor.averageRating(reviewDoc.tour);
  // why averageRating not belong to method?? since this functino is
  // taking effect on document but always have to call it from model
});
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const review = mongoose.model('Review', reviewSchema);
module.exports = review;
