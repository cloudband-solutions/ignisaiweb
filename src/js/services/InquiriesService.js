import { buildHeaders } from "../helpers/AppHelper";

export const inquire = async ({ query, document_types, k }) => {
  const response = await fetch(`${API_BASE_URL}/inquire`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      query,
      document_types,
      k,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message || "Unable to process inquiry.";
    const error = new Error(message);
    error.payload = payload;
    throw error;
  }

  return response;
};
