import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiHeart,
  HiOutlineHeart,
  HiChat,
  HiShare,
  HiBookmark,
  HiOutlineBookmark,
} from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

import DOMPurify from 'dompurify';

const StoryCard = ({ story, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(story.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(story.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(
    user?.following?.includes(story.author?._id)
  );

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put(`/stories/${story._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/saved/${story._id}`);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (user._id === story.author?._id) return;
    try {
      const { data } = await api.put(`/auth/follow/${story.author._id}`);
      setIsFollowing(data.following);
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/story/${story._id}`);
    toast.success('Link copied!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    return clean;
  };

  return (
    <div className="story-card" id={`story-card-${story._id}`}>
      {story.coverImage ? (
        <img
          src={story.coverImage}
          alt={story.title}
          className="story-card-image"
          onClick={() => navigate(`/story/${story._id}`)}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <div 
          className="story-card-image-placeholder" 
          onClick={() => navigate(`/story/${story._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '2rem', opacity: 0.1 }}>🖋️</span>
        </div>
      )}

      <div className="story-card-body">
        <div className="story-card-author">
          {story.author?.profilePic ? (
            <img
              src={story.author.profilePic}
              alt={story.author.name}
              className="story-card-author-pic"
              onClick={(e) => { e.stopPropagation(); navigate(`/user/${story.author.username}`); }}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <div
              className="story-card-author-pic"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-tertiary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={(e) => { e.stopPropagation(); navigate(`/user/${story.author.username}`); }}
            >
              {story.author?.name?.[0]}
            </div>
          )}
          <div className="story-card-author-info">
            <div className="story-card-author-name">{story.author?.name}</div>
            <div className="story-card-author-date">
              {formatDate(story.createdAt)} · {story.readTime} min read
            </div>
          </div>
          {user && user._id !== story.author?._id && (
            <button
              className={`story-card-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div
          onClick={() => navigate(`/story/${story._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="story-card-title">{story.title}</h3>
          <p className="story-card-description">
            {story.description || stripHtml(story.content)?.substring(0, 120)}
          </p>
        </div>

        <div className="story-card-tags">
          <span className="story-tag" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
            {story.form?.replace('_', ' ').toUpperCase() || 'POETRY'}
          </span>
          <span className="story-tag" style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
            {story.language?.toUpperCase() || 'ENGLISH'}
          </span>
          {story.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="story-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="story-card-footer">
        <button
          className={`story-card-action ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? <HiHeart /> : <HiOutlineHeart />}
          <span>{likesCount}</span>
        </button>

        <button
          className="story-card-action"
          onClick={(e) => { e.stopPropagation(); navigate(`/story/${story._id}`); }}
        >
          <HiChat />
        </button>

        <button className="story-card-action" onClick={handleShare}>
          <HiShare />
        </button>

        <div className="story-card-action-spacer" />

        <button
          className={`story-card-action ${saved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? <HiBookmark /> : <HiOutlineBookmark />}
        </button>
      </div>
    </div>
  );
};

export default StoryCard;
