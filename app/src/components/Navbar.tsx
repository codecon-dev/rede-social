import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { Button, TextField } from '@radix-ui/themes';
import { LuLogOut, LuUser, LuSearch, LuUsers } from "react-icons/lu"
import { Logo } from './Logo';
import { apiClient } from '../services/api';
import { useMockFollows } from '../hooks/useMockFollows';

const Navbar = ({ user, logout }: {
  user?: User,
  logout?: () => void
}) => {
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState('');
  const [membersCount, setMembersCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const { getMockFollowsCount } = useMockFollows();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePanelinhaClick = () => {
    navigate('/panelinha');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/user/${searchUsername.trim()}`);
      setSearchUsername('');
    }
  };

  const loadMembersCount = async () => {
    if (!user) return;

    setLoadingCount(true);
    try {
      const response = await apiClient.getPanelinhaMembersCount();
      const dbCount = response.count;

      const mockCount = getMockFollowsCount();
      
      setMembersCount(dbCount + mockCount);
    } catch (error) {
      console.error('Error loading members count:', error);
      const mockCount = getMockFollowsCount();
      setMembersCount(mockCount);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    loadMembersCount();
  }, [user, getMockFollowsCount]);

  return (
    <header>
      <div className="navbar-top">
        <Logo userName={user?.username} />
        {user && logout && (
          <div className='side-actions'>
            <Button variant='outline' onClick={handlePanelinhaClick}>
              <LuUsers />
              Membros da Panelinha
              {!loadingCount && (
                <span className="members-count">
                  {membersCount}
                </span>
              )}
            </Button>

            <Button variant='outline' onClick={handleProfileClick} >
              <LuUser />
              {user?.username}
            </Button>

            <Button onClick={logout}>
              <LuLogOut />
            </Button>
          </div>
        )}
      </div>

      {user && (
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
      )}
    </header>
  );
};

export default Navbar;