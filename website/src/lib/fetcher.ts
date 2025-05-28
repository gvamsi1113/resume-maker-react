// src/lib/fetcher.ts
import { refreshTokenApi } from '@/api/auth'; // For refresh logic
// It's assumed that useAuth hook or a global state will manage the actual token state.
// For now, this fetcher will read from localStorage for the access token and update it upon refresh.

interface FetcherOptions extends RequestInit {
  body?: any;
  isRetry?: boolean; // Flag to prevent retry loops on refresh endpoint
}

interface FetchError extends Error {
  response?: Response;
  data?: any;
}

// Flag to prevent multiple concurrent refresh attempts
let isRefreshingToken = false;
// A list of subscribers waiting for the new token
let refreshSubscribers: Array<(token: string | null) => void> = [];

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string | null) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = []; // Clear subscribers
};

const fetcher = async <T>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Prepare headers
  const baseHeaders: Record<string, string> = {
    // Default to Content-Type: application/json but allow override
  };
  if (!(options.body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const mergedHeaders: Record<string, string> = {
    ...baseHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Authorization header if an access token exists and not already provided
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (accessToken && !mergedHeaders.Authorization) {
    mergedHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: mergedHeaders, // Use the correctly typed mergedHeaders
    credentials: 'include', // Tell fetch to include cookies and auth headers for cross-origin requests
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      // Let browser set Content-Type for FormData
      if (config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers)) {
        delete (config.headers as Record<string, string>)['Content-Type'];
      }
      config.body = options.body;
    } else if (config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers) && (config.headers as Record<string, string>)['Content-Type'] === 'application/json') {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }

  const performFetch = async (currentConfig: RequestInit): Promise<Response> => {
    return fetch(`${baseURL}${url}`, currentConfig);
  };

  try {
    let response = await performFetch(config);

    if (!response.ok) {
      if (response.status === 401 && !options.isRetry && !url.includes('/api/auth/token/refresh/')) {
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          try {
            const refreshResponse = await refreshTokenApi();
            const newAccessToken = refreshResponse.access;
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', newAccessToken);
            }
            onTokenRefreshed(newAccessToken); // Notify subscribers
            isRefreshingToken = false;

            // Update Authorization header for the current request and retry
            const newConfig = { ...config };
            newConfig.headers = { ...newConfig.headers, Authorization: `Bearer ${newAccessToken}` };
            response = await performFetch(newConfig); // Retry the original request
            
            // If retried request is still not ok, throw error to be caught below
            if (!response.ok) throw response; // Throw response to be handled by generic error handler

          } catch (refreshError: any) {
            isRefreshingToken = false;
            onTokenRefreshed(null); // Notify subscribers of failure
            console.error('Token refresh failed:', refreshError);
            // Here, you should trigger a full logout
            // For example: window.dispatchEvent(new Event('auth-logout-event'));
            // or redirect: window.location.href = '/login';
            if (typeof window !== 'undefined') { // Clear potentially stale token
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login'; // Force redirect
            }
            // Construct an error similar to how other errors are handled
            const err: FetchError = new Error('Token refresh failed, logging out.');
            err.response = refreshError.response || new Response(null, {status: 401});
            err.data = refreshError.data || { detail: 'Token refresh failed.'};
            throw err;
          }
        } else {
          // Is refreshing, queue the request by waiting for the token
          return new Promise<Response>((resolve, reject) => {
            addRefreshSubscriber(async (newAccessToken) => {
              if (newAccessToken) {
                const newConfig = { ...config };
                newConfig.headers = { ...newConfig.headers, Authorization: `Bearer ${newAccessToken}` };
                try {
                    const retriedResponse = await performFetch(newConfig);
                     // If retried request is not ok, throw error to be caught by outer try-catch
                    if (!retriedResponse.ok) throw retriedResponse;
                    resolve(retriedResponse);
                } catch (retryErrorResponse: any) { // Catch error from retry (could be non-ok response)
                    // Construct error to be handled by the main error handler
                    const err: FetchError = new Error(
                        `API Error (after refresh): ${retryErrorResponse.status} ${retryErrorResponse.statusText}`
                    );
                    try { err.data = await retryErrorResponse.json(); } catch { try {err.data = await retryErrorResponse.text(); } catch { err.data = 'Could not parse error.'}}
                    err.response = retryErrorResponse;
                    reject(err);
                }

              } else {
                // Refresh failed, reject this queued request
                const err: FetchError = new Error('Token refresh failed while request was queued.');
                err.response = new Response(null, {status: 401}); // Simulate a 401
                err.data = { detail: 'Token refresh failed.'};
                reject(err);
              }
            });
          }).then(async (resolvedResponse) => { // This .then handles the resolved promise from queuing
              response = resolvedResponse; // Assign resolved response to outer response variable
              if (!response.ok) throw response; // If still not ok, throw to be caught by main error handler
              
              // Process response to T, similar to the main success path
              if (response.status === 204) {
                return null as unknown as T;
              }
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return await response.json() as T;
              }
              const text = await response.text();
              try {
                  return JSON.parse(text) as T;
              } catch (e) {
                  return text as unknown as T;
              }
          });
        }
      }
      // If not 401 or if it's a retry/refresh endpoint, or if already thrown by refresh logic, throw generic error
      // This 'if' condition is critical. If response has been handled and re-thrown by refresh logic, this should catch it.
      // If the response object itself was thrown (e.g. from `if (!response.ok) throw response;`)
      if (!response.ok) {
        const error: FetchError = new Error(
            `API Error: ${response.status} ${response.statusText}`
        );
        try {
            error.data = await response.json();
        } catch (e) {
            try {
            error.data = await response.text();
            } catch (textError) {
            error.data = 'Could not parse error response body.';
            }
        }
        error.response = response;
        throw error;
      }
    }

    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    // For non-JSON, attempt to parse as text, then try JSON.parse on text
    return response.text().then(text => {
        try {
            return JSON.parse(text) as T;
        } catch (e) {
            return text as unknown as T;
        }
    });

  } catch (error) { // This is the main catch block for all errors
    const fetchError = error as FetchError;
    // Ensure proper error logging
    console.error(
        'API Fetch Error:',
        fetchError.message,
        fetchError.data ? `Data: ${typeof fetchError.data === 'string' ? fetchError.data : JSON.stringify(fetchError.data)}` : '',
        fetchError.response ? `Status: ${fetchError.response.status}` : ''
    );
    throw fetchError; // Re-throw the processed error
  }
};

export default fetcher; 