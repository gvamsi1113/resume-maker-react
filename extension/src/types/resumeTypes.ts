// --- Interfaces for Resume JSON Structure ---
// Extracted from Popup.tsx to share between components/utils

export interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

export interface ResumeLocation {
  city: string;
  region: string;
  country?: string; // Optional
}

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url?: string; // Portfolio or primary URL
  location: ResumeLocation;
  profiles: ResumeProfile[];
}

export interface ResumeWorkItem {
  name: string; // Company Name
  position: string;
  url?: string; // Company URL (Optional)
  startDate: string;
  endDate?: string; // Optional (Present if null/undefined)
  story?: string | null; // Optional narrative
  highlights: string[];
}

export interface ResumeEducationItem {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  gpa?: string; // Optional
  courses?: string[]; // Optional
}

export interface ResumeSkillItem {
  name: string; // Category name (e.g., Frontend)
  level?: string; // Optional (e.g., Advanced)
  keywords: string[];
}

export interface ResumeProjectItem {
  name: string;
  description: string;
  url?: string;
  keywords: string[];
  entity?: string; // Optional (e.g., Personal Project)
  type?: string; // Optional (e.g., Application)
}

export interface ResumeCertificateItem {
  name: string;
  date: string;
  issuer: string;
  url?: string;
}

export interface ResumeLanguageItem {
  language: string;
  fluency: string;
}

// --- Main Resume Data Structure ---
export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  work: ResumeWorkItem[];
  education: ResumeEducationItem[];
  skills: ResumeSkillItem[];
  projects: ResumeProjectItem[];
  certificates?: ResumeCertificateItem[]; // Optional sections
  languages?: ResumeLanguageItem[]; // Optional sections
}
