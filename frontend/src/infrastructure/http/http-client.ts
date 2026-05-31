import { HttpError } from './http-error';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getUserId: () => string,
  ) {}

  async request<T>(path: string, opts: HttpRequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, opts.query);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'x-user-id': this.getUserId(),
      ...(opts.headers ?? {}),
    };
    const init: RequestInit = {
      method: opts.method ?? 'GET',
      headers,
      signal: opts.signal,
    };
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      throw new HttpError(0, 'No se pudo contactar al servidor', err);
    }

    const text = await res.text();
    const data = text ? safeJsonParse(text) : undefined;

    if (!res.ok) {
      const message = extractMessage(data) ?? `HTTP ${res.status}`;
      throw new HttpError(res.status, message, data);
    }

    return data as T;
  }

  get<T>(path: string, opts?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, opts?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, opts?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'PATCH', body });
  }

  private buildUrl(path: string, query?: HttpRequestOptions['query']): string {
    const trimmed = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${trimmed}`, window.location.origin);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === '') continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.message === 'string') return obj.message;
  if (Array.isArray(obj.message)) return obj.message.join(', ');
  if (typeof obj.error === 'string') return obj.error;
  return null;
}
