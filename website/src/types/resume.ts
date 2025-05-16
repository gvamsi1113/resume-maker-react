// src/types/resume.ts

export interface SocialLink {
  platform?: string; // e.g., 'LinkedIn', 'GitHub', 'Portfolio'
  url?: string;
  username?: string; // Optional, if applicable
}

export interface WorkExperience {
  name?: string; // Company Name
  position?: string; // Job Title
  url?: string; // Company URL
  startDate?: string;
  endDate?: string; // Can be 'Present'
  story?: string; // Summary/description of the role
  highlights?: string[]; // Responsibilities/Achievements
}

export interface EducationEntry {
  institution?: string;
  area?: string; // e.g., 'Architecture', 'Computer Science'
  studyType?: string; // e.g., 'Bachelor of Architecture', 'M.S.'
  startDate?: string;
  endDate?: string;
  gpa?: string;
  achievements?: string[];
}

export interface SkillCategory {
  category?: string;
  skills?: string[];
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  technologies_used?: string[];
  link?: string;
}

export interface CertificateEntry {
  name?: string;
  issuing_organization?: string;
  date_obtained?: string;
  url?: string; // Optional link to the certificate
}

export interface EnhancedResumeData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  socials?: SocialLink[];
  summary?: string;
  work?: WorkExperience[];
  projects?: ProjectEntry[]; // Was empty in example, but kept structure
  skills?: SkillCategory[];
  education?: EducationEntry[];
  languages?: string[];
  certificates?: CertificateEntry[]; // Was empty in example, but kept structure
  other_extracted_data?: string;
}

export interface ResumeResponse {
  id?: string; // Kept from previous, though not in new JSON example. Optional now.
  message?: string; // Optional message from backend
  enhanced_resume_data: EnhancedResumeData; // Changed from structured_resume
}

// These might be better placed in a more specific types file like `upload.ts` if not broadly used
export interface TokenState {
  token: string | null;
  captchaChallenge?: string | null;
  captchaAnswer?: string | null;
  isDemo?: boolean;
  error?: string | null;
  loading?: boolean;
}

export interface FileUploadState {
  file: File | null;
  uploadProgress: number;
  isDraggingOver: boolean;
  uploading: boolean;
  error: string | null;
} 