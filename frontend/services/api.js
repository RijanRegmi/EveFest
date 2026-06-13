const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

// For multipart/form-data uploads (images, files)
export async function uploadRequest(endpoint, formData) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    // Do NOT set Content-Type — browser sets it with boundary for multipart
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload error: ${response.status}`);
  }

  return response.json();
}

// For multipart PUT requests (edit with optional file uploads)
export async function uploadPutRequest(endpoint, formData) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Update error: ${response.status}`);
  }

  return response.json();
}
