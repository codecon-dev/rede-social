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

      <img src='https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/226501885/original/387d07b30df8e53c949fd9b3eb7dc1499ce61906/setup-and-manage-the-facebook-ads-campaigns.jpg' />
    </aside>
  );
};

export default Sidebar;
