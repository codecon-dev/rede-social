import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Post, 
  UpdateProfileRequest, 
  CreatePostRequest, 
  PostPaged
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getTimeline(): Promise<PostPaged> {
    return this.request<PostPaged>('/users/timeline');
  }

  async getUserProfile(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: number): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`);
  }

  async toggleLike(postId: number): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async deletePost(postId: number): Promise<void> {
    return this.request<void>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();