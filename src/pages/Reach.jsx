import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { HiEye, HiHeart, HiUsers, HiDocumentText, HiUserAdd } from 'react-icons/hi';

const Reach = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/stories/analytics/me');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container-wide">
      <div className="page-header">
        <h1 className="page-title">Reach & Analytics</h1>
        <p className="page-subtitle">Track your growth and engagement</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-icon">
            <HiEye />
          </div>
          <div className="analytics-card-value">{analytics?.totalViews || 0}</div>
          <div className="analytics-card-label">Total Views</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            <HiHeart />
          </div>
          <div className="analytics-card-value">{analytics?.totalLikes || 0}</div>
          <div className="analytics-card-label">Total Likes</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            <HiUsers />
          </div>
          <div className="analytics-card-value">{analytics?.totalFollowers || 0}</div>
          <div className="analytics-card-label">Followers</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            <HiUserAdd />
          </div>
          <div className="analytics-card-value">{analytics?.totalFollowing || 0}</div>
          <div className="analytics-card-label">Following</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            <HiDocumentText />
          </div>
          <div className="analytics-card-value">{analytics?.totalStories || 0}</div>
          <div className="analytics-card-label">Published Stories</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
          Top Performing Stories
        </h2>

        {analytics?.topStories?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="stories-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Views</th>
                  <th>Likes</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topStories.map((story) => (
                  <tr key={story._id}>
                    <td>
                      <div className="story-table-title">{story.title}</div>
                    </td>
                    <td>{story.views}</td>
                    <td>{story.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No data yet</div>
            <div className="empty-state-text">
              Publish some stories to start seeing analytics
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reach;
