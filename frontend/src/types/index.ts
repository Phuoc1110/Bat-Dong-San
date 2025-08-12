export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_path: string;
  image_name: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  property_type: 'apartment' | 'house' | 'villa' | 'office' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending';
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  address: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  year_built?: number;
  features?: string[];
  images?: PropertyImage[];
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  title: string;
  description?: string;
  property_type: 'apartment' | 'house' | 'villa' | 'office' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending';
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  address: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  year_built?: number;
  features?: string[];
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  images?: FileList;
}

export interface PropertyFilters {
  page?: number;
  city?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
