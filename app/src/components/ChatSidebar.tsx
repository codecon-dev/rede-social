import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import type { ChatRoom } from "../types";

export const ChatSidebar: React.FC = () => {
  const { rooms, currentRoom, setCurrentRoom } = useChat();
  const navigate = useNavigate();

  const handleRoomClick = (room: ChatRoom) => {
    setCurrentRoom(room);
    navigate(`/chat/${room.id}`);
  };

  return (
    <div className="chat-sidebar">
      <h2 className="chat-sidebar__header">Conversas</h2>
      <div className="chat-sidebar__rooms">
        {(() => {
          if (rooms.length === 0) {
            return <p className="chat-sidebar__empty">Sem conversas</p>;
          }
          return rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={currentRoom?.id === room.id}
              onClick={handleRoomClick}
            />
          ));
        })()}
      </div>
    </div>
  );
};

interface RoomItemProps {
  room: ChatRoom;
  isActive: boolean;
  onClick: (room: ChatRoom) => void;
}

const RoomItem: React.FC<RoomItemProps> = ({ room, isActive, onClick }) => {
  const { user } = useAuth();
  const lastMessageTime = useMemo(() => {
    if (!room.last_message?.created_at) return "";
    const date = new Date(room.last_message.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Agora";
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} h atrás`;
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, [room.last_message?.created_at]);

  const lastMessagePreview = useMemo(() => {
    if (!room.last_message) return "Nenhuma mensagem";
    const sender =
      room.last_message.user_id === user?.id
        ? "Você"
        : room.last_message.username;

    return `${sender}: ${room.last_message.message}`;
  }, [room.last_message, user?.id]);

  const roomName = useMemo(() => {
    if (room.is_group) {
      return room.name || "Grupo sem nome";
    }

    return (
      room.members
        .filter((member) => member.user_id !== user?.id)
        .map((member) => member.username)
        .join(", ") || "Usuário sem nome"
    );
  }, [room.members, room.is_group, user?.id, room.name]);
  return (
    <button
      className={`room-item ${isActive ? "room-item--active" : ""} `}
      onClick={() => onClick(room)}
      type="button"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick(room);
        }
      }}
      tabIndex={0}
      aria-label={`Chat room: ${roomName}`}
    >
      <div className="room-item__content">
        <div className="room-item__header">
          <h4 className="room-item__name">{roomName}</h4>
          {room.last_message && (
            <span className="room-item__time">{lastMessageTime}</span>
          )}
        </div>
        <p className="room-item__preview">{lastMessagePreview}</p>
      </div>
    </button>
  );
};
