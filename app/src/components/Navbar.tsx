import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { Button } from '@radix-ui/themes';
import { LuLogOut, LuUser } from "react-icons/lu"
import { Logo } from './Logo';

const Navbar = ({ user, logout }: {
  user: User,
  logout: () => void
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header>
      <Logo userName={user.username} />
      <div className='side-actions'>
        <Button variant='outline' onClick={handleProfileClick} >
          <LuUser />
          {user?.username}
        </Button>

        <Button onClick={logout}>
          <LuLogOut />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;