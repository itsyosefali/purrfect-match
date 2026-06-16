import axios, { type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_BASE = `${API_URL}/api`;

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

let csrfReady = false;
let csrfPromise: Promise<void> | null = null;

const sanctumClient = axios.create({
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

function applyCsrfToken(token: string | undefined | null): void {
  if (!token) {
    return;
  }

  api.defaults.headers.common["X-XSRF-TOKEN"] = decodeURIComponent(token);
  csrfReady = true;
}

export function clearCsrfToken(): void {
  delete api.defaults.headers.common["X-XSRF-TOKEN"];
  csrfReady = false;
  csrfPromise = null;
}

export async function ensureCsrfCookie(): Promise<void> {
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    await sanctumClient.get(`${API_URL}/sanctum/csrf-cookie`);

    const { data } = await sanctumClient.get<{ csrf_token: string | null }>(
      `${API_URL}/sanctum/csrf-token`,
    );

    applyCsrfToken(data.csrf_token);
  })();

  try {
    await csrfPromise;
  } catch (error) {
    csrfPromise = null;
    throw error;
  }
}

async function attachCsrfIfNeeded(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  const method = config.method?.toLowerCase();

  if (method && MUTATING_METHODS.has(method) && !csrfReady) {
    await ensureCsrfCookie();
  }

  return config;
}

api.interceptors.request.use(attachCsrfIfNeeded);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 419) {
      throw error;
    }

    const config = error.config;
    if (!config || (config as InternalAxiosRequestConfig & { _retried?: boolean })._retried) {
      throw error;
    }

    clearCsrfToken();
    await ensureCsrfCookie();

    (config as InternalAxiosRequestConfig & { _retried?: boolean })._retried = true;
    return api.request(config);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    } | undefined;
    const firstFieldError = data?.errors
      ? Object.values(data.errors)[0]?.[0]
      : undefined;
    return data?.message ?? firstFieldError ?? error.message;
  }
  return "Something went wrong.";
}
