const catchAsync = require('../utils/catchAync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. get all tours form collection
  const tours = await Tour.find();

  //2 create a template

  res.status(200).render('overview', {
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get data including reviews and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    'reviews',
    'review rating user'
  );

  if (!tour) {
    return next(new AppError('there is no that tour', 404));
  }

  //render temolate usin gdata
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

// login page
exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'User Login',
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
