import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Card, DropdownMenu, Flex, Text, Tooltip } from "@radix-ui/themes";
import { LuArrowLeft, LuUserPlus, LuUserMinus } from "react-icons/lu";
import type { Post, User, PatologicalVoteStats } from "../types";
import PostCard from "../components/PostCard";
import { apiClient } from "../services/api";
import { patologicalVoteService } from "../services/patologicalVotes";
import { useAuth } from "../contexts/AuthContext";
import { useFollows } from "../contexts/FollowsContext";
import patocinado from "../assets/patocinado.png";
import patodavida from "../assets/patodavida.png";
import patonimo from "../assets/patonimo.png";
import gif1 from "../assets/grandma-gifs/gif-1.gif";
import gif2 from "../assets/grandma-gifs/gif-2.gif";
import gif3 from "../assets/grandma-gifs/gif-3.gif";
import gif4 from "../assets/grandma-gifs/gif-4.gif";
import gif5 from "../assets/grandma-gifs/gif-5.gif";
import { usePageTitle } from "../hooks/usePageTitle";

const mockUsers: Record<string, User> = {
  vtnorton: {
    id: 1,
    username: "vtnorton",
    firstName: "Vitor",
    lastName: "Norton",
    bio: "Desenvolvedor apaixonado por cinema, e sim Anora é bom demais!",
    email: "hey@jude.com",
    isVerified: false,
    createdAt: "",
    updatedAt: "",
  },
  johndoe: {
    id: 2,
    username: "johndoe",
    firstName: "João",
    lastName: "Silva",
    bio: "Amante de livros e viagens pelo mundo 🌎",
    email: "bye@dude.com",
    isVerified: false,
    createdAt: "",
    updatedAt: "",
  },
  mariasilva: {
    id: 3,
    username: "mariasilva",
    firstName: "Maria",
    lastName: "Silva",
    bio: "Designer gráfica e artista nas horas vagas 🎨",
    email: "vide@coding.com",
    isVerified: false,
    createdAt: "",
    updatedAt: "",
  },
  jeniblo: {
    id: 4,
    username: "jeniblo",
    firstName: "Jeni",
    lastName: "Bittencourt",
    bio: "Dev Javeira apaixonada por gatos, Pokémon e TCG",
    email: "jeni@coding.com",
    isVerified: false,
    createdAt: "",
    updatedAt: "",
  },
};

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRelationship, setSelectedRelationship] = useState<string>("");
  const [selectedThought, setSelectedThought] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [isMockUser, setIsMockUser] = useState<boolean>(false);
  const [patologicalStats, setPatologicalStats] = useState<PatologicalVoteStats | null>(null);
  const [votingLoading, setVotingLoading] = useState<boolean>(false);
  const [voteFeedback, setVoteFeedback] = useState<string>("");
  const { refreshDbFollowsCount } = useFollows();

  usePageTitle(user ? `${user.firstName ? `${user.firstName} ${user.lastName || ''}` : `@${user.username}`} - Rede Social` : 'Usuário - Rede Social');

  // Estados para depoimentos de vovozinha
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [testimonialError, setTestimonialError] = useState<string>("");
  const [submittingTestimonial, setSubmittingTestimonial] = useState<boolean>(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState<boolean>(false);

  // Função para carregar depoimentos
  const loadTestimonials = useCallback(async () => {
    if (!user) return;

    setLoadingTestimonials(true);
    try {
      const response = await apiClient.getGrandmaTestimonials(user.id);
      setTestimonials(response.testimonials);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoadingTestimonials(false);
    }
  }, [user]);

  // Função para submeter depoimento
  const handleSubmitTestimonial = async () => {
    if (!selectedTheme) {
      setTestimonialError("Escolha um tema da vovó primeiro!");
      return;
    }

    if (!testimonialText.trim()) {
      setTestimonialError("Escreva alguma coisa, meu bem!");
      return;
    }

    if (!user) {
      setTestimonialError("Usuário não encontrado!");
      return;
    }

    setSubmittingTestimonial(true);
    setTestimonialError("");

    try {
      const response = await apiClient.createGrandmaTestimonial(user.id, selectedTheme, testimonialText);

      // Limpar form
      setTestimonialText("");
      setSelectedTheme("");

      // Mostrar sucesso
      setTestimonialError("");
      alert(response.message);

      // Recarregar depoimentos
      await loadTestimonials();
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.error ||
        error.response?.message ||
        error.message ||
        "Erro ao enviar depoimento. Tente novamente!";
      setTestimonialError(errorMessage);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const loadUser = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    try {
      const dbUser = await apiClient.getUserByUsername(username);
      setUser(dbUser);
      setIsMockUser(false);
    } catch (error) {
      console.error("Usuário não encontrado no banco, tentando os dados mockados...", error);
      const mockUser = mockUsers[username.toLowerCase()];
      if (mockUser) {
        setUser(mockUser);
        setIsMockUser(true);
      } else {
        setUser(null);
        setIsMockUser(false);
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
      console.error("Error loading follow status", error);
    }
  }, [currentUser, user, isMockUser]);

  const handleStartChat = useCallback(async () => {
    if (!user) return;
    try {
      const room = await apiClient.createChatRoom({
        is_group: false,
        member_ids: [user.id],
      });
      navigate(`/chat/${room.id}`);
    } catch (error) {
      console.error("Error creating chat room", error);
    }
  }, [navigate, user]);

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
      await refreshDbFollowsCount();
    } catch (error) {
      console.error("Error toggling follow", error);
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
      console.error("Timeline error:", err);
    }
  }, [user]);

  const handlePostDeleted = async () => {
    await loadTimeline();
  };

  const loadPatologicalStats = useCallback(async () => {
    if (!user || !currentUser) return;

    try {
      const stats = await patologicalVoteService.getVoteStats(user.id, currentUser.id);
      setPatologicalStats(stats);
    } catch (error) {
      console.error("Error loading patological stats:", error);
    }
  }, [user, currentUser]);

  const handlePatologicalVote = async (voteType: "antipato" | "pato_no_tucupi" | "patotastico") => {
    if (!currentUser || !user || currentUser.id === user.id) return;

    setVotingLoading(true);
    setVoteFeedback("");

    try {
      const result = await patologicalVoteService.vote(currentUser.id, user.id, voteType);

      if (result.success) {
        await loadPatologicalStats();
        setVoteFeedback(result.message);
      } else {
        setVoteFeedback(result.message);
      }
    } catch (error) {
      console.error("Error voting patological:", error);
      setVoteFeedback("Erro ao computar voto");
    } finally {
      setVotingLoading(false);
      setTimeout(() => setVoteFeedback(""), 3000);
    }
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      loadTimeline();
      loadFollowStatus();
      loadPatologicalStats();
      loadTestimonials();
    }
  }, [user, loadTimeline, loadFollowStatus, loadPatologicalStats, loadTestimonials]);

  if (loading) {
    return (
      <section className='profile'>
        <Card size={"4"} className='profile-card'>
          <Flex direction={"column"} align={"center"} gap={"4"}>
            <h1>Carregando...</h1>
          </Flex>
        </Card>
      </section>
    );
  }

  if (!user) {
    return (
      <section className='profile'>
        <Card size={"4"} className='profile-card'>
          <Flex direction={"column"} align={"center"} gap={"4"}>
            <h1>Usuário não encontrado</h1>
            <p style={{ textAlign: "center" }}>
              O usuário @{username} não foi encontrado, provavelmente ele te bloqueou e você não ficou sabendo.
            </p>
            <Button variant='outline' onClick={() => navigate("/")}>
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
      <section className='profile'>
        <Card size={"4"} className='profile-card'>
          <Flex gap={"6"} align={"start"}>
            <Avatar
              size={"8"}
              radius='full'
              src={user?.avatarUrl || undefined}
              fallback={user?.username?.substring(0, 1)?.toUpperCase() || "U"}
            />
            <div style={{ flex: 1 }}>
              <Flex
                gap={"4"}
                align={"baseline"}
                style={{ marginBottom: "1rem" }}
                direction={"column"}
                className='name-button-container'
              >
                <div className='name-container'>
                  {user?.firstName ? (
                    <>
                      <h1>
                        {user?.firstName || user?.lastName
                          ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                          : "Not provided"}
                      </h1>
                      <h2>
                        <i>@{user?.username}</i>
                      </h2>
                    </>
                  ) : (
                    <h1>@{user?.username}</h1>
                  )}
                </div>
                <Flex gap={"2"} align={"start"} direction={"column"}>
                  {currentUser && !isOwnProfile && (
                    <Button
                      variant={isFollowing ? "solid" : "outline"}
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      size='2'
                      data-follow-button
                    >
                      {isFollowing ? <LuUserMinus /> : <LuUserPlus />}
                      {followLoading
                        ? "Carregando..."
                        : isFollowing
                        ? "Remover da panelinha"
                        : "Adicionar à minha panelinha"}
                    </Button>
                  )}

                  {!isOwnProfile && (
                    <Button variant='outline' size='2' onClick={handleStartChat} data-chat-button>
                      Iniciar chat
                    </Button>
                  )}
                </Flex>
              </Flex>
              <div className='bio'>
                <h4>Quem sou eu na fila do pão?</h4>
                <p>
                  <i>{user?.bio || "Ainda não escreveu nada sobre si."}</i>
                </p>
              </div>
            </div>

            <div className='avaliacao-patologica'>
              <h4 className='patological-title'>Vote em quão pato-legal é esta pessoa</h4>
              {voteFeedback && (
                <Text size='1' color='green' style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                  {voteFeedback}
                </Text>
              )}
              <Flex direction='column' gap='3'>
                <Flex align='center' gap='3'>
                  <Tooltip content='Antipato - Essa pessoa não é muito legal, melhor manter distância.'>
                    <img
                      src={patocinado}
                      alt='Antipato - Pessoa não muito legal'
                      className={`avaliacao-img ${patologicalStats?.userVote === "antipato" ? "voted" : ""}`}
                      onClick={() => handlePatologicalVote("antipato")}
                      style={{
                        cursor: votingLoading ? "not-allowed" : "pointer",
                      }}
                    />
                  </Tooltip>
                  <Tooltip content='Antipato - Essa pessoa não é muito legal, melhor manter distância.'>
                    <Flex direction='column' gap='1' style={{ cursor: "pointer" }}>
                      <Text size='2' weight='bold'>
                        Antipato
                      </Text>
                      <Text size='1' color='gray'>
                        {patologicalStats ? `${patologicalStats.percentages.antipato.toFixed(1)}%` : "0%"}
                      </Text>
                    </Flex>
                  </Tooltip>
                </Flex>

                <Flex align='center' gap='3'>
                  <Tooltip content='Pato no tucupi - Pessoa bacana, dá pra conversar numa boa.'>
                    <img
                      src={patodavida}
                      alt='Pato no tucupi - Pessoa bacana'
                      className={`avaliacao-img ${patologicalStats?.userVote === "pato_no_tucupi" ? "voted" : ""}`}
                      onClick={() => handlePatologicalVote("pato_no_tucupi")}
                      style={{
                        cursor: votingLoading ? "not-allowed" : "pointer",
                      }}
                    />
                  </Tooltip>
                  <Tooltip content='Pato no tucupi - Pessoa bacana, dá pra conversar numa boa.'>
                    <Flex direction='column' gap='1' style={{ cursor: "pointer" }}>
                      <Text size='2' weight='bold'>
                        Pato no tucupi
                      </Text>
                      <Text size='1' color='gray'>
                        {patologicalStats ? `${patologicalStats.percentages.pato_no_tucupi.toFixed(1)}%` : "0%"}
                      </Text>
                    </Flex>
                  </Tooltip>
                </Flex>

                <Flex align='center' gap='3'>
                  <Tooltip content='Patostástico - Pessoa incrível, o tipo de amigo que todo mundo quer ter!'>
                    <img
                      src={patonimo}
                      alt='Patostástico - Pessoa incrível'
                      className={`avaliacao-img ${patologicalStats?.userVote === "patotastico" ? "voted" : ""}`}
                      onClick={() => handlePatologicalVote("patotastico")}
                      style={{
                        cursor: votingLoading ? "not-allowed" : "pointer",
                      }}
                    />
                  </Tooltip>
                  <Tooltip content='Patostástico - Pessoa incrível, o tipo de amigo que todo mundo quer ter!'>
                    <Flex direction='column' gap='1' style={{ cursor: "pointer" }}>
                      <Text size='2' weight='bold'>
                        Patostástico
                      </Text>
                      <Text size='1' color='gray'>
                        {patologicalStats ? `${patologicalStats.percentages.patotastico.toFixed(1)}%` : "0%"}
                      </Text>
                    </Flex>
                  </Tooltip>
                </Flex>
              </Flex>
            </div>
          </Flex>
          <Flex gap={"2"} direction={"column"}>
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
                <DropdownMenu.Item
                  onSelect={() => setSelectedRelationship("Parceiro de maratona de série (sem compromisso)")}
                >
                  Parceiro de maratona de série (sem compromisso)
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setSelectedRelationship("Já brigamos no Twitter")}>
                  Já brigamos no Twitter
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setSelectedRelationship("Me influenciou a fazer merda")}>
                  Me influenciou a fazer merda
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => setSelectedRelationship("")} color='red'>
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
                <DropdownMenu.Item onSelect={() => setSelectedThought("")} color='red'>
                  Não é nada pra mim
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Card>
      </section>
      <div className='user-page-columns'>
        <section className='posts-column'>
          <h3>Posts do usuário</h3>
          {posts.length === 0 ? (
            <div className='no-content'>
              <span>😢</span>
              <p>Este usuário ainda não postou nada, provavelmente ele está vivendo e sendo mais feliz do que você.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} currentUserId={user?.id} />
            ))
          )}
        </section>

        <section className='testimonials-column'>
          <h3>Depoimentos de Vovozinha 👵💕</h3>
          <Card className='grandma-testimonials'>
            <div className='testimonial-form'>
              <p className='grandma-instructions'>
                Escreva um depoimento carinhoso como sua vovózinha faria! Use palavrinhas fofas como: fofinho, querido,
                benzinho, lindeza, amorzinho, gracinha, docinho, coraçãozinho, anjinho, florzinha...
              </p>

              <div className='theme-selection'>
                <h4>Escolha o tema da vovó:</h4>
                <div className='theme-gifs'>
                  {[
                    { id: "1", gif: gif1, alt: "Vovozinha 1" },
                    { id: "2", gif: gif2, alt: "Vovozinha 2" },
                    { id: "3", gif: gif3, alt: "Vovozinha 3" },
                    { id: "4", gif: gif4, alt: "Vovozinha 4" },
                    { id: "5", gif: gif5, alt: "Vovozinha 5" },
                  ].map((theme) => (
                    <div
                      key={theme.id}
                      className={`theme-option ${selectedTheme === theme.id ? "selected" : ""}`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <img src={theme.gif} alt={theme.alt} />
                      <span>Vovó tema {theme.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              <textarea
                placeholder='Oi meu docinho...'
                className='testimonial-input'
                rows={4}
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
              />

              {testimonialError && <div className='testimonial-error'>{testimonialError}</div>}

              <Button className='submit-testimonial' onClick={handleSubmitTestimonial} disabled={submittingTestimonial}>
                {submittingTestimonial ? "Enviando..." : "Enviar depoimento da vovó 👵💝"}
              </Button>

              <div className='testimonial-rules'>
                <small>
                  ⚠️ Seu depoimento deve ter pelo menos 2 palavrinhas carinhosas!
                  <br />
                  📝 Começará com "Oi meu docinho..." e terminará com uma bênção especial!
                  <br />
                  💕 Precisa de pelo menos 3 emojis de coração, florzinha ou beijinho no final!
                </small>
              </div>
            </div>

            <div className='testimonials-list'>
              <h4>Depoimentos recebidos:</h4>
              {loadingTestimonials ? (
                <div className='testimonials-loading'>
                  <span>⏳</span>
                  <p>Carregando depoimentos das vovozinhas...</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className='no-testimonials'>
                  <span>👵</span>
                  <p>Ainda não há depoimentos de vovozinha para este usuário. Seja o primeiro a mandar um carinho!</p>
                </div>
              ) : (
                <div className='testimonials-items'>
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id || index} className='testimonial-item'>
                      <div className='testimonial-header'>
                        <div className='testimonial-author'>
                          <strong>@{testimonial.author_username}</strong>
                          <small>{new Date(testimonial.created_at).toLocaleDateString("pt-BR")}</small>
                        </div>
                      </div>
                      <div className='testimonial-content'>
                        <p>
                          {testimonial.final_testimonial}

                          <img
                            src={[gif1, gif2, gif3, gif4, gif5][parseInt(testimonial.theme) - 1]}
                            alt={`Vovó tema ${testimonial.theme}`}
                            className='testimonial-theme-gif'
                          />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </>
  );
};

export default UserPage;
