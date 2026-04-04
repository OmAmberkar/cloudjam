import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Cloud } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
       <div className="google-brand-bar">
        <div className="brand-blue"></div>
        <div className="brand-red"></div>
        <div className="brand-yellow"></div>
        <div className="brand-green"></div>
      </div>
      
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', width: '72px', height: '72px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
            <Cloud size={32} color="#4285F4" fill="#4285F4" fillOpacity={0.1} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#202124' }}>CloudJams Admin</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Secure portal for leaderboard management</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5f6368', marginLeft: '0.2rem', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
            <input 
              type="email" 
              className="search-input" 
              placeholder="admin@gdgc.com" 
              style={{ width: '100%', background: '#fff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5f6368', marginLeft: '0.2rem', marginBottom: '0.4rem', display: 'block' }}>Password</label>
            <input 
              type="password" 
              className="search-input" 
              placeholder="••••••••" 
              style={{ width: '100%', background: '#fff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-text" style={{ marginBottom: '1.5rem', background: '#fce8e6', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f99' }}>{error}</div>}
          <button type="submit" className="btn-primary filled" style={{ width: '100%', height: '48px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
          
          <button 
            type="button" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', height: '48px', border: 'none', boxShadow: 'none' }} 
            onClick={() => navigate('/')}
          >
            Back to Public View
          </button>
        </form>
      </div>
    </div>
  );
}
