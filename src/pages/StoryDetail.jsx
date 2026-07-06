import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  HiHeart,
  HiOutlineHeart,
  HiChat,
  HiShare,
  HiBookmark,
  HiOutlineBookmark,
  HiPencil,
  HiTrash,
} from 'react-icons/hi';
import DOMPurify from 'dompurify';

const StoryDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchStory();
    fetchComments();
  }, [id]);

  const fetchStory = async () => {
    try {
      const { data } = await api.get(`/stories/${id}`);
      setStory(data);
      setLiked(data.likes?.includes(user?._id));
      setLikesCount(data.likes?.length || 0);
      setIsFollowing(user?.following?.includes(data.author?._id));

      if (user) {
        const savedRes = await api.get(`/saved/check/${id}`);
        setSaved(savedRes.data.saved);
      }
    } catch (err) {
      toast.error('Story not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/${id}`);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put(`/stories/${id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/saved/${id}`);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put(`/auth/follow/${story.author._id}`);
      setIsFollowing(data.following);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) return navigate('/login');
    try {
      await api.post(`/comments/${id}`, { text: commentText });
      setCommentText('');
      fetchComments();
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await api.delete(`/stories/${id}`);
      toast.success('Story deleted');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="story-detail">
      {story.coverImage && (
        <img src={story.coverImage} alt={story.title} className="story-detail-cover" />
      )}

      <h1 className="story-detail-title">{story.title}</h1>

      <div className="story-detail-meta">
        {story.author?.profilePic ? (
          <img
            src={story.author.profilePic}
            alt={story.author.name}
            className="story-detail-author-pic"
            onClick={() => navigate(`/user/${story.author.username}`)}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div
            className="story-detail-author-pic"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.2rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/user/${story.author.username}`)}
          >
            {story.author?.name?.[0]}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div className="story-detail-author-name">{story.author?.name}</div>
          <div className="story-detail-date">
            {formatDate(story.createdAt)} · {story.readTime} min read · {story.views} views
          </div>
        </div>
        {user && user._id !== story.author?._id && (
          <button
            className={`btn ${isFollowing ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={handleFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
        {user && user._id === story.author?._id && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/write?edit=${story._id}`)}
            >
              <HiPencil /> Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              <HiTrash /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="story-card-tags" style={{ marginBottom: 24 }}>
        <span className="story-tag" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
          {story.form?.replace('_', ' ').toUpperCase()}
        </span>
        <span className="story-tag" style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
          {story.language?.toUpperCase()}
        </span>
        {story.tags?.map((tag, i) => (
          <span key={i} className="story-tag">
            {tag}
          </span>
        ))}
      </div>

      <div 
        className={`story-detail-content ql-editor ${story.language === 'urdu' ? 'urdu-font' : story.language === 'hindi' ? 'hindi-font' : ''}`} 
        dir={story.language === 'urdu' ? 'rtl' : 'ltr'}
        style={{ padding: 0, minHeight: 'auto' }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }} 
      />

      <div className="story-detail-actions">
        <button className={`story-card-action ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? <HiHeart /> : <HiOutlineHeart />}
          <span>{likesCount}</span>
        </button>
        <button className="story-card-action" onClick={() => document.getElementById('comment-input')?.focus()}>
          <HiChat />
          <span>{comments.length}</span>
        </button>
        <button className="story-card-action" onClick={handleShare}>
          <HiShare />
          <span>Share</span>
        </button>
        <div className="story-card-action-spacer" />
        <button className={`story-card-action ${saved ? 'saved' : ''}`} onClick={handleSave}>
          {saved ? <HiBookmark /> : <HiOutlineBookmark />}
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>

        {user && (
          <form className="comment-form" onSubmit={handleComment}>
            {user.profilePic ? (
              <img src={user.profilePic} alt="" className="comment-form-avatar" />
            ) : (
              <div
                className="comment-form-avatar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-tertiary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {user.name?.[0]}
              </div>
            )}
            <div className="comment-form-input-wrap">
              <textarea
                id="comment-input"
                className="comment-form-input"
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Comment
                </button>
              </div>
            </div>
          </form>
        )}

        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="empty-state-text">No comments yet. Start the conversation!</div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              {comment.user?.profilePic ? (
                <img src={comment.user.profilePic} alt="" className="comment-item-avatar" />
              ) : (
                <div
                  className="comment-item-avatar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {comment.user?.name?.[0]}
                </div>
              )}
              <div className="comment-item-body">
                <div className="comment-item-header">
                  <span className="comment-item-name">{comment.user?.name}</span>
                  <span className="comment-item-time">{timeAgo(comment.createdAt)}</span>
                </div>
                <div className="comment-item-text">{comment.text}</div>

                {comment.replies?.length > 0 && (
                  <div style={{ marginTop: 12, paddingLeft: 16 }}>
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="comment-item" style={{ marginBottom: 12 }}>
                        <div
                          className="comment-item-avatar"
                          style={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-tertiary)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                          }}
                        >
                          {reply.user?.name?.[0]}
                        </div>
                        <div className="comment-item-body">
                          <div className="comment-item-header">
                            <span className="comment-item-name" style={{ fontSize: '0.8rem' }}>{reply.user?.name}</span>
                            <span className="comment-item-time">{timeAgo(reply.createdAt)}</span>
                          </div>
                          <div className="comment-item-text" style={{ fontSize: '0.85rem' }}>{reply.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
