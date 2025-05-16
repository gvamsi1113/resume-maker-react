// src/lib/fetcher.ts
interface FetcherOptions extends RequestInit {
  body?: any;
}

interface FetchError extends Error {
  response?: Response;
  data?: any;
}

const fetcher = async <T>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Initialize headers. Default to Content-Type: application/json
  // but allow it to be overridden by options.headers or cleared for FormData.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers: headers, // Initially set headers from merged options
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      // If body is FormData, delete Content-Type header to let the browser set it automatically.
      // This is crucial for multipart/form-data with boundary to work correctly.
      delete headers['Content-Type'];
      config.body = options.body;
    } else if (headers['Content-Type'] === 'application/json') {
      // Only stringify body if it's not FormData and Content-Type is application/json.
      config.body = JSON.stringify(options.body);
    } else {
      // For other content types (e.g., text/plain), pass body as is.
      config.body = options.body;
    }
  }
  
  // Ensure the final config.headers reflects any changes (e.g., Content-Type deletion for FormData)
  config.headers = headers;

  try {
    const response = await fetch(`${baseURL}${url}`, config);

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

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    // For non-JSON responses, attempt to return as text.
    // This can be adjusted if other specific content types need handling.
    return response.text().then(text => {
        // If the response was text but expected to be T (e.g. an object after JSON.parse)
        // this could be an issue. This part assumes T might be string or needs parsing.
        // For strong typing, the caller should know what to expect or T should be `unknown` or `any` 
        // if the response type is truly variable beyond JSON/text.
        try {
            // Attempt to parse if it looks like JSON, covers cases where Content-Type might be missing/wrong
            return JSON.parse(text) as T;
        } catch (e) {
            return text as unknown as T; // Fallback to raw text if not parsable JSON
        }
    });

  } catch (error) {
    if (error instanceof Error) {
        console.error(
            'API Fetch Error:',
            error.message,
            (error as FetchError).data ? `Data: ${JSON.stringify((error as FetchError).data)}` : ''
        );
        throw error; 
    } else {
        console.error('API Fetch Error (unknown type):', error);
        throw new Error('An unknown error occurred during fetch.');
    }
  }
};

export default fetcher; 