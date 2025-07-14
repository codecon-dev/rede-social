import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { User } from '../types';
import { Button, TextField } from '@radix-ui/themes';
import { LuLogOut, LuUser, LuSearch } from "react-icons/lu"
import { Logo } from './Logo';

const Navbar = ({ user, logout }: {
  user: User,
  logout: () => void
}) => {
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState('');

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/user/${searchUsername.trim()}`);
      setSearchUsername('');
    }
  };

  return (
    <header>
      <div className="navbar-top">
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
      </div>

      <div className="navbar-search">
        <form onSubmit={handleSearch} className="search-form">
          <TextField.Root
            placeholder="Pesquisar usuário..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            size={'3'}
            className="search-input"
          >
            <TextField.Slot side='right' onClick={handleSearch}>
              <LuSearch size={18} />
            </TextField.Slot>
          </TextField.Root>
        </form>
      </div>
    </header>
  );
};

export default Navbar;