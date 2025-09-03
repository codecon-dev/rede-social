import React, { useState, useEffect, useCallback } from "react";
import type { Post } from "../types";
import { apiClient } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  // const [postsPagination, setPostsPagination] = useState<PostPaged | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const loadTimeline = useCallback(async () => {
    try {
      const timelinePosts = await apiClient.getTimeline();
      // setPostsPagination(timelinePosts);
      setPosts(timelinePosts.posts);
    } catch (err) {
      setError("Failed to load timeline");
      console.error("Timeline error:", err);
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
      setError("Failed to create post");
      console.error("Create post error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handlePostDeleted = async () => {
    await loadTimeline();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-slate-500'>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='content'>
        <CreatePost onSubmit={handleCreatePost} loading={creating} />

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>}

        <div className='feed'>
          {posts.length === 0 ? (
            <div className='no-content'>
              <span>😢</span>
              <p>
                Você está tão sozinho quanto daquela vez que você ficou chorando no banheiro depois de muito bullying,
                vá fazer amigos!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} currentUserId={user?.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
