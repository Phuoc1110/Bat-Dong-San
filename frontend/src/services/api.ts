import axios, { AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  Property, 
  PropertyFormData, 
  PropertyFilters, 
  ApiResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/login', credentials),
  
  logout: (): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/logout'),
};

// Properties API
export const propertiesApi = {
  getProperties: (filters?: PropertyFilters): Promise<AxiosResponse<ApiResponse<Property[]>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/properties?${params.toString()}`);
  },

  getProperty: (id: number): Promise<AxiosResponse<Property>> =>
    api.get(`/properties/${id}`),

  createProperty: (data: PropertyFormData): Promise<AxiosResponse<ApiResponse<Property>>> => {
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && value instanceof FileList) {
        // Handle multiple file upload
        Array.from(value).forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === 'features' && Array.isArray(value)) {
        // Handle features array
        value.forEach((feature, index) => {
          formData.append(`features[${index}]`, feature);
        });
      } else if (value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    return api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateProperty: (id: number, data: Partial<PropertyFormData>): Promise<AxiosResponse<ApiResponse<Property>>> => {
    const formData = new FormData();
    
    // Add _method for Laravel to handle PUT request with multipart data
    formData.append('_method', 'PUT');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && value instanceof FileList) {
        Array.from(value).forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === 'features' && Array.isArray(value)) {
        value.forEach((feature, index) => {
          formData.append(`features[${index}]`, feature);
        });
      } else if (value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    return api.post(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteProperty: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/properties/${id}`),

  restoreProperty: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.post(`/properties/${id}/restore`),

  uploadImages: (id: number, images: FileList): Promise<AxiosResponse<{ message: string }>> => {
    const formData = new FormData();
    Array.from(images).forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    return api.post(`/properties/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (propertyId: number, imageId: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/properties/${propertyId}/images/${imageId}`),
};

export default api;
