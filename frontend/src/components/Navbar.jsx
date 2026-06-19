import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between p-4 text-white bg-gray-800">
      <h1 className="text-xl font-bold">{title}</h1>
      <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
    </nav>
  );
}