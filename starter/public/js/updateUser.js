/* eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateUser = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:2000/api/v1/users/updatePass'
        : 'http://localhost:2000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()}updated successfully!`);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};
