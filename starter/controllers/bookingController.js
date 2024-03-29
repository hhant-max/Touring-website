const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) find tour
  //   console.log(req.params);
  const tour = await Tour.findById(req.params.tourID);
  //   console.log(tour);
  // 2) create checkout session
  //   const session = await stripe.checkout.sessions.create({
  //     payment_method_types: ['card'],
  //     success_url: `${req.protocol}://${req.get('host')}/`,
  //     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  //     customer_email: req.user.email,
  //     client_reference_id: req.params.tourId,
  // line_items: [
  //   {
  //     name: `${tour.name} Tour`,
  //     description: tour.summary,
  //     // images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //     amount: tour.price * 100,
  //     currency: 'eur',
  //     quantity: 1,
  //   },
  // ],
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });
  // 3) create session as response???const session = await
  res.status(200).json({
    status: 'success',
    session,
  });
});
