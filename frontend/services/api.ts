export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api";
  }
  return "http://localhost:5000/api";
};

export const getBackendBaseUrl = (): string => {
  const apiBase = getApiBaseUrl();
  if (apiBase === "/api") return "";
  if (apiBase.endsWith("/api")) {
    return apiBase.slice(0, -4);
  }
  return apiBase;
};

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  headers?: Record<string, string>;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = getApiBaseUrl();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | null | undefined),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    const errorMessage =
      errorData.message ||
      `API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// For multipart/form-data uploads (images, files)
export async function uploadRequest<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = getApiBaseUrl();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `Upload error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// For multipart PUT requests (edit with optional file uploads)
export async function uploadPutRequest<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = getApiBaseUrl();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `Update error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
