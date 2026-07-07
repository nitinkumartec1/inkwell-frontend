import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiSearch,
  HiPencilAlt,
  HiBell,
  HiMenu,
  HiLogout,
  HiUser,
  HiShieldCheck,
} from 'react-icons/hi';
import api from '../utils/api';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], stories: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/auth/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowSearch(false);
      return;
    }
    try {
      const [usersRes, storiesRes] = await Promise.all([
        api.get(`/auth/search?q=${query}`),
        api.get(`/stories/search?q=${query}`),
      ]);
      setSearchResults({ users: usersRes.data, stories: storiesRes.data });
      setShowSearch(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.put('/auth/notifications/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-left-section">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <HiMenu />
        </button>
        <div className="navbar-logo-mobile" onClick={() => navigate('/')}>
          Ink<span style={{ fontStyle: 'italic', opacity: 0.6 }}>Well</span>
        </div>
      </div>

      <div className="navbar-center-section" ref={searchRef}>
        <div className="navbar-search">
          <HiSearch />
          <input
            type="text"
            placeholder="Search stories, writers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            id="search-input"
          />
        </div>

        {showSearch && (searchResults.users.length > 0 || searchResults.stories.length > 0) && (
          <div className="search-dropdown">
            {searchResults.users.length > 0 && (
              <>
                <div style={{ padding: '10px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Writers
                </div>
                {searchResults.users.map((u) => (
                  <div
                    key={u._id}
                    className="search-result-item"
                    onClick={() => {
                      navigate(`/user/${u.username}`);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    {u.profilePic ? (
                      <img src={u.profilePic} alt="" className="search-result-avatar" />
                    ) : (
                      <div className="search-result-avatar" style={{ background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                        {u.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="search-result-name">{u.name}</div>
                      <div className="search-result-username">@{u.username}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {searchResults.stories.length > 0 && (
              <>
                <div style={{ padding: '10px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Stories
                </div>
                {searchResults.stories.map((s) => (
                  <div
                    key={s._id}
                    className="search-result-item"
                    onClick={() => {
                      navigate(`/story/${s._id}`);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    <div>
                      <div className="search-result-name">{s.title}</div>
                      <div className="search-result-username">by {s.author?.name}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right-section navbar-actions">
        {user ? (
          <>
            <button
              className="navbar-btn"
              onClick={() => navigate('/write')}
              title="Write a story"
              id="write-btn"
            >
              <HiPencilAlt />
            </button>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="navbar-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) handleMarkRead();
                }}
                id="notifications-btn"
              >
                <HiBell />
                {unreadCount > 0 && <span className="badge" />}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={handleMarkRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((n, i) => (
                      <div key={i} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                        {n.from?.profilePic ? (
                          <img src={n.from.profilePic} alt="" className="notification-item-avatar" />
                        ) : (
                          <div className="notification-item-avatar" style={{ background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                            {n.from?.name?.[0] || '?'}
                          </div>
                        )}
                        <div>
                          <div className="notification-item-text">{n.message}</div>
                          <div className="notification-item-time">{timeAgo(n.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }} ref={profileRef}>
              <div
                className="navbar-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="profile-avatar"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>
                )}
              </div>

              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 200,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      @{user.username}
                    </div>
                  </div>
                  <div
                    style={{ padding: '8px' }}
                  >
                    <button
                      className="sidebar-link"
                      style={{ width: '100%' }}
                      onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                    >
                      <HiUser style={{ fontSize: '1rem' }} />
                      Profile
                    </button>
                    {user.role === 'admin' && (
                      <button
                        className="sidebar-link"
                        style={{ width: '100%', color: 'var(--accent)' }}
                        onClick={() => { navigate('/admin'); setShowProfileMenu(false); }}
                      >
                        <HiShieldCheck style={{ fontSize: '1rem' }} />
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      className="sidebar-link"
                      style={{ width: '100%', color: 'var(--danger)' }}
                      onClick={() => { logout(); navigate('/login'); setShowProfileMenu(false); }}
                    >
                      <HiLogout style={{ fontSize: '1rem' }} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
