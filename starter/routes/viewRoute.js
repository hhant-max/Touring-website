const express = require('express');

const Router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

Router.get('/', authController.isLoggedIn, viewController.getOverview);
//url (http://127.0.0.1:2000/tour/the-sea-explorer)
Router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// for login page
Router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
Router.get('/me', authController.protect, viewController.getAccount);

module.exports = Router;
