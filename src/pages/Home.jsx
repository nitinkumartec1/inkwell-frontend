import { useState, useEffect } from 'react';
import api from '../utils/api';
import StoryCard from '../components/StoryCard';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeForm, setActiveForm] = useState('all');
  const [activeLanguage, setActiveLanguage] = useState('all');
  const [sort, setSort] = useState('latest');

  const forms = [
    { value: 'all', label: 'All Forms' },
    { value: 'shayari', label: 'Shayari' },
    { value: 'ghazal', label: 'Ghazal' },
    { value: 'nazm', label: 'Nazm' },
    { value: 'poetry', label: 'Poetry' },
    { value: 'short_story', label: 'Short Story' },
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'urdu', label: 'Urdu' },
  ];

  useEffect(() => {
    fetchStories();
  }, [page, activeForm, activeLanguage, sort]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      let url = `/stories?page=${page}&limit=12`;
      if (activeForm !== 'all') url += `&form=${activeForm}`;
      if (activeLanguage !== 'all') url += `&language=${activeLanguage}`;
      if (sort === 'popular') url += '&sort=popular';
      if (sort === 'most-liked') url += '&sort=most-liked';

      const { data } = await api.get(url);
      setStories(data.stories);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-wide">
      <div className="page-header">
        <h1 className="page-title">Discover Stories</h1>
        <p className="page-subtitle">Explore poems, prose, and stories from writers around the world</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="tabs desktop-only" style={{ borderBottom: 'none', marginBottom: 0 }}>
          {forms.map((f) => (
            <button
              key={f.value}
              className={`tab ${activeForm === f.value ? 'active' : ''}`}
              onClick={() => { setActiveForm(f.value); setPage(1); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="form-input form-select mobile-only"
            style={{ width: 'auto', padding: '8px 40px 8px 14px', fontSize: '0.825rem' }}
            value={activeForm}
            onChange={(e) => { setActiveForm(e.target.value); setPage(1); }}
          >
            {forms.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', padding: '8px 40px 8px 14px', fontSize: '0.825rem' }}
            value={activeLanguage}
            onChange={(e) => { setActiveLanguage(e.target.value); setPage(1); }}
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', padding: '8px 40px 8px 14px', fontSize: '0.825rem' }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Viewed</option>
            <option value="most-liked">Most Liked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No stories yet</div>
          <div className="empty-state-text">
            Be the first to share your words with the world
          </div>
        </div>
      ) : (
        <>
          <div className="story-grid">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
