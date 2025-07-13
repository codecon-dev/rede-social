import React from 'react';
import type { Post } from '../types';
import { Avatar, Button, Card, Flex, Tooltip, Text } from '@radix-ui/themes';
import { LuMessageCircle, LuTrash } from 'react-icons/lu';

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
    <Card className='post' size={'3'}>
      <Flex gap={'2'} align={'center'}>
        <Avatar size={'4'} radius='full' src={post.user?.avatarUrl} fallback={post.user?.username?.substring(0, 1)?.toUpperCase() || 'U'} />
        <div>
          <Text size={'4'} weight={'bold'}>
            {post.user?.username || 'Unknown User'}
          </Text> <br />
          <Text size={'2'} color={'gray'}>
            {formatDate(post.createdAt)}
          </Text>
        </div>
      </Flex>

      <div className="content">
        <p>{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="mt-3 rounded-lg max-w-full h-auto"
          />
        )}
      </div>
      <div className='post-buttons'>
        <Button
          onClick={() => onLike(post.id)}
          variant='outline' radius='full'
          color={post.isLiked ? 'red' : 'gray'}>
          <span>{post.isLiked ? '❤️' : '🖤'}</span>
          <span>{post.likesCount}</span>
        </Button>

        {canDelete && onDelete && (
          <Tooltip content="Apagar antes que dê treta">
            <Button onClick={() => onDelete(post.id)} color='red' variant='outline' radius='full'>
              <LuTrash />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className="comments-count">
        <div className='comments-content'>
          <span><LuMessageCircle /></span>
          <span>{post.commentsCount === 0 ? 'Ninguém te deu atenção' : post.commentsCount + ' comentários'}</span>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;