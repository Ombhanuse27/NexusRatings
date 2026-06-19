import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { logout, user } = useContext(AuthContext);

  const initial = user?.role ? user.role.charAt(0) : 'U';

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 shadow-md bg-gradient-to-r from-indigo-600 to-blue-700">
      
      {/* Left Section: Avatar & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-11 h-11 text-lg font-black text-indigo-700 bg-white rounded-full shadow-inner ring-4 ring-indigo-400/30 select-none">
          {initial}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
      </div>

      <button 
        onClick={logout} 
        className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-white/10 border border-white/20 rounded-xl hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm"
      >
        Sign Out
        <svg 
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2.5" 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      </button>
      
    </nav>
  );
}