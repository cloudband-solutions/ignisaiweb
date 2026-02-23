import axios from "axios";
import { buildHeaders } from "../helpers/AppHelper";

export const updateUser = (userId, payload) => {
  return axios.put(`${API_BASE_URL}/users/${userId}`, payload, {
    headers: buildHeaders(),
  });
};
