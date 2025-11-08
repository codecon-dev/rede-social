export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isMockUser?: boolean; // Para identificar usuários mockados
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  likesCount: number;
  hatesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  isLiked?: boolean;
  isHated?: boolean;
}

export interface PostPaged {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface CreatePostRequest {
  content: string;
  image_url?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PatologicalVote {
  id: number;
  voterId: number;
  targetUserId: number;
  voteType: "antipato" | "pato_no_tucupi" | "patotastico";
  createdAt: string;
}

export interface PatologicalVoteStats {
  antipato: number;
  pato_no_tucupi: number;
  patotastico: number;
  total: number;
  percentages: {
    antipato: number;
    pato_no_tucupi: number;
    patotastico: number;
  };
  userVote?: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  is_group: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  members: ChatRoomMember[];
  last_message: ChatMessage | null;
}

export interface CreateChatRoomRequest {
  name?: string;
  is_group?: boolean;
  member_ids?: number[];
}

export interface ChatRoomMember {
  user_id: number;
  room_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface ChatMessage extends ChatRoomMember {
  id: number;
  room_id: number;
  message: string;
  message_type: "text" | "image" | "video";
  is_read: boolean;
  created_at: string;
}
