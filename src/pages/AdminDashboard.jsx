import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineLogout,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'stories', label: 'Stories' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ users: [], page: 1, pages: 1, total: 0 });
  const [stories, setStories] = useState({ stories: [], page: 1, pages: 1, total: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [storySearch, setStorySearch] = useState('');
  const [storyStatus, setStoryStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // ─── Fetch Dashboard Stats ──────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard', authHeaders);
      setStats(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired or access denied');
        navigate('/');
      }
    }
  }, []);

  // ─── Fetch Users ────────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { ...authHeaders, params });
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  }, []);

  // ─── Fetch Stories ──────────────────────────────────────────
  const fetchStories = useCallback(async (page = 1, search = '', status = '') => {
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/admin/stories', { ...authHeaders, params });
      setStories(data);
    } catch (err) {
      toast.error('Failed to load stories');
    }
  }, []);

  // ─── Initial Load ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    load();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1, userSearch);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'stories') fetchStories(1, storySearch, storyStatus);
  }, [activeTab]);

  // ─── Delete Handlers ───────────────────────────────────────
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and ALL their content? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`, authHeaders);
      toast.success('User deleted');
      fetchUsers(users.page, userSearch);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteStory = async (id, title) => {
    if (!window.confirm(`Delete story "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/stories/${id}`, authHeaders);
      toast.success('Story deleted');
      fetchStories(stories.page, storySearch, storyStatus);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ─── Search Handlers ───────────────────────────────────────
  const handleUserSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, userSearch);
  };

  const handleStorySearch = (e) => {
    e.preventDefault();
    fetchStories(1, storySearch, storyStatus);
  };

  const handleStatusChange = (e) => {
    setStoryStatus(e.target.value);
    fetchStories(1, storySearch, e.target.value);
  };

  // ─── Exit Admin ─────────────────────────────────────────────
  const handleExitAdmin = () => {
    navigate('/');
  };

  // ─── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ─── Admin Navbar ─── */}
      <header className="admin-navbar">
        <div className="admin-navbar-brand">
          <HiOutlineShieldCheck className="admin-navbar-icon" />
          <span>InkWell Admin</span>
        </div>
        <button className="admin-logout-btn" onClick={handleExitAdmin}>
          <HiOutlineArrowLeft />
          <span>Exit Admin</span>
        </button>
      </header>

      {/* ─── Tabs ─── */}
      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="admin-content">
        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <StatCard icon={<HiOutlineUsers />} label="Total Users" value={stats.totalUsers} color="var(--accent)" />
              <StatCard icon={<HiOutlineDocumentText />} label="Total Stories" value={stats.totalStories} color="#FF6584" />
              <StatCard icon={<HiOutlineEye />} label="Total Views" value={stats.totalViews} color="#4CAF50" />
              <StatCard icon={<HiOutlineHeart />} label="Total Likes" value={stats.totalLikes} color="#FFC107" />
            </div>

            <div className="admin-overview-grid">
              {/* Recent Users */}
              <div className="admin-card">
                <h3 className="admin-card-title">Recent Users</h3>
                <div className="admin-list">
                  {stats.recentUsers?.map((u) => (
                    <div key={u._id} className="admin-list-item">
                      <div className="admin-list-avatar">
                        {u.profilePic ? (
                          <img src={u.profilePic} alt={u.name} />
                        ) : (
                          <span>{u.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="admin-list-info">
                        <span className="admin-list-name">{u.name}</span>
                        <span className="admin-list-meta">@{u.username}</span>
                      </div>
                      <span className="admin-list-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Stories */}
              <div className="admin-card">
                <h3 className="admin-card-title">Recent Stories</h3>
                <div className="admin-list">
                  {stats.recentStories?.map((s) => (
                    <div key={s._id} className="admin-list-item">
                      <div className="admin-list-info" style={{ flex: 1 }}>
                        <span className="admin-list-name">{s.title}</span>
                        <span className="admin-list-meta">
                          by {s.author?.name} · {s.form} · {s.views} views
                        </span>
                      </div>
                      <span className={`admin-status-badge status-${s.status}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Breakdown */}
            {stats.formBreakdown?.length > 0 && (
              <div className="admin-card" style={{ marginTop: 24 }}>
                <h3 className="admin-card-title">Content Breakdown</h3>
                <div className="admin-breakdown">
                  {stats.formBreakdown.map((f) => (
                    <div key={f._id} className="admin-breakdown-item">
                      <span className="admin-breakdown-label">{f._id}</span>
                      <div className="admin-breakdown-bar-wrapper">
                        <div
                          className="admin-breakdown-bar"
                          style={{
                            width: `${Math.max(5, (f.count / stats.totalStories) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="admin-breakdown-count">{f.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <form className="admin-search-bar" onSubmit={handleUserSearch}>
              <HiOutlineSearch />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button type="submit" className="admin-search-btn">Search</button>
            </form>

            <div className="admin-card">
              <div className="admin-table-header">
                <span>{users.total} user{users.total !== 1 ? 's' : ''} found</span>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Followers</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.users?.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="admin-table-user">
                            <div className="admin-table-avatar">
                              {u.profilePic ? (
                                <img src={u.profilePic} alt={u.name} />
                              ) : (
                                <span>{u.name?.charAt(0)?.toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="admin-table-name">{u.name}</div>
                              <div className="admin-table-username">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-role-badge role-${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.followersCount}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              className="admin-action-btn danger"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              title="Delete user"
                            >
                              <HiOutlineTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.pages > 1 && (
                <Pagination
                  page={users.page}
                  pages={users.pages}
                  onPageChange={(p) => fetchUsers(p, userSearch)}
                />
              )}
            </div>
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="admin-stories">
            <div className="admin-stories-controls">
              <form className="admin-search-bar" onSubmit={handleStorySearch}>
                <HiOutlineSearch />
                <input
                  type="text"
                  placeholder="Search stories by title..."
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                />
                <button type="submit" className="admin-search-btn">Search</button>
              </form>

              <select
                className="admin-status-filter"
                value={storyStatus}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="unlisted">Unlisted</option>
                <option value="submission">Submission</option>
              </select>
            </div>

            <div className="admin-card">
              <div className="admin-table-header">
                <span>{stories.total} stor{stories.total !== 1 ? 'ies' : 'y'} found</span>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Form</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stories.stories?.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <span className="admin-table-title">{s.title}</span>
                        </td>
                        <td>
                          <span className="admin-table-username">
                            {s.author?.name || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge status-${s.status}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.form}</td>
                        <td>{s.views}</td>
                        <td>{s.likesCount}</td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-action-btn danger"
                            onClick={() => handleDeleteStory(s._id, s.title)}
                            title="Delete story"
                          >
                            <HiOutlineTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stories.pages > 1 && (
                <Pagination
                  page={stories.page}
                  pages={stories.pages}
                  onPageChange={(p) => fetchStories(p, storySearch, storyStatus)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reusable Components ──────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ color }}>
      {icon}
    </div>
    <div className="admin-stat-info">
      <span className="admin-stat-value">{value?.toLocaleString?.() || 0}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  </div>
);

const Pagination = ({ page, pages, onPageChange }) => (
  <div className="admin-pagination">
    <button
      className="admin-page-btn"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
    >
      <HiOutlineChevronLeft />
    </button>
    <span className="admin-page-info">
      Page {page} of {pages}
    </span>
    <button
      className="admin-page-btn"
      disabled={page >= pages}
      onClick={() => onPageChange(page + 1)}
    >
      <HiOutlineChevronRight />
    </button>
  </div>
);

export default AdminDashboard;
