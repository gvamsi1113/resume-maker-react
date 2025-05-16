import fetcher from '../lib/fetcher';
import { TokenState } from '../types/resume'; // Or a more specific auth type if created

// Define the expected response structure for the demo token API
interface DemoTokenResponse {
  token: string;
  captcha_challenge?: string; // Assuming this is optional in the response
  // Add any other fields returned by this endpoint
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