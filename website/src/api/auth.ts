import fetcher from '../lib/fetcher';
import { TokenState } from '../types/resume'; // Or a more specific auth type if created

// Define the expected response structure for the demo token API
interface DemoTokenResponse {
  token: string;
  captcha_challenge?: string; // Assuming this is optional in the response
  // Add any other fields returned by this endpoint
}

// Define the registration request and response types
interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
  };
  tokens: {
    access: string;
    // refresh: string; // Refresh token is now in an HttpOnly cookie, not in response body
  };
}

export const fetchDemoToken = async (): Promise<Partial<TokenState>> => {
  const response = await fetcher<DemoTokenResponse>('/api/onboard/get-demo-token/', {
    method: 'POST',
    // No body or specific headers needed for this request based on original hook
  });

  // Transform the API response to the TokenState structure
  return {
    token: response.token,
    captchaChallenge: response.captcha_challenge,
    // captchaAnswer will be set by user interaction, not from this API call
  };
};

export const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetcher<RegisterResponse>('/api/auth/register/', {
    method: 'POST',
    body: userData,
  });

  return response;
};

// Define the login request and response types
interface LoginRequest {
  email: string;
  password: string;
}

// Updated LoginResponse to match the new backend response structure
interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    // any other user fields returned
  };
  tokens: {
    access: string;
    // refresh: string; // Refresh token is now in an HttpOnly cookie, not in response body
  };
}

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetcher<LoginResponse>('/api/auth/login/', { // Updated endpoint
    method: 'POST',
    body: credentials,
  });

  // The new /api/auth/login/ endpoint returns user details and tokens directly in the expected structure.
  return response;
};

// Define the logout request (refresh token)
interface LogoutRequest {
  refresh: string;
}

// LogoutResponse can be simple, like an empty object or a success message if your backend sends one
// For TokenBlacklistView, a 204 No Content is typical, so an empty response or just checking status is fine.
interface LogoutResponse { 
    message?: string; // Optional message from backend
    detail?: string; // Optional detail for errors
}

// Updated logoutUser: no longer sends refresh token in body
export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await fetcher<LogoutResponse>('/api/auth/logout/', { // Changed endpoint
    method: 'POST',
    // Body is no longer needed as backend reads refresh token from HttpOnly cookie
  });

  return response;
};

// Define the response type for the refresh token API
interface RefreshTokenResponse {
  access: string;
  // Potentially other fields, but typically just the new access token
}

export const refreshTokenApi = async (): Promise<RefreshTokenResponse> => {
  const response = await fetcher<RefreshTokenResponse>('/api/auth/token/refresh/', {
    method: 'POST',
    // No body is sent, as the refresh token is in an HttpOnly cookie
  });
  return response;
}; 