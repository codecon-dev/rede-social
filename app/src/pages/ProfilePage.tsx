import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Avatar, Button, Card, Flex, TextArea, TextField, Text, Tooltip } from '@radix-ui/themes';
import { LuArrowLeft, LuPencil } from 'react-icons/lu';
import type { PatologicalVoteStats } from '../types';
import patocinado from '../assets/patocinado.png';
import patodavida from '../assets/patodavida.png';
import patonimo from '../assets/patonimo.png';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });
  const [patologicalStats, setPatologicalStats] = useState<PatologicalVoteStats | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const loadPatologicalStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await apiClient.getPatologicalVoteStats(user.id);
      setPatologicalStats(stats);
    } catch (error) {
      console.error('Error loading patological stats:', error);
      const mockStats: PatologicalVoteStats = {
        patocinado: 15,
        patodavida: 10,
        patonimo: 8,
        total: 33,
        percentages: {
          patocinado: 45.5,
          patodavida: 30.3,
          patonimo: 24.2
        },
        userVote: undefined
      };
      setPatologicalStats(mockStats);
    }
  }, [user]);

  useEffect(() => {
    loadPatologicalStats();
  }, [loadPatologicalStats]);

  return (
    <section className="profile">
      <Card size={'4'} className="profile-card">
        <Flex gap={'6'} align={'start'}>
          <Avatar size={'8'} radius='full' src={user?.avatarUrl} fallback={user?.username?.substring(0, 1)?.toUpperCase() || 'U'} />
          <div>
            {user?.firstName ? (
              (
                <>
                  <h1>{user?.firstName || user?.lastName
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                    : 'Not provided'
                  }</h1>
                  <h2><i>@{user?.username}</i></h2>
                </>
              )

            ) : (<h1>@{user?.username}</h1>)}

            {!editing && <Flex gap={'2'} align={'center'}>
              <Button variant='outline' size={'1'} onClick={() => navigate('/')}>
                <LuArrowLeft /> Voltar
              </Button>
              <Button variant='outline' size={'1'} onClick={() => setEditing(true)}>
                <LuPencil /> Editar Perfil
              </Button>
            </Flex>}

            {editing ? (
              <form onSubmit={handleSubmit}>
                <Flex gap={'4'} justify={'between'}>
                  <div>
                    <label htmlFor="first_name">
                      Nome
                    </label>
                    <TextField.Root
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder='João'
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name">
                      Sobrenome
                    </label>
                    <TextField.Root
                      id="lastName"
                      name="lastName"
                      placeholder='Silva'
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </Flex>

                <div>
                  <label htmlFor="bio">
                    Bio
                  </label>
                  <TextArea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    radius='large'
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <Flex gap={'2'} justify={'end'}>
                  <Button onClick={handleCancel} variant='outline'>
                    Cancelar
                  </Button>
                  <Button disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Flex>
              </form>
            ) : (
              <div className='bio'>
                <h4>Quem sou eu na fila do pão?</h4>
                <p>
                  <i>{user?.bio || 'Ainda não escrevi nada sobre mim.'}</i>
                </p>
              </div>
            )}

            {!editing && (
              <div className="profile-patological-section">
                <Flex gap="3" justify="center">
                  {/* Patocinado */}
                  <Tooltip content="Vive aparecendo por aí. Deve estar em todas com contrato assinado.">
                    <Flex direction="column" align="center" gap="1" style={{ cursor: 'pointer' }}>
                      <Text size="1" weight="bold">Patocinado</Text>
                      <img 
                        src={patocinado}
                        alt="Patocinado - Pato com celular"
                        className="avaliacao-img"
                        style={{ cursor: 'default' }}
                      />
                      <Text size="1" color="gray">
                        {patologicalStats ? `${patologicalStats.percentages.patocinado.toFixed(1)}%` : '0%'}
                      </Text>
                    </Flex>
                  </Tooltip>

                  {/* Patoda vida */}
                  <Tooltip content="Parceiro de sempre. Topa tudo, até os planos duvidosos.">
                    <Flex direction="column" align="center" gap="1" style={{ cursor: 'pointer' }}>
                      <Text size="1" weight="bold">Patoda vida</Text>
                      <img 
                        src={patodavida}
                        alt="Patodavida - Pato abraçado"
                        className="avaliacao-img"
                        style={{ cursor: 'default' }}
                      />
                      <Text size="1" color="gray">
                        {patologicalStats ? `${patologicalStats.percentages.patodavida.toFixed(1)}%` : '0%'}
                      </Text>
                    </Flex>
                  </Tooltip>

                  {/* Patônimo */}
                  <Tooltip content="Acho que já vi antes por aí… ou será que não?">
                    <Flex direction="column" align="center" gap="1" style={{ cursor: 'pointer' }}>
                      <Text size="1" weight="bold">Patônimo</Text>
                      <img 
                        src={patonimo}
                        alt="Patonimo - Pato com lupa"
                        className="avaliacao-img"
                        style={{ cursor: 'default' }}
                      />
                      <Text size="1" color="gray">
                        {patologicalStats ? `${patologicalStats.percentages.patonimo.toFixed(1)}%` : '0%'}
                      </Text>
                    </Flex>
                  </Tooltip>
                </Flex>
              </div>
            )}
          </div>
        </Flex>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;