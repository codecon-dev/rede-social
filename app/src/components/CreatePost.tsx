import { Button, TextArea } from '@radix-ui/themes';
import React, { useState } from 'react';

interface CreatePostProps {
  onSubmit: (content: string) => void;
  loading: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form className='create-post' onSubmit={handleSubmit}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que você está pensando? Seja verdadeiro, ninguém vai julgar você aqui!"
        rows={3}
        size={'3'}
        radius='large'
        required
      />
      <div className='actions'>
        <Button
          type="submit"
          size={'4'}
          disabled={loading || !content.trim()}
        >
          {loading ? 'Postando...' : 'Postar'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePost;