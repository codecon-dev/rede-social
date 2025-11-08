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
    firstName: '',
    lastName: '',
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
          <label htmlFor="firstName">
            First Name
          </label>
          <TextField.Root
            type="text"
            id="firstName"
            placeholder='João'
            name="firstName"
            size={'3'}
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="lastName">
            Last Name
          </label>
          <TextField.Root
            type="text"
            id="lastName"
            placeholder='Silva'
            name="lastName"
            size={'3'}
            value={formData.lastName}
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
