import fetcher from '../lib/fetcher';
import { ResumeResponse, TokenState } from '../types/resume'; // Adjusted path

interface ProcessResumeParams {
  file: File;
  tokenState: TokenState; 
}

export const processResume = async ({
  file,
  tokenState,
}: ProcessResumeParams): Promise<ResumeResponse> => {
  const formData = new FormData();
  formData.append('resume_file', file);

  if (tokenState.captchaChallenge && tokenState.captchaAnswer) {
    formData.append('captcha_challenge', tokenState.captchaChallenge);
    formData.append('captcha_answer', tokenState.captchaAnswer);
  }

  const headers: HeadersInit = {};
  if (tokenState.token) {
    headers['X-Demo-Token'] = tokenState.token;
  }

  return fetcher<ResumeResponse>('/api/onboard/process-resume/', {
    method: 'POST',
    headers,
    body: formData, // Pass FormData directly, fetcher will not stringify it if Content-Type is not application/json
  });
}; 