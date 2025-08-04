import { Avatar, Button, Card, Flex, Text } from "@radix-ui/themes";
import React, { useCallback, useEffect, useState } from "react";
import { LuArrowLeft, LuMessageCircle, LuUserMinus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFollows } from "../contexts/FollowsContext";
import { apiClient } from "../services/api";

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

const PanelinhaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<PanelinhaMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowLoading, setUnfollowLoading] = useState<number | null>(null);
  const { refreshDbFollowsCount } = useFollows();

  const loadPanelinhaMembers = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await apiClient.getPanelinhaMembers();
      const members = response.members;
      setMembers(members);
    } catch (error) {
      console.error("Error loading panelinha members:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleUnfollowMember = async (memberId: number) => {
    if (!currentUser) return;

    setUnfollowLoading(memberId);
    try {
      await apiClient.unfollowUser(memberId);
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      await refreshDbFollowsCount();
    } catch (error) {
      console.error("Error unfollowing member:", error);
    } finally {
      setUnfollowLoading(null);
    }
  };

  const handleMemberClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  const handleCreateGroupChat = async () => {
    if (!currentUser || members.length === 0) return;

    try {
      const room = await apiClient.createChatRoom({
        name: `Grupo da Panelinha de ${currentUser.username}`,
        is_group: true,
        member_ids: members.map((member) => member.id),
      });

      navigate(`/chat/${room.id}`);
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
  };

  useEffect(() => {
    loadPanelinhaMembers();
  }, [loadPanelinhaMembers]);

  if (loading) {
    return (
      <section className="panelinha">
        <Card size={"4"} className="panelinha-card">
          <Flex direction={"column"} align={"center"} gap={"4"}>
            <h1>Carregando...</h1>
          </Flex>
        </Card>
      </section>
    );
  }

  return (
    <section className="panelinha">
      <Card size={"4"} className="panelinha-card">
        <Flex direction={"column"} gap={"4"}>
          <Flex align={"center"} gap={"4"}>
            <Button variant="outline" onClick={() => navigate("/")}>
              <LuArrowLeft /> Voltar
            </Button>
            <h1>Membros da Panelinha</h1>
            <Text size="3" color="gray">
              {members.length} {members.length === 1 ? "membro" : "membros"}
            </Text>
            <Button
              variant="outline"
              onClick={handleCreateGroupChat}
              style={{ marginLeft: "auto" }}
            >
              <LuMessageCircle /> Chat da Panelinha
            </Button>
          </Flex>

          {members.length === 0 ? (
            <div className="no-members">
              <span>😢</span>
              <p>
                Ninguém? Nem um bot? Nem a equipe de suporte? Que nível de
                solidão é esse?
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Explorar usuários
              </Button>
            </div>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <Card key={member.id} size={"3"} className="member-card">
                  <Flex gap={"4"} align={"center"} justify={"between"}>
                    <Flex
                      gap={"3"}
                      align={"center"}
                      style={{ flex: 1, cursor: "pointer" }}
                      onClick={() => handleMemberClick(member.username)}
                    >
                      <Avatar
                        size={"5"}
                        radius="full"
                        src={member.avatarUrl || undefined}
                        fallback={member.username.substring(0, 1).toUpperCase()}
                      />
                      <div>
                        <Text weight="bold" style={{ marginRight: "0.5rem" }}>
                          {member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.username}
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
                      {unfollowLoading === member.id
                        ? "Removendo..."
                        : "Remover"}
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
