import React, { useState } from "react";
import type { Post } from "../types";
import { Avatar, Button, Card, Flex, Tooltip, Text } from "@radix-ui/themes";
import { LuTrash, LuUserPlus } from "react-icons/lu";
import { apiClient } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFollows } from "../contexts/FollowsContext";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: number) => void;
  currentUserId?: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, currentUserId }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { refreshDbFollowsCount } = useFollows();
  const [posts, setPosts] = useState(post);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);

  const canDelete = currentUserId === post.userId;
  const isOwnPost = currentUser?.id === post.userId;
  const isMockUser = posts.user?.isMockUser || false;
  const canFollow = currentUser && !isOwnPost && !isMockUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLike = async () => {
    try {
      const response = await apiClient.toggleLike(posts.id);
      setPosts((prev) => ({
        ...prev,
        isLiked: response.liked,
        likesCount: response.liked ? prev.likesCount + 1 : prev.likesCount - 1,
      }));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleHate = async () => {
    try {
      const response = await apiClient.toggleHate(posts.id);
      setPosts((prev) => ({
        ...prev,
        isHated: response.hated,
        hatesCount: response.hated ? prev.hatesCount + 1 : prev.hatesCount - 1,
      }));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar este post?")) {
      try {
        await apiClient.deletePost(posts.id);
        onPostDeleted?.(posts.id);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleAddToPanelinha = async () => {
    if (!currentUser || !posts.user) return;

    setFollowLoading(true);
    try {
      const response = await apiClient.followUser(posts.user.id);
      setIsFollowing(response.isFollowing);
      await refreshDbFollowsCount();
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <Card className='post' size={"3"}>
      <Flex gap={"2"} align={"center"}>
        <Avatar
          size={"4"}
          radius='full'
          src={posts.user?.avatarUrl}
          fallback={posts.user?.username?.substring(0, 1)?.toUpperCase() || "U"}
        />
        <Flex direction='column' gap='1'>
          <Flex gap='2'>
            <Text
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/" + posts.user?.username)}
              size={"4"}
              weight={"bold"}
            >
              {posts.user?.username || "Unknown User"}
            </Text>
            {canFollow &&
              (isFollowing ? (
                <Tooltip content='Na panelinha'>
                  <Button disabled color='gray' variant='outline' radius='full'>
                    <LuUserPlus />
                    Na panelinha
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip content='Adicionar à panelinha'>
                  <Button
                    onClick={handleAddToPanelinha}
                    color='grass'
                    variant='outline'
                    radius='full'
                    disabled={followLoading}
                  >
                    <LuUserPlus />
                    {followLoading ? "Adicionando..." : "Panelinha"}
                  </Button>
                </Tooltip>
              ))}
          </Flex>
          <Text size={"2"} color={"gray"}>
            {formatDate(posts.createdAt)}
          </Text>
        </Flex>
      </Flex>

      <div className='content'>
        <p>{posts.content}</p>

        {posts.imageUrl && <img src={posts.imageUrl} alt='Post image' className='mt-3 rounded-lg max-w-full h-auto' />}
      </div>
      <div className='post-buttons'>
        <Button onClick={handleHate} variant='outline' radius='full' color={posts.isHated ? "green" : "gray"}>
          <span>{posts.isHated ? "🖕" : "🖕"}</span>
          <span>{posts.hatesCount}</span>
        </Button>

        <Button onClick={handleLike} variant='outline' radius='full' color={posts.isLiked ? "green" : "gray"}>
          <span>{posts.isLiked ? "💚" : "🖤"}</span>
          <span>{posts.likesCount}</span>
        </Button>

        {canDelete && (
          <Tooltip content='Apagar antes que dê treta'>
            <Button onClick={handleDelete} color='red' variant='outline' radius='full'>
              <LuTrash />
            </Button>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default PostCard;
