import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { Button } from "@radix-ui/themes";
import { LuLogOut, LuUser, LuUsers, LuMessageCircle, LuHouse } from "react-icons/lu";
import { useFollows } from "../contexts/FollowsContext";

const Sidebar = ({ user, logout }: { user?: User; logout?: () => void }) => {
  const navigate = useNavigate();
  const { dbFollowsCount, isLoading: dbLoading } = useFollows();

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handlePanelinhaClick = () => {
    navigate("/panelinha");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const totalMembersCount = dbFollowsCount;
  const isLoading = dbLoading;

  if (!user || !logout) {
    return null;
  }

  return (
    <aside className='sidebar'>
      <nav className='sidebar-nav'>
        <Button variant='ghost' onClick={handleHomeClick} className='sidebar-button'>
          <LuHouse />
          Home
        </Button>

        <Button variant='ghost' onClick={handleChatClick} className='sidebar-button'>
          <LuMessageCircle />
          Chat
        </Button>

        <Button variant='ghost' onClick={handlePanelinhaClick} className='sidebar-button'>
          <LuUsers />
          Minha Panelinha
          {!isLoading && <span className='members-count'>{totalMembersCount}</span>}
        </Button>

        <Button variant='ghost' onClick={handleProfileClick} className='sidebar-button'>
          <LuUser />
          {user?.username}
        </Button>

        <Button variant='ghost' onClick={logout} className='sidebar-button logout-button'>
          <LuLogOut />
          Sair
        </Button>
      </nav>
      ANÚNCIO
      <a href='https://eventos.codecon.dev/codecon-summit-26/'>
        <img src='https://images.even3.com/Deg_0Btj1NfyNb0vHx-4E4UMHZw=/1100x440/smart/https://static.even3.com/banner/capa-even3.7bb293d07c4a4195af14.png' />
      </a>
    </aside>
  );
};

export default Sidebar;
