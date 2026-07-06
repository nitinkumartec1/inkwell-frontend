import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Handle email link completion (user arrives from magic link)
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem('inkwell_email_for_signin');
      if (!savedEmail) {
        savedEmail = window.prompt('Please confirm your email for sign-in:');
      }
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem('inkwell_email_for_signin');
            toast.success('Welcome to InkWell!');
            navigate('/');
          })
          .catch((err) => {
            console.error(err);
            toast.error('Sign-in link may have expired. Please request a new one.');
          });
      }
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to InkWell!');
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message || 'Google sign-in failed');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    if (!password) return toast.error('Enter your password');
    setLoadingEmail(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome to InkWell!');
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Incorrect password');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleEmailLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    setLoadingEmail(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('inkwell_email_for_signin', email);
      setEmailSent(true);
      toast.success('Login link sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send login link');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">InkWell</h1>
        <p className="auth-subtitle">Where words come alive</p>

        {/* Social Logins */}
        <button
          id="google-login-btn"
          className="btn-social btn-google"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loadingGoogle ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="auth-divider">or</div>

        {/* Magic Link Sent State */}
        {useMagicLink && emailSent ? (
          <div className="email-sent-notice">
            <div className="email-sent-icon">✉️</div>
            <h3>Check your inbox</h3>
            <p>
              We sent a login link to <strong>{email}</strong>. Click the link
              in the email to sign in.
            </p>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => { setEmailSent(false); setUseMagicLink(false); }}
            >
              Use a different email
            </button>
          </div>
        ) : useMagicLink ? (
          /* Magic Link Form */
          <form onSubmit={handleEmailLink}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              id="email-link-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loadingEmail}
            >
              {loadingEmail ? 'Sending...' : 'Send Login Link'}
            </button>
            <button
              type="button"
              className="btn-text-link"
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => setUseMagicLink(false)}
            >
              ← Use password instead
            </button>
          </form>
        ) : (
          /* Email + Password Form */
          <form onSubmit={handleEmailPasswordLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              id="email-password-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loadingEmail}
            >
              {loadingEmail ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              className="btn-text-link"
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => setUseMagicLink(true)}
            >
              Sign in with magic link instead →
            </button>
          </form>
        )}

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
