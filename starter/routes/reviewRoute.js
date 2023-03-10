const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
// get one user

router
  .route('/')
  .get(
    // authController.restrictTo('user', 'admin'),
    reviewController.getAllReviews
  )
  .post(
    // only th adin and user can modefy the sreviews, so the managger cannoto change the reviews
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
// router.route('')

// route.get('/', reviewController.getAllReviews).get()

module.exports = router;
