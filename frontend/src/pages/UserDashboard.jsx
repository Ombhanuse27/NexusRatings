import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import ChangePassword from '../components/ChangePassword';

// --- INLINED HELPERS & COMPONENTS ---

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Spinner = ({ color = "text-blue-500", size = "w-5 h-5" }) => (
  <svg className={`animate-spin ${size} ${color} inline-block`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const StarRating = ({ currentRating, onRate, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`text-3xl transition-all duration-200 transform ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-125 hover:-translate-y-1'
          } ${
            (hoverRating || currentRating) >= star ? 'text-amber-400 drop-shadow-md' : 'text-slate-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  
  // Search & Filters
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400); 
  const [sort, setSort] = useState({ by: 'name', order: 'ASC' });
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [ratingLoadingId, setRatingLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user/stores?search=${debouncedSearch}&sortBy=${sort.by}&order=${sort.order}`);
      setStores(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [debouncedSearch, sort]);

  const handleRate = async (storeId, rating) => {
    setRatingLoadingId(storeId);
    
    // Optimistic UI Update: Instantly show the new rating to the user
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, user_rating: rating } : s));

    try {
      await api.post(`/user/stores/${storeId}/rate`, { rating });
      setToast({ message: 'Rating saved successfully!', type: 'success' });
      
      // Re-fetch in background to update the overall average rating
      const res = await api.get(`/user/stores?search=${debouncedSearch}&sortBy=${sort.by}&order=${sort.order}`);
      setStores(res.data);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to submit rating', type: 'error' });
      fetchStores(); // Revert optimistic update on failure
    } finally {
      setRatingLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Navbar title="Explore Stores" />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-medium transition-all animate-fade-in ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search stores by Name or Address..." 
              className="w-full p-3 pl-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isLoading && <div className="absolute right-3 top-3.5"><Spinner color="text-blue-500" /></div>}
          </div>
          
          <div className="flex gap-2">
            <select 
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all min-w-[160px]" 
              onChange={(e) => setSort({ by: e.target.value, order: sort.order })}
              value={sort.by}
            >
              <option value="name">Sort by Name</option>
              <option value="address">Sort by Address</option>
              <option value="overall_rating">Sort by Rating</option>
            </select>
            
            <button 
              className="p-3 font-medium transition-colors bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 min-w-[140px]"
              onClick={() => setSort({ ...sort, order: sort.order === 'ASC' ? 'DESC' : 'ASC' })}
            >
              {sort.order === 'ASC' ? 'Ascending ↑' : 'Descending ↓'}
            </button>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map(store => (
            <div key={store.id} className="flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{store.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[40px]">{store.address}</p>
                
                <div className="flex items-center justify-between py-4 mt-4 mb-4 border-y border-slate-100 bg-slate-50/50 rounded-lg px-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall</span>
                    <span className="font-bold text-amber-500 text-lg">{store.overall_rating} ⭐</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Rating</span>
                    <span className={`font-semibold text-lg ${store.user_rating ? 'text-blue-600' : 'text-slate-400'}`}>
                      {store.user_rating ? `${store.user_rating} ★` : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center pt-2">
                <p className="mb-3 text-sm font-semibold text-slate-500">
                  {ratingLoadingId === store.id ? (
                    <span className="flex items-center gap-2"><Spinner size="w-4 h-4"/> Saving...</span>
                  ) : (
                    'Tap to rate this store'
                  )}
                </p>
                <StarRating 
                  currentRating={store.user_rating || 0} 
                  onRate={(rating) => handleRate(store.id, rating)} 
                  disabled={ratingLoadingId === store.id}
                />
              </div>

            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {!isLoading && stores.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">No stores found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        )}

        <div className="pt-6 border-t border-slate-200 mt-8">
          <ChangePassword />
        </div>
        
      </div>
    </div>
  );
}