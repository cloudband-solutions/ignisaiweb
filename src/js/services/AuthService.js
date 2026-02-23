import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { buildHeaders } from '../helpers/AppHelper';

export const login = (args) => {
  return axios.post(
    `${API_BASE_URL}/login`,
    {
      username: args.username,
      password: args.password
    },
    {
      headers: buildHeaders()
    },
  )
}

export const createSession = (args) => {
  // Store the token
  localStorage.setItem(TOKEN_BEARER, args.token);
}

export const destroySession = () => {
  localStorage.removeItem(TOKEN_BEARER);
}

export const isLoggedIn = () => {
  return getCurrentUser() != false;
}

export const getToken = () => {
  return localStorage.getItem(TOKEN_BEARER);
}

export const getCurrentUser = () => {
  const token = getToken();

  if (token) {
    const currentUser = jwtDecode(token);

    return currentUser;
  } else {
    return false;
  }
}
