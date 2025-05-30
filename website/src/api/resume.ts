import fetcher from '../lib/fetcher';
import { type EnhancedResumeData, type ResumeResponse as ResumeResponseType, type TokenState } from '@/types/resume';
import { type PaginatedRecentApplicationsResponse } from '@/types/applications';

interface ProcessResumeParams {
  file: File;
  tokenState: TokenState; 
}

/**
 * Processes a resume, potentially with captcha and demo token.
 *
 * @param {ProcessResumeParams} params - The parameters for processing the resume.
 * @returns {Promise<ResumeResponseType>} A promise that resolves to the processed resume data.
 */
export const processResume = async ({
  file,
  tokenState,
}: ProcessResumeParams): Promise<ResumeResponseType> => {
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

  return fetcher<ResumeResponseType>('/api/onboard/process-resume/', {
    method: 'POST',
    headers,
    body: formData,
  });
};

/**
 * Attaches a resume to a user.
 *
 * @param {string} resumeId - The ID of the resume to attach.
 * @returns {Promise<{ success: boolean; message?: string }>} A promise that resolves to an object indicating success or failure.
 */
export const attachBaseResume = async (resumeId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetcher<{ message?: string, detail?: string, resume?: EnhancedResumeData }>('/api/resumes/attach-user/', {
            method: 'POST',
            body: {
                resume_id: resumeId,
            },
        });
        return { success: true, message: response.message || 'Resume attached successfully' };
    } catch (error: any) {
        console.error('Error attaching resume to user:', error);
        const errorMessage = error.data?.detail || error.data?.message || error.message || 'An unexpected error occurred while attaching resume.';
        return { success: false, message: errorMessage };
    }
};

/**
 * Fetches the base resume for the authenticated user.
 *
 * @returns {Promise<EnhancedResumeData>} A promise that resolves to the base resume data.
 */
export const getBaseResume = async (): Promise<EnhancedResumeData> => {
  return fetcher<EnhancedResumeData>('/api/resumes/base/', {
    method: 'GET',
  });
};

/**
 * Fetches a paginated list of recent applications (resumes associated with job posts).
 *
 * @param {number} [page=1] - The page number to fetch.
 * @param {number} [pageSize=10] - The number of items per page.
 * @returns {Promise<PaginatedRecentApplicationsResponse>} A promise that resolves to the paginated list of recent applications.
 */
export const getRecentApplications = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedRecentApplicationsResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  return fetcher<PaginatedRecentApplicationsResponse>(`/api/resumes/recent-applications/?${queryParams.toString()}`, {
    method: 'GET',
  });
};
