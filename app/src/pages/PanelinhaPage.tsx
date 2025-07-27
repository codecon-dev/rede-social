import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Flex, Text } from '@radix-ui/themes';
import { LuArrowLeft, LuUserMinus } from 'react-icons/lu';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useMockFollows } from '../contexts/MockFollowsContext';
import { useFollows } from '../contexts/FollowsContext';

interface PanelinhaMember {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockUsers: Record<string, PanelinhaMember> = {
    vtnorton: {
        id: 1,
        username: 'vtnorton',
        firstName: 'Vitor',
        lastName: 'Norton',
        bio: 'Desenvolvedor apaixonado por cinema, e sim Anora é bom demais!',
        isVerified: false,
        createdAt: '',
        updatedAt: ''
    },
    johndoe: {
		id: 2,
		username: 'johndoe',
		firstName: 'João',
		lastName: 'Silva',
		bio: 'Amante de livros e viagens pelo mundo 🌎',
		isVerified: false,
		createdAt: '',
		updatedAt: ''
	},
	mariasilva: {
		id: 3,
		username: 'mariasilva',
		firstName: 'Maria',
		lastName: 'Silva',
		bio: 'Designer gráfica e artista nas horas vagas 🎨',
		isVerified: false,
		createdAt: '',
		updatedAt: ''
	},
	jeniblo: {
		id: 4,
		username: 'jeniblo',
		firstName: 'Jeni',
		lastName: 'Bittencourt',
		bio: 'Dev Javeira apaixonada por gatos, Pokémon e TCG',
		isVerified: false,
		createdAt: '',
		updatedAt: ''
	},
};

const PanelinhaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<PanelinhaMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowLoading, setUnfollowLoading] = useState<number | null>(null);
  const { mockFollows, removeMockFollow } = useMockFollows();
  const { refreshDbFollowsCount } = useFollows();

  const loadPanelinhaMembers = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await apiClient.getPanelinhaMembers();
      const dbMembers = response.members;

      const mockMembers = Object.values(mockUsers).filter(user =>
        mockFollows.has(user.id)
      );

      const allMembers = [...dbMembers, ...mockMembers];
      setMembers(allMembers);
    } catch (error) {
      console.error('Error loading panelinha members:', error);
      const mockMembers = Object.values(mockUsers).filter(user =>
        mockFollows.has(user.id)
      );
      setMembers(mockMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowMember = async (memberId: number) => {
    if (!currentUser) return;

    setUnfollowLoading(memberId);
    try {
      const isMockUser = Object.values(mockUsers).some(user => user.id === memberId);
      
      if (isMockUser) {
        removeMockFollow(memberId);
        setMembers(prev => prev.filter(member => member.id !== memberId));
      } else {
        await apiClient.unfollowUser(memberId);
        setMembers(prev => prev.filter(member => member.id !== memberId));
        await refreshDbFollowsCount();
      }
    } catch (error) {
      console.error('Error unfollowing member:', error);
    } finally {
      setUnfollowLoading(null);
    }
  };

  const handleMemberClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  useEffect(() => {
    loadPanelinhaMembers();
  }, [currentUser, mockFollows]);

  if (loading) {
    return (
      <section className="panelinha">
        <Card size={'4'} className="panelinha-card">
          <Flex direction={'column'} align={'center'} gap={'4'}>
            <h1>Carregando...</h1>
          </Flex>
        </Card>
      </section>
    );
  }

  return (
    <section className="panelinha">
      <Card size={'4'} className="panelinha-card">
        <Flex direction={'column'} gap={'4'}>
          <Flex align={'center'} gap={'4'}>
            <Button variant='outline' onClick={() => navigate('/')}>
              <LuArrowLeft /> Voltar
            </Button>
            <h1>Membros da Panelinha</h1>
            <Text size="3" color="gray">
              {members.length} {members.length === 1 ? 'membro' : 'membros'}
            </Text>
          </Flex>

          {members.length === 0 ? (
            <div className="no-members">
              <span>😢</span>
              <p>Ninguém? Nem um bot? Nem a equipe de suporte? Que nível de solidão é esse?</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Explorar usuários
              </Button>
            </div>
          ) : (
            <div className="members-list">
              {members.map(member => (
                <Card key={member.id} size={'3'} className="member-card">
                  <Flex gap={'4'} align={'center'} justify={'between'}>
                    <Flex gap={'3'} align={'center'} style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleMemberClick(member.username)}>
                      <Avatar
                        size={'5'}
                        radius='full'
                        src={member.avatarUrl || undefined}
                        fallback={member.username.substring(0, 1).toUpperCase()}
                      />
                      <div>
                        <Text weight="bold" style={{ marginRight: '0.5rem' }}>
                          {member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.username
                          }
                        </Text>
                        <Text size="2" color="gray">
                          @{member.username}
                        </Text>
                      </div>
                    </Flex>
                    <Button
                      variant="outline"
                      size="2"
                      onClick={() => handleUnfollowMember(member.id)}
                      disabled={unfollowLoading === member.id}
                    >
                      <LuUserMinus />
                      {unfollowLoading === member.id ? 'Removendo...' : 'Remover'}
                    </Button>
                  </Flex>
                </Card>
              ))}
            </div>
          )}
        </Flex>
      </Card>
    </section>
  );
};

export default PanelinhaPage;