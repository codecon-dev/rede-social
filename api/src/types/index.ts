export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

export interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}
