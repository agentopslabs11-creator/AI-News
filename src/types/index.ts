export type LanguageCode = 'en' | 'te' | 'hi';

export interface Category {
  id: number;
  name: string;
  slug: string;
  language?: LanguageCode | null;
  created_at?: string;
}

export interface NewspaperEdition {
  id: number;
  title: string;
  language: LanguageCode;
  publication_date: string; // YYYY-MM-DD
  description?: string | null;
  original_filename: string;
  content_size: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface NewspaperEditionDetail extends NewspaperEdition {
  html_content: string; // Raw sanitized newspaper HTML
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  language: LanguageCode;
  description?: string | null;
  content: string;
  image_url?: string | null;
  category_id?: number | null;
  edition_id?: number | null;
  status: 'draft' | 'published';
  is_breaking: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  category?: Category | null;
  edition?: NewspaperEdition | null;
}

export interface VideoItem {
  id: number;
  title: string;
  description?: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url?: string | null;
  language: LanguageCode;
  status: 'draft' | 'published';
  created_at: string;
  published_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  admin_id?: number | null;
  admin_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_published_editions: number;
  english_editions: number;
  telugu_editions: number;
  hindi_editions: number;
  draft_editions: number;
  total_articles: number;
  total_videos: number;
  total_categories: number;
  total_ads?: number;
  active_advertisements?: number;
}

export interface ArchiveDay {
  date: string;
  day: number;
  editions: NewspaperEdition[];
}

export interface ArchiveMonth {
  month_num: number;
  month_name: string;
  days: ArchiveDay[];
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}

export interface ArchiveTreeResponse {
  total_editions: number;
  years: ArchiveYear[];
}

export interface HTMLValidationResult {
  valid: boolean;
  title?: string;
  headings_count: number;
  sample_headings: string[];
  external_images_count: number;
  content_size_bytes: number;
  sanitized: boolean;
  warning?: string | null;
  file_format?: 'html' | 'pdf';
  detected_type?: string;
}

export interface Advertisement {
  id: number;
  title: string;
  image_url: string;
  link_url?: string | null;
  side: 'left' | 'right';
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface AdvertisementInput {
  title: string;
  image_url: string;
  link_url: string;
  side: 'left' | 'right';
  position: number;
  is_active: boolean;
}
