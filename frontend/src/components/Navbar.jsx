import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { logout, user } = useContext(AuthContext);

  // Get the first letter of the user's role to use as a profile avatar
  const initial = user?.role ? user.role.charAt(0) : 'U';

  return (
    <nav className="flex items-center justify-between px-8 py-4 text-white shadow-lg bg-slate-900 border-b border-slate-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 font-extrabold text-slate-900 bg-white rounded-full shadow-md">
          {initial}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {title}
        </h1>
      </div>
      <button 
        onClick={logout} 
        className="flex items-center gap-2 px-5 py-2.5 font-semibold transition-all duration-200 bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:bg-red-600 hover:border-red-500 hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </nav>
  );
}