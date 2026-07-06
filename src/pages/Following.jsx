import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Following = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setFollowingList(data.following || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.put(`/auth/follow/${userId}`);
      setFollowingList((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Unfollowed');
    } catch (err) {
      toast.error('Failed');
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Following</h1>
        <p className="page-subtitle">Writers you're following ({followingList.length})</p>
      </div>

      {followingList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">Not following anyone</div>
          <div className="empty-state-text">
            Discover and follow writers whose stories inspire you
          </div>
        </div>
      ) : (
        followingList.map((person) => (
          <div key={person._id} className="user-list-item">
            {person.profilePic ? (
              <img
                src={person.profilePic}
                alt={person.name}
                className="user-list-avatar"
                onClick={() => navigate(`/user/${person.username}`)}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <div
                className="user-list-avatar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-tertiary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/user/${person.username}`)}
              >
                {person.name?.[0]}
              </div>
            )}
            <div
              className="user-list-info"
              onClick={() => navigate(`/user/${person.username}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-list-name">{person.name}</div>
              <div className="user-list-username">@{person.username}</div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleUnfollow(person._id)}
            >
              Unfollow
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Following;
