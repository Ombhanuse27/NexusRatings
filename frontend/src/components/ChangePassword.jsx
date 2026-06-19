import { useState } from 'react';
import api from '../api';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Form Validation matches backend
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!passRegex.test(newPassword)) {
      return setError('Password must be 8-16 chars, 1 uppercase, 1 special character.');
    }

    try {
      await api.post('/auth/update-password', { newPassword });
      setMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="p-6 mt-6 bg-white rounded shadow">
      <h3 className="mb-4 text-lg font-bold">Update Password</h3>
      {message && <p className="mb-2 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleUpdate} className="flex gap-4">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Update
        </button>
      </form>
    </div>
  );
}