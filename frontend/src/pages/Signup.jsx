import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';


const Spinner = () => (
  <svg className="animate-spin w-5 h-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccessMsg('');
    
    try {
      await api.post('/auth/signup', form);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([err.response?.data?.error || 'Signup failed. Please try again.']);
      }
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl transition-all">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Create an Account</h2>
          <p className="text-slate-500 mt-2 text-sm">Join to discover and rate registered stores</p>
        </div>
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center font-medium animate-fade-in">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {successMsg}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm animate-fade-in">
            <div className="font-bold mb-1 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Please fix the following errors:
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60" 
              type="text" 
              placeholder="John Doe (Minimum 20 characters)" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              required 
              minLength={20} 
              maxLength={60} 
              disabled={isLoading || successMsg}
            />
            <div className={`text-xs mt-1 font-medium text-right ${form.name.length < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {form.name.length}/60 chars {form.name.length > 0 && form.name.length < 20 && '(Keep typing...)'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60" 
              type="email" 
              placeholder="you@example.com" 
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              required 
              disabled={isLoading || successMsg}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Secure Password</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60" 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required 
              disabled={isLoading || successMsg}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Must be 8-16 characters, including at least 1 uppercase letter and 1 special character.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Physical Address</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 resize-none" 
              placeholder="123 Main St, City, Country" 
              rows="3"
              value={form.address} 
              onChange={(e) => setForm({...form, address: e.target.value})} 
              required 
              maxLength={400}
              disabled={isLoading || successMsg}
            />
            <div className="text-xs text-slate-400 mt-1 text-right">
              {form.address.length}/400 chars max
            </div>
          </div>

          <button 
            className="w-full p-3 mt-4 text-white bg-emerald-600 rounded-lg font-bold hover:bg-emerald-700 transition-all flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed" 
            type="submit"
            disabled={isLoading || successMsg}
          >
            {isLoading ? (
              <>
                <Spinner />
                Creating Account...
              </>
            ) : (
              'Sign Up Now'
            )}
          </button>
        </form>


        <p className="mt-6 text-sm text-center text-slate-600 border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}