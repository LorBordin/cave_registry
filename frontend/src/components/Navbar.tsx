import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapIcon, ListBulletIcon, ArrowRightOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-teal-400 font-medium' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white font-semibold text-lg">
              <GlobeAltIcon className="w-6 h-6 text-teal-500" />
              <span>Catasto Grotte</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <NavLink to="/caves" className={linkClass}>
              <div className="flex items-center space-x-1">
                <ListBulletIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Grotte</span>
              </div>
            </NavLink>
            <NavLink to="/map" className={linkClass}>
              <div className="flex items-center space-x-1">
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Mappa</span>
              </div>
            </NavLink>
            
            {user ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                   <span className="hidden sm:inline">Dashboard</span>
                   <span className="sm:hidden">Admin</span>
                </NavLink>
                <div className="h-4 w-px bg-slate-700 mx-2" />
                <span className="text-slate-400 text-sm hidden lg:inline">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Esci</span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Accedi
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
