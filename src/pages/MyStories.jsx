import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiPencil, HiTrash, HiEye, HiPlus } from 'react-icons/hi';

const MyStories = () => {
  const { status } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusMap = {
    drafts: 'draft',
    scheduled: 'scheduled',
    published: 'published',
    unlisted: 'unlisted',
    submissions: 'submission',
  };

  const statusLabels = {
    drafts: 'Drafts',
    scheduled: 'Scheduled',
    published: 'Published',
    unlisted: 'Unlisted',
    submissions: 'Submissions',
  };

  useEffect(() => {
    fetchStories();
  }, [status]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const queryStatus = statusMap[status] || 'published';
      const { data } = await api.get(`/stories/user/me?status=${queryStatus}`);
      setStories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await api.delete(`/stories/${id}`);
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast.success('Story deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/stories/${id}`, { status: newStatus });
      fetchStories();
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const tabs = ['drafts', 'scheduled', 'published', 'unlisted', 'submissions'];

  return (
    <div className="page-container-wide">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Stories</h1>
          <p className="page-subtitle">Manage all your literary creations</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/write')}>
          <HiPlus /> New Story
        </button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${status === tab ? 'active' : ''}`}
            onClick={() => navigate(`/stories/${tab}`)}
          >
            {statusLabels[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No {statusLabels[status]?.toLowerCase()} stories</div>
          <div className="empty-state-text">
            {status === 'drafts'
              ? 'Start writing a new story to save it as a draft'
              : `You don't have any ${statusLabels[status]?.toLowerCase()} stories yet`}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="stories-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story._id}>
                  <td>
                    <div className="story-table-title">{story.title}</div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {story.category?.replace('-', ' ')}
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {formatDate(story.updatedAt)}
                  </td>
                  <td>{story.views}</td>
                  <td>{story.likes?.length || 0}</td>
                  <td>
                    <span className={`story-table-status status-${story.status}`}>
                      {story.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/story/${story._id}`)}
                        title="View"
                      >
                        <HiEye />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/write?edit=${story._id}`)}
                        title="Edit"
                      >
                        <HiPencil />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(story._id)}
                        title="Delete"
                        style={{ color: 'var(--danger)' }}
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyStories;
