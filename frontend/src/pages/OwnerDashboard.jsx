import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import ChangePassword from '../components/ChangePassword';

// --- INLINED SPINNER ---
const Spinner = ({ size = "w-8 h-8", color = "text-blue-500" }) => (
  <svg className={`animate-spin ${size} ${color} inline-block`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function OwnerDashboard() {
  const [data, setData] = useState({ storeName: '', averageRating: 0, raters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Sorting State for the table
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get('/owner/dashboard');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data. Ensure an Admin has linked a store to your account.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Client-side sorting logic
  const sortedRaters = useMemo(() => {
    let sortableItems = [...data.raters];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting specifically
      if (sortConfig.key === 'updated_at') {
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [data.raters, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Navbar title="Store Owner Portal" />
      
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner />
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start shadow-sm">
            <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h3 className="text-red-800 font-bold text-lg">Access Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Metrics Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Registered Store Identity</h2>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{data.storeName}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-amber-100 transition-all hover:shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">Overall Performance</h2>
                  <p className="text-4xl font-black text-amber-600 drop-shadow-sm">{data.averageRating}</p>
                </div>
                <div className="text-6xl drop-shadow-md">⭐</div>
              </div>
            </div>

            {/* Interactive Ratings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Customer Reviews & Ratings</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                  {data.raters.length} Total Ratings
                </span>
              </div>
              
              <div className="overflow-x-auto">
                {data.raters.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-xs tracking-wider cursor-pointer select-none">
                        <th className="p-4 hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                          Customer Name{getSortIndicator('name')}
                        </th>
                        <th className="p-4 hover:bg-slate-100 transition-colors" onClick={() => requestSort('email')}>
                          Email{getSortIndicator('email')}
                        </th>
                        <th className="p-4 hover:bg-slate-100 transition-colors" onClick={() => requestSort('rating')}>
                          Rating Given{getSortIndicator('rating')}
                        </th>
                        <th className="p-4 hover:bg-slate-100 transition-colors" onClick={() => requestSort('updated_at')}>
                          Date Submitted{getSortIndicator('updated_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRaters.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4 font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{r.name}</td>
                          <td className="p-4 text-slate-500">{r.email}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                              {r.rating} ★
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {new Date(r.updated_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-slate-400">💤</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700">No ratings yet</h4>
                    <p className="text-slate-500 mt-1 max-w-sm">When normal users submit ratings for your store, they will appear here automatically.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password Component Wrapper */}
            <div className="pt-4">
              <ChangePassword />
            </div>
          </>
        )}
      </div>
    </div>
  );
}