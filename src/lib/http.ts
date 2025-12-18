/**
 * HTTP Wrapper for Capacitor
 * Automatically uses CapacitorHttp on mobile and fetch on web
 */
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

/**
 * Check if we're running on a native platform (iOS/Android)
 */
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Universal HTTP request function
 * Uses CapacitorHttp on mobile, fetch on web
 */
export const httpRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // On native platforms, use CapacitorHttp to bypass CORS
  if (isNativePlatform()) {
    const httpOptions: HttpOptions = {
      url,
      method: (options.method as any) || 'GET',
      headers: options.headers as Record<string, string> || {},
    };

    // Handle body for POST/PUT/PATCH requests
    if (options.body) {
      if (typeof options.body === 'string') {
        httpOptions.data = JSON.parse(options.body);
      } else if (options.body instanceof FormData) {
        // For FormData, we need to convert it to a plain object
        // Note: FormData with files needs special handling
        const formDataObj: Record<string, any> = {};
        (options.body as any).forEach((value: any, key: string) => {
          formDataObj[key] = value;
        });
        httpOptions.data = formDataObj;
      } else {
        httpOptions.data = options.body;
      }
    }

    try {
      const response: HttpResponse = await CapacitorHttp.request(httpOptions);

      // Convert CapacitorHttp response to a fetch-like Response object
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.status.toString(),
        headers: new Headers(response.headers),
        url: response.url,
        json: async () => response.data,
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        blob: async () => new Blob([JSON.stringify(response.data)]),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        clone: () => {
          throw new Error('clone() not implemented for Capacitor HTTP response');
        },
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic' as ResponseType,
      } as Response;
    } catch (error: any) {
      // Convert Capacitor error to fetch-like error
      throw new TypeError(`Network request failed: ${error.message || 'Unknown error'}`);
    }
  }

  // On web, use standard fetch
  return fetch(url, options);
};

/**
 * Convenience methods
 */
export const http = {
  get: async (url: string, options?: RequestInit) => {
    return httpRequest(url, { ...options, method: 'GET' });
  },

  post: async (url: string, body?: any, options?: RequestInit) => {
    return httpRequest(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  },

  put: async (url: string, body?: any, options?: RequestInit) => {
    return httpRequest(url, {
      ...options,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  },

  delete: async (url: string, options?: RequestInit) => {
    return httpRequest(url, { ...options, method: 'DELETE' });
  },

  patch: async (url: string, body?: any, options?: RequestInit) => {
    return httpRequest(url, {
      ...options,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  },
};

export default httpRequest;
