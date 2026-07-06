import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StoryCard from '../components/StoryCard';
import toast from 'react-hot-toast';
import { HiPlus, HiFolder } from 'react-icons/hi';

const Saved = () => {
  const { user } = useAuth();
  const [savedStories, setSavedStories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchFolders();
    fetchSaved();
  }, [activeFolder]);

  const fetchFolders = async () => {
    try {
      const { data } = await api.get('/saved/folders');
      setFolders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSaved = async () => {
    setLoading(true);
    try {
      let url = '/saved';
      if (activeFolder !== 'All') url += `?folder=${activeFolder}`;
      const { data } = await api.get(url);
      setSavedStories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setShowCreateFolder(false);
    setActiveFolder(newFolderName.trim());
    setNewFolderName('');
    toast.success(`Folder "${newFolderName.trim()}" created`);
  };

  return (
    <div className="page-container-wide">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Saved Stories</h1>
          <p className="page-subtitle">Your bookmarked reads, organized by collection</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateFolder(true)}>
          <HiPlus /> New Folder
        </button>
      </div>

      {showCreateFolder && (
        <div className="modal-overlay" onClick={() => setShowCreateFolder(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create Collection</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="form-group">
                <label className="form-label">Folder Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Favorites, Poetry"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateFolder(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="folders-grid">
        <div
          className={`folder-card ${activeFolder === 'All' ? 'active' : ''}`}
          onClick={() => setActiveFolder('All')}
        >
          <div className="folder-card-name">
            <HiFolder style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            All Saved
          </div>
          <div className="folder-card-count">
            {folders.reduce((sum, f) => sum + f.count, 0)} stories
          </div>
        </div>
        {folders.map((folder) => (
          <div
            key={folder.name}
            className={`folder-card ${activeFolder === folder.name ? 'active' : ''}`}
            onClick={() => setActiveFolder(folder.name)}
          >
            <div className="folder-card-name">
              <HiFolder style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {folder.name}
            </div>
            <div className="folder-card-count">{folder.count} stories</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : savedStories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">No saved stories</div>
          <div className="empty-state-text">
            Save stories to read later by clicking the bookmark icon
          </div>
        </div>
      ) : (
        <div className="story-grid">
          {savedStories.map((item) => (
            <StoryCard key={item._id} story={item.story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
