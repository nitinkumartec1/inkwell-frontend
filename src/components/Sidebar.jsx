import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiHome,
  HiBookmark,
  HiUser,
  HiDocument,
  HiChartBar,
  HiUsers,
  HiSun,
  HiMoon,
  HiShieldCheck,
} from 'react-icons/hi';
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineEyeOff,
  HiOutlinePaperAirplane,
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  const handleClick = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>
            Ink<span>Well</span>
          </h1>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div
              className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => handleClick('/')}
              style={{ cursor: 'pointer' }}
            >
              <HiHome />
              <span>Home</span>
            </div>

            {user && (
              <>
                <div
                  className={`sidebar-link ${isActive('/saved') ? 'active' : ''}`}
                  onClick={() => handleClick('/saved')}
                  style={{ cursor: 'pointer' }}
                >
                  <HiBookmark />
                  <span>Saved</span>
                </div>

                <div
                  className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => handleClick('/profile')}
                  style={{ cursor: 'pointer' }}
                >
                  <HiUser />
                  <span>Profile</span>
                </div>
              </>
            )}
          </div>

          {user && (
            <>
              <div className="sidebar-section">
                <div className="sidebar-section-title">Stories</div>
                <div
                  className={`sidebar-link ${location.pathname.startsWith('/stories') ? 'active' : ''}`}
                  onClick={() => handleClick('/stories/published')}
                  style={{ cursor: 'pointer' }}
                >
                  <HiDocument />
                  <span>My Stories</span>
                </div>

                <div className="sidebar-sub-links">
                  <div
                    className={`sidebar-sub-link ${isActive('/stories/drafts') ? 'active' : ''}`}
                    onClick={() => handleClick('/stories/drafts')}
                    style={{ cursor: 'pointer' }}
                  >
                    <HiOutlineDocumentText style={{ display: 'inline', marginRight: 8 }} />
                    Drafts
                  </div>
                  <div
                    className={`sidebar-sub-link ${isActive('/stories/scheduled') ? 'active' : ''}`}
                    onClick={() => handleClick('/stories/scheduled')}
                    style={{ cursor: 'pointer' }}
                  >
                    <HiOutlineClock style={{ display: 'inline', marginRight: 8 }} />
                    Scheduled
                  </div>
                  <div
                    className={`sidebar-sub-link ${isActive('/stories/published') ? 'active' : ''}`}
                    onClick={() => handleClick('/stories/published')}
                    style={{ cursor: 'pointer' }}
                  >
                    <HiOutlineGlobeAlt style={{ display: 'inline', marginRight: 8 }} />
                    Published
                  </div>
                  <div
                    className={`sidebar-sub-link ${isActive('/stories/unlisted') ? 'active' : ''}`}
                    onClick={() => handleClick('/stories/unlisted')}
                    style={{ cursor: 'pointer' }}
                  >
                    <HiOutlineEyeOff style={{ display: 'inline', marginRight: 8 }} />
                    Unlisted
                  </div>
                  <div
                    className={`sidebar-sub-link ${isActive('/stories/submissions') ? 'active' : ''}`}
                    onClick={() => handleClick('/stories/submissions')}
                    style={{ cursor: 'pointer' }}
                  >
                    <HiOutlinePaperAirplane style={{ display: 'inline', marginRight: 8 }} />
                    Submissions
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-section-title">Insights</div>
                <div
                  className={`sidebar-link ${isActive('/reach') ? 'active' : ''}`}
                  onClick={() => handleClick('/reach')}
                  style={{ cursor: 'pointer' }}
                >
                  <HiChartBar />
                  <span>Reach</span>
                </div>
                <div
                  className={`sidebar-link ${isActive('/following') ? 'active' : ''}`}
                  onClick={() => handleClick('/following')}
                  style={{ cursor: 'pointer' }}
                >
                  <HiUsers />
                  <span>Following</span>
                </div>
              </div>
            </>
          )}

          {user?.role === 'admin' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Admin</div>
              <div
                className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => handleClick('/admin')}
                style={{ cursor: 'pointer', color: 'var(--accent)' }}
              >
                <HiShieldCheck />
                <span>Dashboard</span>
              </div>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <HiSun /> : <HiMoon />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`theme-toggle-track ${darkMode ? 'active' : ''}`}>
              <div className="theme-toggle-thumb" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
