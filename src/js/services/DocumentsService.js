import axios from "axios";
import { getToken } from "./AuthService";
import { buildHeaders } from "../helpers/AppHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const listDocuments = (params = {}) => {
  return axios.get(`${API_BASE_URL}/documents`, {
    headers: buildHeaders(),
    params,
  });
};

export const showDocument = (documentId) => {
  return axios.get(`${API_BASE_URL}/documents/${documentId}`, {
    headers: buildHeaders(),
  });
};

export const listDocumentTypes = () => {
  return axios.get(`${API_BASE_URL}/documents/types`, {
    headers: buildHeaders(),
  });
};

export const listPublicDocumentTypes = () => {
  return axios.get(`${API_BASE_URL}/public/document_types`, {
    headers: buildHeaders(),
  });
};

export const createDocument = (formData) => {
  return axios.post(`${API_BASE_URL}/documents`, formData, {
    headers: authHeaders(),
  });
};

export const updateDocument = (documentId, formData) => {
  return axios.put(`${API_BASE_URL}/documents/${documentId}`, formData, {
    headers: authHeaders(),
  });
};

export const deleteDocument = (documentId) => {
  return axios.delete(`${API_BASE_URL}/documents/${documentId}`, {
    headers: buildHeaders(),
  });
};

export const retryDocumentEnqueue = (documentId) => {
  return axios.post(`${API_BASE_URL}/documents/${documentId}/enqueue`, null, {
    headers: buildHeaders(),
  });
};
