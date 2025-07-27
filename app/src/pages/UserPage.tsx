import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, DropdownMenu, Flex } from '@radix-ui/themes';
import { LuArrowLeft, LuUserPlus, LuUserMinus } from 'react-icons/lu';
import type { Post, User } from '../types';
import PostCard from '../components/PostCard';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const mockUsers: Record<string, User> = {
	vtnorton: {
		id: 1,
		username: 'vtnorton',
		firstName: 'Vitor',
		lastName: 'Norton',
		bio: 'Desenvolvedor apaixonado por cinema, e sim Anora é bom demais!',
		email: 'hey@jude.com',
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
		email: 'bye@dude.com',
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
		email: 'vide@coding.com',
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
		email: 'jeni@coding.com',
		isVerified: false,
		createdAt: '',
		updatedAt: ''
	},
};

const UserPage: React.FC = () => {
	const navigate = useNavigate();
	const { username } = useParams<{ username: string }>();
	const { user: currentUser } = useAuth();
	const [posts, setPosts] = useState<Post[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedRelationship, setSelectedRelationship] = useState<string>('');
	const [selectedThought, setSelectedThought] = useState<string>('');
	const [isFollowing, setIsFollowing] = useState<boolean>(false);
	const [followLoading, setFollowLoading] = useState<boolean>(false);

	const loadUser = useCallback(async () => {
		if (!username) return;

		setLoading(true);
		try {
			const dbUser = await apiClient.getUserByUsername(username);
			setUser(dbUser);
		} catch (error) {
			console.error('Usuário não encontrado no banco, tentando os dados mockados...', error);
			const mockUser = mockUsers[username.toLowerCase()];
			if (mockUser) {
				setUser(mockUser);
			} else {
				setUser(null);
			}
		} finally {
			setLoading(false);
		}
	}, [username]);

	const loadFollowStatus = useCallback(async () => {
		if (!currentUser || !user || currentUser.id === user.id) return;

		try {
			const status = await apiClient.checkFollowStatus(user.id);
			setIsFollowing(status.isFollowing);
		} catch (error) {
			console.error('Error loading follow status', error);
		}
	}, [currentUser, user]);

	const handleFollowToggle = async () => {
		if (!currentUser || !user || currentUser.id === user.id) return;

		setFollowLoading(true);
		try {
			if (isFollowing) {
				await apiClient.unfollowUser(user.id);
				setIsFollowing(false);
			} else {
				await apiClient.followUser(user.id);
				setIsFollowing(true);
			}
		} catch (error) {
			console.error('Error toggling follow', error);
		} finally {
			setFollowLoading(false);
		}
	};

	const loadTimeline = useCallback(async () => {
		try {
			if (user) {
				const timelinePosts = await apiClient.getUserTimeline(user.id || 0);
				setPosts(timelinePosts.posts);
			}
		} catch (err) {
			console.error('Timeline error:', err);
		}
	}, [user]);

	const handlePostDeleted = async () => {
		await loadTimeline();
	};

	useEffect(() => {
		loadUser();
	}, [loadUser]);

	useEffect(() => {
		if (user) {
			loadTimeline();
			loadFollowStatus();
		}
	}, [user, loadTimeline, loadFollowStatus]);

	if (loading) {
		return (
			<section className="profile">
				<Card size={'4'} className="profile-card">
					<Flex direction={'column'} align={'center'} gap={'4'}>
						<h1>Carregando...</h1>
					</Flex>
				</Card>
			</section>
		);
	}

	if (!user) {
		return (
			<section className="profile">
				<Card size={'4'} className="profile-card">
					<Flex direction={'column'} align={'center'} gap={'4'}>
						<h1>Usuário não encontrado</h1>
						<p style={{ textAlign: 'center' }}>O usuário @{username} não foi encontrado, provavelmente ele te bloqueou e você não ficou sabendo.</p>
						<Button variant='outline' onClick={() => navigate('/')}>
							<LuArrowLeft /> Voltar
						</Button>
					</Flex>
				</Card>
			</section>
		);
	}

	const isOwnProfile = currentUser?.id === user.id;

	return (
		<>
			<section className="profile">
				<Card size={'4'} className="profile-card">
					<Flex gap={'6'} align={'start'}>
						<Avatar
							size={'8'}
							radius='full'
							src={user?.avatarUrl || undefined}
							fallback={user?.username?.substring(0, 1)?.toUpperCase() || 'U'}
						/>
						<div style={{flex: 1}}>
							<Flex gap={'4'} align={'baseline'} style={{marginBottom: '1rem'}} className="name-button-container">
							<div className="name-container">
								{user?.firstName ? (
									<>
										<h1>{user?.firstName || user?.lastName
											? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
											: 'Not provided'
										}</h1>
										<h2><i>@{user?.username}</i></h2>
									</>
								) : (
									<h1>@{user?.username}</h1>
								)}
							</div>
								{currentUser && !isOwnProfile && (
									<Button
										variant={isFollowing ? "solid" : "outline"}
										onClick={handleFollowToggle}
										disabled={followLoading}
										size="2"
										data-follow-button
									>
										{isFollowing ? <LuUserMinus /> : <LuUserPlus />}
										{followLoading
											? 'Carregando...'
											: isFollowing
												? 'Remover da panelinha'
												: 'Adicionar à minha panelinha'
										}
									</Button>
								)}
							</Flex>
							<div className='bio'>
								<h4>Quem sou eu na fila do pão?</h4>
								<p>
									<i>{user?.bio || 'Ainda não escreveu nada sobre si.'}</i>
								</p>
							</div>
						</div>
					</Flex>
					<Flex gap={'2'} direction={'column'}>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant={selectedRelationship ? "solid" : "outline"}>
									{selectedRelationship || "🫵 O que a pessoa é pra você"}
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Melhor amigo(a)")}>
									Melhor amigo(a)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Colega de rolê")}>
									Colega de rolê
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Me deve dinheiro")}>
									Me deve dinheiro
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("To ficando (em segredo)")}>
									To ficando (em segredo)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Namorado(a) imaginário(a)")}>
									Namorado(a) imaginário(a)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Meu contatinho das 23h")}>
									Meu contatinho das 23h
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Inimigo íntimo")}>
									Inimigo íntimo
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Só falo quando bebo")}>
									Só falo quando bebo
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Ex que virou amigo (ou não)")}>
									Ex que virou amigo (ou não)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Rival de memes")}>
									Rival de memes
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Crush da adolescência")}>
									Crush da adolescência
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Mentor espiritual (sem saber)")}>
									Mentor espiritual (sem saber)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Pessoa que stalkeio todo dia")}>
									Pessoa que stalkeio todo dia
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Parente distante que finge que conhece")}>
									Parente distante que finge que conhece
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Conselheiro amoroso (péssimo)")}>
									Conselheiro amoroso (péssimo)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Amigo fake só pra subir a moral")}>
									Amigo fake só pra subir a moral
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Me ignora no zap")}>
									Me ignora no zap
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Só tá aqui pela fofoca")}>
									Só tá aqui pela fofoca
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Parceiro de maratona de série (sem compromisso)")}>
									Parceiro de maratona de série (sem compromisso)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Já brigamos no Twitter")}>
									Já brigamos no Twitter
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("Me influenciou a fazer merda")}>
									Me influenciou a fazer merda
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={() => setSelectedRelationship("")} color="red">
									Não é nada pra mim
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant={selectedThought ? "solid" : "outline"}>
									{selectedThought || "🤔 O que você acha que é pra essa pessoa"}
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Um amor platônico")}>
									Um amor platônico
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Só mais um número")}>
									Só mais um número
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("O motivo do bloqueio")}>
									O motivo do bloqueio
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("A melhor coisa que já aconteceu (óbvio)")}>
									A melhor coisa que já aconteceu (óbvio)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Amizade por pena")}>
									Amizade por pena
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Aquele que ela finge que não conhece")}>
									Aquele que ela finge que não conhece
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Exemplo de superação (por aguentar ela)")}>
									Exemplo de superação (por aguentar ela)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("O stalker número 1")}>
									O stalker número 1
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Um erro de verão")}>
									Um erro de verão
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Backup do backup")}>
									Backup do backup
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("O conselheiro não solicitado")}>
									O conselheiro não solicitado
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("O que dá bom dia no grupo")}>
									O que dá bom dia no grupo
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("A treta do passado")}>
									A treta do passado
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Um contato útil (quando convém)")}>
									Um contato útil (quando convém)
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Só entra em contato na TPM")}>
									Só entra em contato na TPM
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("A desgraça favorita")}>
									A desgraça favorita
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Fantasma que volta a cada 6 meses")}>
									Fantasma que volta a cada 6 meses
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Influencer da panelinha dela")}>
									Influencer da panelinha dela
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={() => setSelectedThought("Já fui bloqueado 3x")}>
									Já fui bloqueado 3x
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={() => setSelectedThought("")} color="red">
									Não é nada pra mim
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Flex>
				</Card>
			</section>
			<section className='feed'>
				{posts.length === 0 ? (
					<div className="no-content">
						<span>😢</span>
						<p>Este usuário ainda não postou nada, provavelmente ele está vivendo e sendo mais feliz do que você.</p>
					</div>
				) : (
					posts.map(post => (
						<PostCard
							key={post.id}
							post={post}
							onPostDeleted={handlePostDeleted}
							currentUserId={user?.id}
						/>
					))
				)}
			</section>
		</>
	);
};

export default UserPage;
