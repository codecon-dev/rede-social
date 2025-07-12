import React, { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Navbar from '../components/Navbar';

interface HomePageProps {
  onProfileClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onProfileClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  // const [postsPagination, setPostsPagination] = useState<PostPaged | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const loadTimeline = useCallback(async () => {
    try {
      const timelinePosts = await apiClient.getTimeline();
      // setPostsPagination(timelinePosts);
      setPosts(timelinePosts.posts);
    } catch (err) {
      setError('Failed to load timeline');
      console.error('Timeline error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleCreatePost = async (content: string) => {
    setCreating(true);
    try {
      await apiClient.createPost({ content });
      await loadTimeline();
    } catch (err) {
      setError('Failed to create post');
      console.error('Create post error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await apiClient.toggleLike(postId);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: response.liked,
            likesCount: response.liked ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiClient.deletePost(postId);
        await loadTimeline();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar onProfileClick={onProfileClick} />
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onProfileClick={onProfileClick} />
      
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CreatePost onSubmit={handleCreatePost} loading={creating} />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No posts yet. Create the first one!
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;