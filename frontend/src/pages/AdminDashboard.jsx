import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';


function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Spinner = () => (
  <svg className="animate-spin w-5 h-5 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Search & Filters
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400); 
  const [roleFilter, setRoleFilter] = useState('');
  const [userSort, setUserSort] = useState({ by: 'name', order: 'ASC' });
  const [storeSort, setStoreSort] = useState({ by: 'name', order: 'ASC' });

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [toast, setToast] = useState(null); 

  // Form States
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
  const [newStore, setNewStore] = useState({ owner_id: '', name: '', email: '', address: '' });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const metricRes = await api.get('/admin/dashboard');
      setMetrics(metricRes.data);

      const userRes = await api.get(`/admin/users?search=${debouncedSearch}&role=${roleFilter}&sortBy=${userSort.by}&order=${userSort.order}`);
      setUsers(userRes.data);

      const storeRes = await api.get(`/admin/stores?search=${debouncedSearch}&sortBy=${storeSort.by}&order=${storeSort.order}`);
      setStores(storeRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [debouncedSearch, roleFilter, userSort, storeSort]);

  const toggleUserSort = (col) => setUserSort(prev => ({ by: col, order: prev.by === col && prev.order === 'ASC' ? 'DESC' : 'ASC' }));
  const toggleStoreSort = (col) => setStoreSort(prev => ({ by: col, order: prev.by === col && prev.order === 'ASC' ? 'DESC' : 'ASC' }));

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    try {
      await api.post('/admin/users', newUser);
      setToast({ message: 'User provisioned successfully!', type: 'success' });
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.errors?.join('\n') || 'Error adding user', type: 'error' });
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setIsSubmittingStore(true);
    try {
      await api.post('/admin/stores', newStore);
      setToast({ message: 'Store registered successfully!', type: 'success' });
      setNewStore({ owner_id: '', name: '', email: '', address: '' });
      setShowStoreModal(false);
      fetchData();
    } catch (err) {
      setToast({ message: 'Error adding store', type: 'error' });
    } finally {
      setIsSubmittingStore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Navbar title="Admin Dashboard" />
      
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
          <div className="flex gap-4">
            <button onClick={() => setShowUserModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm">
              + Add User
            </button>
            <button onClick={() => setShowStoreModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm">
              + Add Store
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Users</h3>
            <p className="text-4xl font-black text-blue-600 mt-2">{metrics.totalUsers}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Stores</h3>
            <p className="text-4xl font-black text-emerald-600 mt-2">{metrics.totalStores}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Ratings</h3>
            <p className="text-4xl font-black text-purple-600 mt-2">{metrics.totalRatings}</p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search by Name, Email, or Address..." 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} 
            />
          </div>
          <select 
            className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="NORMAL">Normal</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>

 
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Users Table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">User Directory</h2>
              {isLoading && <Spinner />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-slate-500 uppercase text-xs tracking-wider cursor-pointer select-none">
                    <th className="p-4 hover:bg-slate-50 transition" onClick={() => toggleUserSort('name')}>Name {userSort.by==='name' ? (userSort.order==='ASC'?'↑':'↓') : ''}</th>
                    <th className="p-4 hover:bg-slate-50 transition" onClick={() => toggleUserSort('role')}>Role {userSort.by==='role' ? (userSort.order==='ASC'?'↑':'↓') : ''}</th>
                    <th className="p-4">Store Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{u.name}</div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'STORE_OWNER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{u.store_rating || '-'}</td>
                    </tr>
                  ))}
                  {users.length === 0 && !isLoading && (
                    <tr><td colSpan="3" className="p-6 text-center text-slate-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stores Table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Store Directory</h2>
              {isLoading && <Spinner />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-slate-500 uppercase text-xs tracking-wider cursor-pointer select-none">
                    <th className="p-4 hover:bg-slate-50 transition" onClick={() => toggleStoreSort('name')}>Store Info {storeSort.by==='name' ? (storeSort.order==='ASC'?'↑':'↓') : ''}</th>
                    <th className="p-4 hover:bg-slate-50 transition" onClick={() => toggleStoreSort('rating')}>Avg Rating {storeSort.by==='rating' ? (storeSort.order==='ASC'?'↑':'↓') : ''}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stores.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{s.name}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[200px]">{s.address}</div>
                      </td>
                      <td className="p-4 font-bold text-amber-500">{s.rating} ⭐</td>
                    </tr>
                  ))}
                  {stores.length === 0 && !isLoading && (
                    <tr><td colSpan="2" className="p-6 text-center text-slate-500">No stores found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Provision New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Full Name (Min 20 chars)" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} required minLength={20}/>
              <input type="email" placeholder="Email Address" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} required/>
              <input type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
              <input type="text" placeholder="Home Address" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newUser.address} onChange={e=>setNewUser({...newUser, address: e.target.value})} required/>
              <select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                <option value="NORMAL">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={isSubmittingUser} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                  {isSubmittingUser ? <Spinner /> : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Register New Store</h2>
            <form onSubmit={handleAddStore} className="space-y-4">
              <select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-white" value={newStore.owner_id} onChange={e=>setNewStore({...newStore, owner_id: e.target.value})} required>
                <option value="">Select a Store Owner...</option>
                {users.filter(u => u.role === 'STORE_OWNER').map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Store Name" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-emerald-500" value={newStore.name} onChange={e=>setNewStore({...newStore, name: e.target.value})} required/>
              <input type="email" placeholder="Store Email" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-emerald-500" value={newStore.email} onChange={e=>setNewStore({...newStore, email: e.target.value})} required/>
              <input type="text" placeholder="Store Address" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-emerald-500" value={newStore.address} onChange={e=>setNewStore({...newStore, address: e.target.value})} required/>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={isSubmittingStore} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-70">
                  {isSubmittingStore ? <Spinner /> : 'Save Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}