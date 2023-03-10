/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// add a action to the submit button to get info

// to get token
export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:2000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    // console.log('Logged in successfully');
  } catch (err) {
    showAlert('error', err.response.data.message);
    // alert(err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    console.log('Logged out successfully');
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:2000/api/v1/users/logout',
    });
    // manually exit to reload from sserver, or if will create form cache again
    if ((res.data.status = 'success log out')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
