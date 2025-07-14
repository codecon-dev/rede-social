import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, TextField } from '@radix-ui/themes';
import { LuLogIn, LuUserPlus } from 'react-icons/lu';

const LoginForm = ({
  isLogin,
  setIsLogin
}: {
  isLogin: boolean,
  setIsLogin: (value: boolean) => void
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Bem vindo a panelinha</h1>
      <div>
        <label htmlFor="email">
          Email
        </label>
        <TextField.Root
          type="email"
          id="email"
          value={email}
          size={'3'}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">
          Password
        </label>
        <TextField.Root
          type="password"
          id="password"
          size={'3'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <Button
        type="submit"
        size={'4'}
        disabled={loading}
      >
        <LuLogIn /> {loading ? 'Verificando se essa é sua senha mesmo...' : 'Entrar'}
      </Button>

      <Button size={'4'} onClick={() => setIsLogin(false)} variant='outline'>
        <LuUserPlus /> Registrar
      </Button>
    </form>
  );
};

export default LoginForm;