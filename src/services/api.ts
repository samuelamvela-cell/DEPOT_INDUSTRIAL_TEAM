import type { AuthUser, ClimateTelemetry, Crop, FarmPlot } from '@/types';

const TOKEN_KEY = 'agropredict_token';
const API_BASE = ((import.meta.env?.VITE_API_URL as string) || '').trim().replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  field?: string | null;
  detail?: string | null;

  constructor(message: string, status: number, field?: string | null, detail?: string | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.field = field ?? null;
    this.detail = detail ?? null;
  }
}

export const tokenStore = {
  get(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init.headers as Record<string, string>) || {}),
  };

  let res: Response;
  const targetUrl = API_BASE ? `${API_BASE}/api${path}` : `/api${path}`;
  try {
    res = await fetch(targetUrl, { ...init, headers });
  } catch {
    throw new ApiError('Cannot reach the AgroPredict server. Is the API running?', 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      body?.error?.message ||
      (res.status === 401 ? 'Your session has expired, please sign in again.' : `Request failed (${res.status})`);
    throw new ApiError(message, res.status, body?.error?.field, body?.error?.detail);
  }
  return body as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PlotInput {
  name: string;
  surfaceHa: number;
  soilType: string;
  soilPh: number;
  slopePercent: number;
  availableWaterCapacityMm: number;
  coordinates: { lat: number; lng: number; locality: string; region: string };
  previousCrop?: {
    cropName: string;
    variety: string;
    harvestDate: string;
    yieldTonnesHa: number;
    residualNitrogenKgHa: number;
  };
}

export const api = {
  register(payload: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    phone?: string;
    region?: string;
    language?: string;
  }) {
    return request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },

  login(payload: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },

  me() {
    return request<{ user: AuthUser }>('/auth/me');
  },

  updateMe(payload: Partial<Pick<AuthUser, 'name' | 'organization' | 'phone' | 'region' | 'currency' | 'surfaceUnit' | 'language'>>) {
    return request<{ user: AuthUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) });
  },

  crops() {
    return request<{ crops: Crop[] }>('/crops');
  },

  plots() {
    return request<{ plots: FarmPlot[] }>('/plots');
  },

  createPlot(payload: PlotInput) {
    return request<{ plot: FarmPlot }>('/plots', { method: 'POST', body: JSON.stringify(payload) });
  },

  updatePlot(id: string, payload: Partial<PlotInput> & Record<string, unknown>) {
    return request<{ plot: FarmPlot }>(`/plots/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },

  deletePlot(id: string) {
    return request<void>(`/plots/${id}`, { method: 'DELETE' });
  },

  telemetry(lat: number, lng: number, force = false) {
    const qs = `?lat=${lat}&lng=${lng}${force ? '&force=1' : ''}`;
    return request<{ telemetry: ClimateTelemetry }>(`/telemetry${qs}`);
  },
};
