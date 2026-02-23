import axios from "axios";
import { buildHeaders } from "../helpers/AppHelper";

export const fetchEnvironment = () => {
  return axios.get(`${API_BASE_URL}/system/env`, {
    headers: buildHeaders(),
  });
};
