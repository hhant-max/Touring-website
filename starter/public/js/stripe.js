/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51Mk9tHCe63QG0a9uZmpBuDSWrRM0GcMnhDHfKuq03rRhPrg5irMaWAvNdLvYUzCa4u7FQmaNQksYqhf6yJfcaQRm00axOdp1ew'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:2000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
