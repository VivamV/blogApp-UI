import Cookies from 'js-cookie';

const clearStorage = () => {

  localStorage.removeItem('userin');
  localStorage.removeItem('usertoken');

  Cookies.remove('token');

  window.location.href = '/'; // forces redirect to login
};

export default clearStorage;
