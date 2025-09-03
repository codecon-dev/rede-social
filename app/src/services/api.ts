import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Post,
  UpdateProfileRequest,
  CreatePostRequest,
  PostPaged,
  PatologicalVoteStats,
  CreateChatRoomRequest,
  ChatRoom,
  ChatMessage,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api";

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
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
      const error = await response.json().catch(() => ({ message: "Network error" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getTimeline(): Promise<PostPaged> {
    return this.request<PostPaged>("/users/timeline");
  }

  async getUserTimeline(userId: number): Promise<PostPaged> {
    console.error("Esta api não está implementada, sorry!");
    return this.request<PostPaged>("/users/" + userId + "/posts");
  }

  async getUserProfile(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/username/${username}`);
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    return this.request<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    return this.request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: number): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`);
  }

  async toggleLike(postId: number): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/posts/${postId}/like`, {
      method: "POST",
    });
  }
  async toggleHate(postId: number): Promise<{ hated: boolean }> {
    return this.request<{ hated: boolean }>(`/posts/${postId}/hate`, {
      method: "POST",
    });
  }

  async deletePost(postId: number): Promise<void> {
    return this.request<void>(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async followUser(userId: number): Promise<{ message: string; isFollowing: boolean }> {
    return this.request<{ message: string; isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: "POST",
    });
  }

  async unfollowUser(userId: number): Promise<{ message: string; isFollowing: boolean }> {
    return this.request<{ message: string; isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: "DELETE",
    });
  }

  async checkFollowStatus(userId: number): Promise<{ isFollowing: boolean }> {
    return this.request<{ isFollowing: boolean }>(`/users/${userId}/follow-status`);
  }

  async getPanelinhaMembersCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>("/users/panelinha/count");
  }

  async getPanelinhaMembers(): Promise<{
    members: User[];
    pagination: { page: number; limit: number; hasMore: boolean };
  }> {
    return this.request<{
      members: User[];
      pagination: { page: number; limit: number; hasMore: boolean };
    }>("/users/panelinha/members");
  }

  async votePatological(
    targetUserId: number,
    voteType: "antipato" | "pato_no_tucupi" | "patotastico"
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/users/${targetUserId}/patological-vote`, {
      method: "POST",
      body: JSON.stringify({ voteType }),
    });
  }

  async getPatologicalVoteStats(targetUserId: number): Promise<PatologicalVoteStats> {
    return this.request<PatologicalVoteStats>(`/users/${targetUserId}/patological-stats`);
  }

  async createChatRoom(data: CreateChatRoomRequest) {
    return this.request<ChatRoom>("/chat/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserChatRooms(): Promise<ChatRoom[]> {
    return this.request<ChatRoom[]>("/chat/rooms");
  }

  async getChatRoomMessages(room_id: number, page: number = 1, limit: number = 1000): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/rooms/${room_id}/messages?page=${page}&limit=${limit}`);
  }
}

export const apiClient = new ApiClient();
