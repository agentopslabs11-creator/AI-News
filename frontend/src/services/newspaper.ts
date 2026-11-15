import { apiClient } from './api';
import {
  NewspaperEdition,
  NewspaperEditionDetail,
  Article,
  VideoItem,
  Category,
  DashboardStats,
  ActivityLog,
  ArchiveTreeResponse,
  HTMLValidationResult,
  LanguageCode,
  Advertisement
} from '../types';

export const newspaperService = {
  // --- Public APIs ---
  async getPublishedEditions(language?: LanguageCode, limit = 20): Promise<NewspaperEdition[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    params.append('limit', limit.toString());
    const res = await apiClient.get<NewspaperEdition[]>(`/public/editions?${params}`);
    return res.data;
  },

  async getLatestEdition(language: LanguageCode): Promise<NewspaperEditionDetail> {
    const res = await apiClient.get<NewspaperEditionDetail>(`/public/editions/${language}/latest`);
    return res.data;
  },

  async getEditionByDate(language: LanguageCode, dateStr: string): Promise<NewspaperEditionDetail> {
    const res = await apiClient.get<NewspaperEditionDetail>(`/public/editions/${language}/${dateStr}`);
    return res.data;
  },

  async getCombinedLatestNews(language?: LanguageCode, limit = 20): Promise<Article[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    params.append('limit', limit.toString());
    const res = await apiClient.get<Article[]>(`/public/latest-news?${params}`);
    return res.data;
  },

  async getBreakingNews(language?: LanguageCode): Promise<Article[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    const res = await apiClient.get<Article[]>(`/public/breaking?${params}`);
    return res.data;
  },

  async getArticles(params?: {
    language?: LanguageCode;
    category_slug?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.language) query.append('language', params.language);
    if (params?.category_slug) query.append('category_slug', params.category_slug);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const res = await apiClient.get<Article[]>(`/public/articles?${query}`);
    return res.data;
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const res = await apiClient.get<Article>(`/public/articles/${slug}`);
    return res.data;
  },

  async getVideos(language?: LanguageCode, limit = 12): Promise<VideoItem[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    params.append('limit', limit.toString());
    const res = await apiClient.get<VideoItem[]>(`/public/videos?${params}`);
    return res.data;
  },

  async getCategories(language?: LanguageCode): Promise<Category[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    const res = await apiClient.get<Category[]>(`/public/categories?${params}`);
    return res.data;
  },

  async getArchiveTree(language?: LanguageCode, year?: number): Promise<ArchiveTreeResponse> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (year) params.append('year', year.toString());
    const res = await apiClient.get<ArchiveTreeResponse>(`/public/archive?${params}`);
    return res.data;
  },

  // --- Admin APIs ---
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    recent_activity: ActivityLog[];
    admin: any;
  }> {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  async validateHTML(file: File): Promise<HTMLValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<HTMLValidationResult>('/admin/editions/validate', formData);
    return res.data;
  },

  async uploadEdition(formData: FormData): Promise<NewspaperEdition> {
    const res = await apiClient.post<NewspaperEdition>('/admin/editions/upload', formData);
    return res.data;
  },

  async replaceEditionHTML(editionId: number, file: File): Promise<NewspaperEdition> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<NewspaperEdition>(`/admin/editions/${editionId}/replace-html`, formData);
    return res.data;
  },

  async updateEditionMetadata(editionId: number, data: { title?: string; description?: string; status?: string }): Promise<NewspaperEdition> {
    const res = await apiClient.put<NewspaperEdition>(`/admin/editions/${editionId}`, data);
    return res.data;
  },

  async publishEdition(editionId: number): Promise<NewspaperEdition> {
    const res = await apiClient.post<NewspaperEdition>(`/admin/editions/${editionId}/publish`);
    return res.data;
  },

  async unpublishEdition(editionId: number): Promise<NewspaperEdition> {
    const res = await apiClient.post<NewspaperEdition>(`/admin/editions/${editionId}/unpublish`);
    return res.data;
  },

  async deleteEdition(editionId: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/editions/${editionId}`);
    return res.data;
  },

  async getAdminEditions(params?: {
    language?: string;
    status?: string;
    publication_date?: string;
  }): Promise<NewspaperEdition[]> {
    const query = new URLSearchParams();
    if (params?.language) query.append('language', params.language);
    if (params?.status) query.append('status', params.status);
    if (params?.publication_date) query.append('publication_date', params.publication_date);
    const res = await apiClient.get<NewspaperEdition[]>(`/admin/editions?${query}`);
    return res.data;
  },

  async getAdminEditionDetail(id: number): Promise<NewspaperEditionDetail> {
    const res = await apiClient.get<NewspaperEditionDetail>(`/admin/editions/${id}`);
    return res.data;
  },

  // Article Admin APIs
  async getAdminArticles(params?: { language?: string; category_id?: number; status?: string }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.language) query.append('language', params.language);
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.status) query.append('status', params.status);
    const res = await apiClient.get<Article[]>(`/admin/articles?${query}`);
    return res.data;
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const res = await apiClient.post<Article>('/admin/articles', data);
    return res.data;
  },

  async updateArticle(id: number, data: Partial<Article>): Promise<Article> {
    const res = await apiClient.put<Article>(`/admin/articles/${id}`, data);
    return res.data;
  },

  async deleteArticle(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/articles/${id}`);
    return res.data;
  },

  async bulkDeleteArticles(ids: number[]): Promise<{ deleted_count: number; message: string }> {
    const res = await apiClient.post<{ deleted_count: number; message: string }>('/admin/articles/bulk-delete', {
      article_ids: ids
    });
    return res.data;
  },

  // Category Admin APIs
  async getAdminCategories(language?: string): Promise<Category[]> {
    const query = new URLSearchParams();
    if (language) query.append('language', language);
    const res = await apiClient.get<Category[]>(`/admin/categories?${query}`);
    return res.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await apiClient.post<Category>('/admin/categories', data);
    return res.data;
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const res = await apiClient.put<Category>(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/categories/${id}`);
    return res.data;
  },

  // Video Admin APIs
  async getAdminVideos(language?: string, status?: string): Promise<VideoItem[]> {
    const query = new URLSearchParams();
    if (language) query.append('language', language);
    if (status) query.append('status', status);
    const res = await apiClient.get<VideoItem[]>(`/admin/videos?${query}`);
    return res.data;
  },

  async createVideo(data: { title: string; description?: string; youtube_url: string; language: string; status?: string }): Promise<VideoItem> {
    const res = await apiClient.post<VideoItem>('/admin/videos', data);
    return res.data;
  },

  async updateVideo(id: number, data: Partial<VideoItem>): Promise<VideoItem> {
    const res = await apiClient.put<VideoItem>(`/admin/videos/${id}`, data);
    return res.data;
  },

  async deleteVideo(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/videos/${id}`);
    return res.data;
  },

  // Activity Logs
  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const res = await apiClient.get<ActivityLog[]>(`/admin/activity-logs?limit=${limit}`);
    return res.data;
  },

  // Advertisements APIs
  async getAdvertisements(): Promise<{ left: Advertisement[]; right: Advertisement[] }> {
    const res = await apiClient.get<{ left: Advertisement[]; right: Advertisement[] }>('/public/advertisements');
    return res.data;
  },

  async getAdminAdvertisements(side?: string): Promise<Advertisement[]> {
    const query = new URLSearchParams();
    if (side) query.append('side', side);
    const res = await apiClient.get<Advertisement[]>(`/admin/advertisements?${query}`);
    return res.data;
  },

  async createAdvertisement(data: Partial<Advertisement>): Promise<Advertisement> {
    const res = await apiClient.post<Advertisement>('/admin/advertisements', data);
    return res.data;
  },

  async updateAdvertisement(id: number, data: Partial<Advertisement>): Promise<Advertisement> {
    const res = await apiClient.put<Advertisement>(`/admin/advertisements/${id}`, data);
    return res.data;
  },

  async deleteAdvertisement(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/advertisements/${id}`);
    return res.data;
  }
};
