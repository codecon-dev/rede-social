import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../contexts/ChatContext";
import type { ChatMessage, ChatRoomMember } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { LuArrowLeft } from "react-icons/lu";

type ChatWindowProps = {
  handleBack?: () => void;
};

const MessageInput: React.FC = () => {
  const { sendMessage, startTyping, stopTyping } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const messageInput = form.querySelector(
        "input[name='message']",
      ) as HTMLInputElement;
      const message = messageInput.value;
      if (!message.trim) return;
      sendMessage(message);
      messageInput.value = "";
      setIsTyping(false);
    },
    [sendMessage],
  );

  const handleStartTyping = useCallback(() => {
    if (isTyping) return;
    setIsTyping(true);
    startTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 2000);
  }, [isTyping, startTyping, stopTyping]);

  const handleStopTyping = useCallback(() => {
    if (!isTyping) return;
    setIsTyping(false);
    stopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (!typingTimeoutRef.current) return;
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <input
        type="text"
        name="message"
        placeholder="Digite sua mensagem..."
        onFocus={handleStartTyping}
        onBlur={handleStopTyping}
        onChange={handleStartTyping}
        className="message-input__field"
      />
      <button type="submit" className="message-input__button">
        Enviar
      </button>
    </form>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isGroup: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGroup,
  isOwn,
}) => {
  const messageTime = useMemo(() => {
    if (!message?.created_at) return "";
    const date = new Date(message.created_at);
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
  }, [message?.created_at]);

  return (
    <div
      className={`message-bubble ${isOwn ? "message-bubble--own" : "message-bubble--other"}`}
    >
      {!isOwn && isGroup && (
        <span className="message-bubble__author">{message.username}</span>
      )}
      <div className="message-bubble__content">
        <p className="message-bubble__text">{message.message}</p>
        <span className="message-bubble__time">{messageTime}</span>
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  typingUsers: ChatRoomMember[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  const message = useMemo(() => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} está digitando...`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].username} e ${typingUsers[1].username} estão digitando...`;
    }

    return `${typingUsers[0].username}, ${typingUsers[1].username} e mais ${typingUsers.length - 2} estão digitando...`;
  }, [typingUsers]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="typing-indicator">
      <span className="typing-indicator__text">{message}</span>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ handleBack }) => {
  const { user } = useAuth();
  const { currentRoom, messages, typingUsers } = useChat();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (!messageEndRef.current) return;
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!currentRoom) return;
    if (messages.length === 0) return;
    scrollToBottom();
  }, [scrollToBottom, currentRoom, messages]);

  if (!currentRoom) {
    return (
      <div className="chat-window chat-window--empty">
        <div className="chat-window__empty-message">
          <h3>Nenhum chat selecionado</h3>
          <p>Selecione um chat para começar a conversar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-window__header">
        {handleBack && (
          <button
            className="chat-window__back-button"
            onClick={handleBack}
            type="button"
          >
            <LuArrowLeft className="chat-window__back-icon" />
          </button>
        )}
        <h2 className="chat-window__title">{currentRoom.name}</h2>
      </header>
      <div className="chat-window__messages">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.user_id === user?.id}
            isGroup={currentRoom.is_group}
          />
        ))}
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}
        <div ref={messageEndRef} />
      </div>
      <div className="chat-window__input">
        <MessageInput />
      </div>
    </div>
  );
};
