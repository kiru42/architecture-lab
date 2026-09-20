import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../atoms/Button';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    authService.signout();
    navigate('/signin');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
        <div className="flex items-center gap-4">
          {/* Mounted with the authenticated shell, so the socket lives exactly
              as long as a session does. */}
          <NotificationCenter />
          {userName && (
            <>
              <span data-testid="header-user" className="text-sm text-gray-600">
                {userName}
              </span>
              <Button variant="danger" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}