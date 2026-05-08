import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-teal-400">
              Catasto Grotte
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/caves" className="hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Lista Grotte
            </Link>
            <Link to="/map" className="hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Mappa
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <span className="text-slate-400 text-sm font-medium px-3 py-2">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
