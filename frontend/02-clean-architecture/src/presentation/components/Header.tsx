import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>
            <span className="ml-4 text-sm text-gray-500">Clean Architecture</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span data-testid="header-user" className="text-sm text-gray-700">
                {user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mounted here so the socket lives as long as an authenticated page. */}
      <NotificationCenter />
    </header>
  );
}
