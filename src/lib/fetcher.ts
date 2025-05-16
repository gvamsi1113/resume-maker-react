// src/lib/fetcher.ts
interface FetcherOptions extends RequestInit {
  body?: any;
}

interface FetchError extends Error {
  response?: Response;
  data?: any;
}

const fetcher = async <T>(url: string, options: FetcherOptions = {}): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Add other default headers here, e.g., Authorization token
    ...options.headers,
  };

  // Example: Injecting a token from localStorage or a state management solution
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${baseURL}${url}`, config);

    if (!response.ok) {
      const error: FetchError = new Error('An error occurred while fetching the data.');
      try {
        error.data = await response.json();
      } catch (e) {
        // If response is not JSON, use text
        error.data = await response.text();
      }
      error.response = response;
      throw error;
    }

    // Handle cases where response might be empty (e.g., for DELETE requests)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json() as Promise<T>;
    }
    // If no content or not json, resolve with the response itself or null
    // This might need adjustment based on API behavior for non-JSON responses
    return response.text().then(text => text ? JSON.parse(text) : null) as Promise<T>;


  } catch (error) {
    console.error('API Fetch Error:', error);
    // You can add more sophisticated error handling/formatting here
    // For example, logging to an error reporting service
    throw error; // Re-throw the error so it can be caught by React Query
  }
};

export default fetcher; 