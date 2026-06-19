import { useState } from 'react';
import api from '../api';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4 mr-2 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!passRegex.test(newPassword)) {
      setIsLoading(false);
      return setError('Password must be 8-16 chars, 1 uppercase, 1 special character.');
    }

    try {
      await api.post('/auth/update-password', { newPassword });
      setMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      

      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Security Settings</h3>
        <p className="text-sm text-slate-500 mt-1">Update your account password</p>
      </div>
      
      <div className="p-6">
        

        {message && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center text-sm font-medium animate-fade-in">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center text-sm font-medium animate-fade-in">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}


        <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="password"
              placeholder="Enter new secure password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !newPassword}
            className="px-6 py-3 text-white bg-slate-800 rounded-lg font-bold hover:bg-slate-900 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Spinner />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}