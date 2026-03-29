import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Code2, Eye, EyeOff, Sparkles, Users, Zap, GitBranch, MessageSquare } from 'lucide-react';
import './AuthPage.css';

const DOMAINS = ['Web Development', 'AI / ML', 'Mobile Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Game Development', 'DevOps', 'Blockchain', 'Other'];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', domain: '',
    college: '', degree: '', year: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(form.email, form.password);
        if (!result.success) {
          toast.error(result.error || 'Login failed');
        } else {
          toast.success('Welcome back! 🎉');
        }
      } else {
        if (!form.fullName || !form.email || !form.password) {
          toast.error('Please fill all required fields');
          setLoading(false);
          return;
        }
        const result = await signup(form);
        if (!result.success) {
          toast.error(result.error || 'Registration failed');
        } else {
          toast.success('Account created! Welcome to Campus Connection 🚀');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
        <div className="auth-bg-grid"></div>
      </div>

      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="auth-logo animate-fade-in-up">
              <img 
                src="/logo.png" 
                alt="Campus Connection Logo" 
                className="auth-logo-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  document.getElementById('auth-fallback-icon').style.display = 'flex';
                }}
              />
              <div className="auth-logo-icon" id="auth-fallback-icon" style={{ display: 'none' }}>
                <Code2 size={32} />
              </div>
              <h1>Campus Connection</h1>
            </div>
            <p className="auth-tagline animate-fade-in-up delay-1">
              a platform where coding,communication and coordination happens in one place
            </p>
            <div className="auth-features">
              {[
                { icon: <Users size={20} />, text: 'Real-time team collaboration' },
                { icon: <Zap size={20} />, text: 'Live code editing with cursors' },
                { icon: <GitBranch size={20} />, text: 'Built-in version tracking' },
                { icon: <MessageSquare size={20} />, text: 'Integrated team chat' },
              ].map((f, i) => (
                <div key={i} className={`auth-feature animate-fade-in-up delay-${i + 2}`}>
                  <div className="auth-feature-icon">{f.icon}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-brand-footer">
            <Sparkles size={14} />
            <span>Built for students, by students</span>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
              <p>{isLogin ? 'Sign in to continue to your workspace' : 'Join thousands of student developers'}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="input-group animate-fade-in-up">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input-field"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="input-group animate-fade-in-up">
                    <label htmlFor="domain">Interested Domain</label>
                    <select id="domain" name="domain" className="input-field" value={form.domain} onChange={handleChange}>
                      <option value="">Select your domain</option>
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="auth-form-row">
                    <div className="input-group animate-fade-in-up">
                      <label htmlFor="college">College</label>
                      <input id="college" name="college" type="text" className="input-field" placeholder="Your college" value={form.college} onChange={handleChange} />
                    </div>
                    <div className="input-group animate-fade-in-up">
                      <label htmlFor="degree">Degree</label>
                      <input id="degree" name="degree" type="text" className="input-field" placeholder="B.Tech CSE" value={form.degree} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="input-group animate-fade-in-up">
                    <label htmlFor="year">Year</label>
                    <select id="year" name="year" className="input-field" value={form.year} onChange={handleChange}>
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? (
                  <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary auth-google-btn" 
              onClick={() => toast.info('Google login integration coming soon!')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="auth-switch">
              <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
              <button onClick={() => setIsLogin(!isLogin)} className="auth-switch-btn">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
