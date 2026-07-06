import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiPhotograph, HiEye, HiPencilAlt } from 'react-icons/hi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';

const Write = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [form, setForm] = useState('poetry');
  const [language, setLanguage] = useState('english');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content && editor.isEmpty && content !== '<p></p>') {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('edit');
    if (id) {
      setEditId(id);
      fetchStory(id);
    }
  }, []);

  const fetchStory = async (id) => {
    try {
      const { data } = await api.get(`/stories/${id}`);
      if (data.author._id !== user._id) {
        toast.error('Not authorized');
        return navigate('/');
      }
      setTitle(data.title);
      setDescription(data.description || '');
      setContent(data.content);
      setForm(data.form || 'poetry');
      setLanguage(data.language || 'english');
      setTags(data.tags?.join(', ') || '');
      setStatus(data.status);
      if (data.coverImage) setCoverPreview(data.coverImage);
    } catch (err) {
      toast.error('Failed to load story');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (publishStatus) => {
    if (!title.trim()) return toast.error('Title is required');
    if (!content.trim()) return toast.error('Content is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content', content);
      formData.append('form', form);
      formData.append('language', language);
      formData.append('tags', tags);
      formData.append('status', publishStatus);
      if (coverImage) formData.append('coverImage', coverImage);

      let res;
      if (editId) {
        res = await api.put(`/stories/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Story updated!');
      } else {
        res = await api.post('/stories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(publishStatus === 'published' ? 'Story published!' : 'Draft saved!');
      }

      navigate(`/story/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-page">
      {coverPreview && (
        <img
          src={coverPreview}
          alt="Cover"
          style={{
            width: '100%',
            height: 240,
            objectFit: 'cover',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
          }}
        />
      )}

      <input
        type="text"
        className="editor-title-input"
        placeholder="Your story title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        id="editor-title"
      />

      <textarea
        className="editor-desc-input"
        placeholder="A short description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        id="editor-description"
      />

      {!showPreview && editor ? (
        <div 
          className={`tiptap-container ${language === 'urdu' ? 'urdu-font' : language === 'hindi' ? 'hindi-font' : ''}`}
          dir={language === 'urdu' ? 'rtl' : 'ltr'}
          style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: 24, background: 'var(--bg-card)' }}
        >
          <div className="tiptap-toolbar" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-input)', display: 'flex', gap: 6, flexWrap: 'wrap' }} dir="ltr">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>Italic</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`btn btn-sm ${editor.isActive('heading', { level: 3 }) ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>H3</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>Bullet List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px' }}>Numbered List</button>
          </div>
          <EditorContent editor={editor} className="tiptap-editor-area" />
        </div>
      ) : (
        <div 
          className={`story-detail-content preview-box ${language === 'urdu' ? 'urdu-font' : language === 'hindi' ? 'hindi-font' : ''}`}
          dir={language === 'urdu' ? 'rtl' : 'ltr'}
          style={{ minHeight: '250px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
        />
      )}

      <div className="editor-toolbar">
        <div className="editor-meta">
          <select
            className="form-input form-select"
            style={{ width: 'auto', padding: '8px 40px 8px 14px', fontSize: '0.825rem' }}
            value={form}
            onChange={(e) => setForm(e.target.value)}
          >
            <option value="shayari">Shayari</option>
            <option value="ghazal">Ghazal</option>
            <option value="nazm">Nazm</option>
            <option value="poetry">Poetry</option>
            <option value="short_story">Short Story</option>
          </select>

          <select
            className="form-input form-select"
            style={{ width: 'auto', padding: '8px 40px 8px 14px', fontSize: '0.825rem' }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="urdu">Urdu</option>
          </select>

          <input
            type="text"
            className="form-input"
            placeholder="Tags (comma separated)"
            style={{ width: 200, padding: '8px 14px', fontSize: '0.825rem' }}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <label
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer' }}
          >
            <HiPhotograph />
            Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <><HiPencilAlt /> Edit</> : <><HiEye /> Preview</>}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit('published')}
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Write;
