export interface RecentApplicationJobPostSummary {
  id: string;
  job_title: string | null;
  company_name: string | null;
  source_url: string | null;
  apply_link?: string | null;
}

export interface RecentApplicationItem {
  resume_id: string;
  resume_name: string;
  resume_updated_at: string; // ISO date string
  job_post: RecentApplicationJobPostSummary;
  is_base_resume: boolean;
}

export interface PaginatedRecentApplicationsResponse {
  count: number;
  next: string | null; // URL for the next page
  previous: string | null; // URL for the previous page
  results: RecentApplicationItem[];
} 