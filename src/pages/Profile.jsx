import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StoryCard from '../components/StoryCard';
import toast from 'react-hot-toast';
import { HiPencil, HiCamera } from 'react-icons/hi';

const Profile = () => {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [likedStories, setLikedStories] = useState([]);
  const [commentedStories, setCommentedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stories');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '', username: '' });

  useEffect(() => {
    const profileUsername = username || user?.username;
    if (profileUsername) {
      fetchProfile(profileUsername);
    }
  }, [username, user]);

  const fetchProfile = async (uname) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/user/${uname}`);
      setProfile(data);
      setIsOwnProfile(user?._id === data._id);
      setIsFollowing(user?.following?.includes(data._id));
      setEditData({ name: data.name, bio: data.bio || '', username: data.username });

      const storiesRes = await api.get(`/stories/user/${data._id}`);
      setStories(storiesRes.data);

      const likedRes = await api.get(`/stories/user/${data._id}/liked`);
      setLikedStories(likedRes.data);

      const commentedRes = await api.get(`/stories/user/${data._id}/commented`);
      setCommentedStories(commentedRes.data);
    } catch (err) {
      toast.error('User not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put(`/auth/follow/${profile._id}`);
      setIsFollowing(data.following);
      setProfile((prev) => ({
        ...prev,
        followers: data.following
          ? [...prev.followers, { _id: user._id }]
          : prev.followers.filter((f) => f._id !== user._id),
      }));
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', editData);
      setProfile(data);
      updateUser(data);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(data);
      updateUser(data);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page-container-wide">
      <div className="profile-header">
        <div style={{ position: 'relative' }}>
          {profile.profilePic ? (
            <img src={profile.profilePic} alt={profile.name} className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">
              {profile.name?.[0]?.toUpperCase()}
            </div>
          )}
          {isOwnProfile && (
            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <HiCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePic}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div className="profile-info" style={{ flex: 1 }}>
          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <input
                  className="form-input"
                  placeholder="Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <input
                  className="form-input"
                  placeholder="Username"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value.toLowerCase() })}
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-input"
                  placeholder="Bio"
                  rows={3}
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2>{profile.name}</h2>
              <div className="username">@{profile.username}</div>
              {profile.bio && <div className="bio">{profile.bio}</div>}

              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-stat-value">{stories.length}</div>
                  <div className="profile-stat-label">Stories</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">{profile.followers?.length || 0}</div>
                  <div className="profile-stat-label">Followers</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">{profile.following?.length || 0}</div>
                  <div className="profile-stat-label">Following</div>
                </div>
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <div>
            {isOwnProfile ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                <HiPencil /> Edit Profile
              </button>
            ) : (
              <button
                className={`btn ${isFollowing ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          Stories
        </button>
        <button
          className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked
        </button>
        <button
          className={`tab ${activeTab === 'commented' ? 'active' : ''}`}
          onClick={() => setActiveTab('commented')}
        >
          Commented
        </button>
      </div>

      {activeTab === 'stories' && (
        stories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✍️</div>
            <div className="empty-state-title">No stories published yet</div>
            <div className="empty-state-text">
              {isOwnProfile
                ? "Start writing your first story!"
                : "This writer hasn't published anything yet."}
            </div>
          </div>
        ) : (
          <div className="story-grid">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )
      )}

      {activeTab === 'liked' && (
        likedStories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❤️</div>
            <div className="empty-state-title">No liked stories</div>
            <div className="empty-state-text">
              {isOwnProfile
                ? "You haven't liked any stories yet."
                : "This writer hasn't liked any stories yet."}
            </div>
          </div>
        ) : (
          <div className="story-grid">
            {likedStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )
      )}

      {activeTab === 'commented' && (
        commentedStories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">No commented stories</div>
            <div className="empty-state-text">
              {isOwnProfile
                ? "You haven't commented on any stories yet."
                : "This writer hasn't commented on any stories yet."}
            </div>
          </div>
        ) : (
          <div className="story-grid">
            {commentedStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
