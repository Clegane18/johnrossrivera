export interface ProjectRepo {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  repoUrl?: string;
  repoUrls?: ProjectRepo[];
  imageUrl?: string;
  images?: string[];
  mobileImages?: string[];
  featured: boolean;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | "Present";
  description: string[];
  tech: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
