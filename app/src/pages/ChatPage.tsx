import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatWindow } from "../components/ChatWindow";
import { ChatProvider, useChat } from "../contexts/ChatContext";
import { usePageTitle } from "../hooks/usePageTitle";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const ChatPage: React.FC = () => {
  const { room_id } = useParams<{ room_id?: string }>();
  const { currentRoom, setCurrentRoomById, setCurrentRoom } = useChat();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  usePageTitle(currentRoom ? `Chat com ${currentRoom.otherUser.firstName || currentRoom.otherUser.username} - Rede Social` : 'Chat - Rede Social');

  const handleBackToSidebar = () => {
    setCurrentRoom(null);
    navigate("/chat");
  };

  if (!currentRoom && room_id) {
    setCurrentRoomById(parseInt(room_id, 10));
  }

  const showSidebar = !currentRoom || !isMobile;

  if (!isMobile) {
    return (
      <div className="chat-page">
        <ChatSidebar />
        <ChatWindow />
      </div>
    );
  }

  return (
    <div className="chat-page">
      {(() => {
        if (showSidebar) return <ChatSidebar />;
        return <ChatWindow handleBack={handleBackToSidebar} />;
      })()}
    </div>
  );
};

const ChatPageWrapper: React.FC = () => {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
};

export default ChatPageWrapper;
