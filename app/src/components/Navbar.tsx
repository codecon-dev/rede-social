import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { User } from "../types";
import { TextField } from "@radix-ui/themes";
import { LuSearch } from "react-icons/lu";
import { Logo } from "./Logo";

const Navbar = ({ user }: { user?: User; logout?: () => void }) => {
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/user/${searchUsername.trim()}`);
      setSearchUsername("");
    }
  };

  return (
    <header>
      <div className="navbar-top">
        <Logo userName={user?.username} />
        {user && (
          <div className="navbar-search">
            <form onSubmit={handleSearch} className="search-form">
              <TextField.Root
                placeholder="Pesquisar usuário..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                size={"3"}
                className="search-input"
              >
                <TextField.Slot side="right" onClick={handleSearch}>
                  <LuSearch size={18} />
                </TextField.Slot>
              </TextField.Root>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
