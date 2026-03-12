export type TopCard = {
  full_name: string | null;
  headline: string | null;
  org_school_line: string | null;
  location: string | null;
  contact_info_link: string | null;
  connections_text: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
};

export type ExtractedSection = {
  id: string;
  heading: string | null;
  raw_html: string;
  raw_text: string;
  items: unknown[];
};

export type LinkedInExport = {
  source: {
    platform: "linkedin";
    profile_url: string;
    captured_at: string;
  };
  top_card: TopCard;
  sections: ExtractedSection[];
  warnings: string[];
};

export type ExtractOptions = {
  onProgress?: (state: string) => void;
  expandSections?: boolean;
  scrollPage?: boolean;
};

export type AboutSection = {
  about_text: string | null;
};

export type ExperienceItem = {
  title: string | null;
  company: string | null;
  date_range_raw: string | null;
  location: string | null;
  description: string | null;
};

export type EducationItem = {
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
  date_range_raw: string | null;
  description: string | null;
};

export type SkillsSection = {
  skills: string[];
};

export type ProjectItem = {
  name: string | null;
  description: string | null;
  date_range_raw: string | null;
  url: string | null;
};

export type CertificationItem = {
  name: string | null;
  issuer: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
};

export type PublicationItem = {
  title: string | null;
  publisher: string | null;
  published_date: string | null;
  description: string | null;
  url: string | null;
};

export type RecommendationItem = {
  author: string | null;
  text: string | null;
  relationship: string | null;
};

export type WebhookConfig = {
  endpoint: string;
  headers?: Record<string, string>;
  extra_payload?: Record<string, unknown>;
};

export type OverlayState =
  | "validating"
  | "expanding"
  | "scrolling"
  | "extracting"
  | "normalizing"
  | "exporting"
  | "complete"
  | "error";
