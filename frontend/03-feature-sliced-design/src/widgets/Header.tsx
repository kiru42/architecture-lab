import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { useUserStore } from '../entities/user/model/store';
import { NotificationCenter } from './NotificationCenter';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold">
              TaskFlow
            </Link>
            {isAuthenticated && (
              <nav className="flex gap-4">
                <Link to="/projects" className="hover:underline">
                  Projects
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span data-testid="header-user" className="text-sm">
                  {user?.name}
                </span>
                <Button variant="secondary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Only an authenticated session has anything to watch, so the centre
            is mounted exactly when there is a session — and never on the
            sign-in screen, where a visitor must hold no socket. */}
        {isAuthenticated && <NotificationCenter />}
      </div>
    </header>
  );
};
