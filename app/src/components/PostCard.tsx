import React, { useState } from 'react';
import type { Post } from '../types';
import { Avatar, Button, Card, Flex, Tooltip, Text } from '@radix-ui/themes';
import { LuMessageCircle, LuTrash } from 'react-icons/lu';
import { apiClient } from '../services/api';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: number) => void;
  currentUserId?: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, currentUserId }) => {
  const [postState, setPostState] = useState(post);
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

  const handleLike = async () => {
    try {
      const response = await apiClient.toggleLike(postState.id);
      setPostState(prev => ({
        ...prev,
        isLiked: response.liked,
        likesCount: response.liked ? prev.likesCount + 1 : prev.likesCount - 1
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleHate = async () => {
    try {
      const response = await apiClient.toggleHate(postState.id);
      setPostState(prev => ({
        ...prev,
        isHated: response.hated,
        hatesCount: response.hated ? prev.hatesCount + 1 : prev.hatesCount - 1
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      try {
        await apiClient.deletePost(postState.id);
        onPostDeleted?.(postState.id);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <Card className='post' size={'3'}>
      <Flex gap={'2'} align={'center'}>
        <Avatar size={'4'} radius='full' src={postState.user?.avatarUrl} fallback={postState.user?.username?.substring(0, 1)?.toUpperCase() || 'U'} />
        <div>
          <Text size={'4'} weight={'bold'}>
            {postState.user?.username || 'Unknown User'}
          </Text> <br />
          <Text size={'2'} color={'gray'}>
            {formatDate(postState.createdAt)}
          </Text>
        </div>
      </Flex>

      <div className="content">
        <p>{postState.content}</p>

        {postState.imageUrl && (
          <img
            src={postState.imageUrl}
            alt="Post image"
            className="mt-3 rounded-lg max-w-full h-auto"
          />
        )}
      </div>
      <div className='post-buttons'>
        <Button
          onClick={handleHate}
          variant='outline' radius='full'
          color={postState.isHated ? 'green' : 'gray'}>
          <span>{postState.isHated ? '🖕' : '🖕'}</span>
          <span>{postState.hatesCount}</span>
        </Button>

        <Button
          onClick={handleLike}
          variant='outline' radius='full'
          color={postState.isLiked ? 'green' : 'gray'}>
          <span>{postState.isLiked ? '💚' : '🖤'}</span>
          <span>{postState.likesCount}</span>
        </Button>

        {canDelete && (
          <Tooltip content="Apagar antes que dê treta">
            <Button onClick={handleDelete} color='red' variant='outline' radius='full'>
              <LuTrash />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className="comments-count">
        <div className='comments-content'>
          <span><LuMessageCircle /></span>
          <span>{postState.commentsCount === 0 ? 'Ninguém te deu atenção' : postState.commentsCount + ' comentários'}</span>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;