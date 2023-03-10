/* eslint-disable */
import '@babel/polyfill';
import { login, logOut } from './login';
import { displayMap } from './mapbox';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBu = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // appear in front inspect
    login(email, password);
  });
}

if (logOutBu) {
  logOutBu.addEventListener('click', logOut);
}

if (updateUserForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    // console.log({ email, name });
    // const password = document.getElementById('password').value;
    // appear in front inspect
    updateUser({ name, email }, 'data');
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // add a process to updating password
    // currPassword;
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const currPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUser({ currPassword, password, passwordConfirm }, 'password');

    // atention for button not value
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
