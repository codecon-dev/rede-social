import React from 'react';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
  currentUserId?: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete, currentUserId }) => {
  const canDelete = currentUserId === post.userId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {post.user?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-slate-900">
            {post.user?.username || 'Unknown User'}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(post.createdAt)}
          </p>
        </div>
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-slate-900">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="mt-3 rounded-lg max-w-full h-auto"
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-1 ${
            post.isLiked ? 'text-red-600' : 'text-slate-500 hover:text-red-600'
          }`}
        >
          <span>{post.isLiked ? '❤️' : '🤍'}</span>
          <span className="text-sm">{post.likesCount}</span>
        </button>
        
        <div className="flex items-center space-x-1 text-slate-500">
          <span>💬</span>
          <span className="text-sm">{post.commentsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;