import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? formData : { email: formData.email, password: formData.password };
      
      const res = await api.post(endpoint, payload);
      
      const { user, token } = res.data.data;
      localStorage.setItem('fairdigest_token', token);
      localStorage.setItem('fairdigest_user', JSON.stringify(user));
      
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream items-center justify-center p-4">
      
      <div className="mb-8 text-center animate-fade-in-up">
        <Link to="/" className="inline-block group">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <h1 className="font-serif text-3xl font-black tracking-tight text-ink">
              <span className="italic font-bold">The</span> Fair Digest
            </h1>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in-up delay-100">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-ink">
            {isRegister ? 'Join the Readership' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            {isRegister ? 'Create an account to save your briefs.' : 'Sign in to access your saved briefs.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-muted mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-muted mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-muted mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-ink text-cream rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-ink-muted hover:text-ink underline transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
