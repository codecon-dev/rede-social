import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Flex, TextField } from '@radix-ui/themes';
import { LuLogIn } from 'react-icons/lu';

const RegisterForm = ({
  isLogin,
  setIsLogin
}: {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Bem vindo a panelinha</h1>
      <div>
        <label htmlFor="username">
          Username
        </label>
        <TextField.Root
          type="text"
          id="username"
          name="username"
          size={'3'}
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">
          Email
        </label>
        <TextField.Root
          type="email"
          id="email"
          name="email"
          placeholder='João da Silva'
          size={'3'}
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <Flex gap={'2'} align={'center'}>
        <div style={{ flex: 1 }}>
          <label htmlFor="first_name">
            First Name
          </label>
          <TextField.Root
            type="text"
            id="first_name"
            placeholder='João'
            name="first_name"
            size={'3'}
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="last_name">
            Last Name
          </label>
          <TextField.Root
            type="text"
            id="last_name"
            placeholder='Silva'
            name="last_name"
            size={'3'}
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
      </Flex>
      <div>
        <label htmlFor="password">
          Password
        </label>
        <TextField.Root
          type="password"
          id="password"
          name="password"
          size={'3'}
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <Button
        type="submit"
        disabled={loading}
        size={'4'}
      >
        {loading ? 'Criando uma conta...' : 'Criar conta'}
      </Button>

      <Button size={'4'} onClick={() => setIsLogin(true)} variant='outline'>
        <LuLogIn /> Entrar
      </Button>
    </form>
  );
};

export default RegisterForm;