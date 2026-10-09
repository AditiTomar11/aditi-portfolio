import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Inbox,
  FolderKanban,
  LockKeyhole,
  Loader2,
  Check,
  Circle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import Modal from './Modal.jsx';
import { api } from '../lib/api.js';
import { categories } from '../lib/profile.js';
const blank = {
  title: '',
  slug: '',
  summary: '',
  highlights: '',
  stack: '',
  category: 'fullstack',
  liveUrl: '',
  repoUrl: '',
  imageUrl: '',
  featured: false,
  order: 1,
};
export default function Admin() {
  const [token, setToken] = useState(() =>
    (() => {
      try {
        return sessionStorage.getItem('aditi-admin-token') || '';
      } catch {
        return '';
      }
    })(),
  );
  const [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [health, setHealth] = useState(null),
    [tab, setTab] = useState('projects'),
    [projects, setProjects] = useState([]),
    [messages, setMessages] = useState([]);
  const [edit, setEdit] = useState(null),
    [confirm, setConfirm] = useState(null);
  const connected = health?.database === 'connected';
  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('aditi-admin-token');
    } catch {}
    setToken('');
    setMessages([]);
    setError('');
  }, []);
  const request = useCallback(
    async (endpoint, options = {}) => {
      try {
        return await api(endpoint, {
          ...options,
          headers: { Authorization: `Bearer ${token}`, ...options.headers },
        });
      } catch (err) {
        if (err.status === 401) logout();
        throw err;
      }
    },
    [token, logout],
  );
  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const h = await api('/health');
      setHealth(h);
      if (token) {
        await request('/admin/me');
        const p = await request('/projects');
        setProjects(p.projects || []);
        if (h.database === 'connected') {
          const m = await request('/admin/messages');
          setMessages(m.messages);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [token, request]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const login = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      try {
        sessionStorage.setItem('aditi-admin-token', data.token);
      } catch {}
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = {
        ...edit,
        stack: edit.stack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        highlights: edit.highlights
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        order: Number(edit.order),
      };
      const updating = !!body._id;
      delete body._id;
      await request(updating ? `/admin/projects/${edit._id}` : '/admin/projects', {
        method: updating ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setEdit(null);
      setNotice(
        updating
          ? 'Project updated. The portfolio is now up to date.'
          : 'Project added to your portfolio.',
      );
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await request(`/admin/${confirm.type}/${confirm.id}`, { method: 'DELETE' });
      setNotice(`${confirm.type === 'projects' ? 'Project' : 'Message'} deleted.`);
      setConfirm(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const mark = async (item) => {
    try {
      const data = await request(`/admin/messages/${item._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: !item.read }),
      });
      setMessages((items) => items.map((m) => (m._id === item._id ? data.message : m)));
    } catch (err) {
      setError(err.message);
    }
  };
  const editProject = (project) => {
    setError('');
    setEdit({
      ...blank,
      ...project,
      highlights: project.highlights.join('\n'),
      stack: project.stack.join(', '),
    });
  };
  return (
    <div className="admin-page">
      <header className="admin-header">
        <a href="/" className="logo">
          <span className="admin-logo-star">✳</span>
          <span>
            aditi<span className="logo-dot">.</span>
            <small> / portfolio studio</small>
          </span>
        </a>
        <div>
          <a className="text-link" href="/">
            View portfolio <ArrowUpRight size={15} />
          </a>
          {token && (
            <button className="button button-outline button-small" onClick={logout}>
              <LogOut size={14} />
              Sign out
            </button>
          )}
        </div>
      </header>
      {!token ? (
        <main className="admin-login">
          <span className="login-icon">
            <LockKeyhole size={28} />
          </span>
          <span className="eyebrow">YOUR WORK, YOUR SPACE</span>
          <h1>
            Hello again, <em>Aditi.</em>
          </h1>
          <p>Manage your projects. Keep the conversation going.</p>
          <form onSubmit={login}>
            <label>
              Studio password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your private admin password"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" type="submit" disabled={busy}>
              {busy ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <>
                  Open the studio <ArrowUpRight size={17} />
                </>
              )}
            </button>
          </form>
          <p className="admin-setup-hint">
            First time here? Set <code>ADMIN_PASSWORD</code> and <code>JWT_SECRET</code> in your
            server’s <code>.env</code>. Admin access is disabled by default.
          </p>
          <a href="/" className="text-link">
            <ArrowLeft size={15} /> Back to the portfolio
          </a>
        </main>
      ) : (
        <main className="admin-content container">
          <div className="admin-title">
            <div>
              <span className="eyebrow">PORTFOLIO STUDIO</span>
              <h1>
                A home for your <em>ideas.</em>
              </h1>
              <p>Your projects and conversations, in one place.</p>
            </div>
            <span className={`database-badge ${connected ? 'connected' : ''}`}>
              <Circle size={9} fill="currentColor" />
              {connected ? 'MongoDB connected' : 'Demo / database unavailable'}
            </span>
          </div>
          {!connected && (
            <div className="admin-alert">
              <AlertCircle size={18} />
              <span>
                Connect MongoDB in <code>.env</code> and restart the server to save projects and
                receive messages. Demo data is read-only.
              </span>
            </div>
          )}
          {notice && (
            <div className="admin-notice" role="status">
              <Check size={17} />
              {notice}
              <button
                className="icon-button"
                aria-label="Dismiss notice"
                onClick={() => setNotice('')}
              >
                ×
              </button>
            </div>
          )}
          {error && !edit && !confirm && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-toolbar">
            <div className="filters">
              <button
                className={tab === 'projects' ? 'selected' : ''}
                onClick={() => setTab('projects')}
              >
                <FolderKanban size={15} />
                Projects <span>{projects.length}</span>
              </button>
              <button
                className={tab === 'messages' ? 'selected' : ''}
                onClick={() => setTab('messages')}
              >
                <Inbox size={15} />
                Inbox <span>{messages.filter((m) => !m.read).length}</span>
              </button>
            </div>
            {tab === 'projects' && (
              <button
                className="button button-dark button-small"
                disabled={!connected || busy}
                onClick={() => {
                  setError('');
                  setEdit({ ...blank, order: projects.length + 1 });
                }}
              >
                <Plus size={16} />
                Add project
              </button>
            )}
          </div>
          {tab === 'projects' ? (
            <div className="admin-project-list">
              {projects.map((project) => (
                <article key={project._id || project.slug}>
                  <span className="admin-project-order">
                    {String(project.order).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>
                      {project.title}
                      {project.featured && <small>Featured</small>}
                    </h3>
                    <p>{project.summary}</p>
                    <span>
                      {categories[project.category]} · {project.stack.join(' / ')}
                    </span>
                  </div>
                  <div className="admin-project-actions">
                    <button
                      className="icon-button"
                      disabled={!connected || busy}
                      aria-label={`Edit ${project.title}`}
                      onClick={() => editProject(project)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-button danger"
                      disabled={!connected || busy}
                      aria-label={`Delete ${project.title}`}
                      onClick={() => {
                        setError('');
                        setConfirm({ type: 'projects', id: project._id, title: project.title });
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
              {!projects.length && (
                <div className="empty-state">
                  <FolderKanban size={30} />
                  <h3>Your next idea starts here.</h3>
                  <p>
                    Add a project or run <code>npm run seed</code> to bring in your five original
                    projects.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-inbox">
              {messages.map((item) => (
                <article key={item._id} className={item.read ? 'message-read' : ''}>
                  <div className="message-heading">
                    <div>
                      <span className="message-avatar">{item.name[0].toUpperCase()}</span>
                      <div>
                        <h3>
                          {item.name}
                          {!item.read && <span className="unread-dot" />}
                        </h3>
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      </div>
                    </div>
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <span className="message-interest">{item.interest}</span>
                  <p className="message-text">{item.message}</p>
                  <div className="message-actions">
                    <a
                      className="text-link"
                      href={`mailto:${item.email}?subject=${encodeURIComponent('Re: ' + item.interest)}`}
                    >
                      Reply via email <ExternalLink size={13} />
                    </a>
                    <button onClick={() => mark(item)}>
                      {item.read ? 'Mark unread' : 'Mark as read'}
                      <Check size={14} />
                    </button>
                    <button
                      className="danger"
                      aria-label={`Delete message from ${item.name}`}
                      onClick={() => {
                        setError('');
                        setConfirm({
                          type: 'messages',
                          id: item._id,
                          title: `message from ${item.name}`,
                        });
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
              {!messages.length && (
                <div className="empty-state">
                  <Inbox size={32} />
                  <h3>No conversations yet.</h3>
                  <p>
                    Messages from your portfolio contact form will arrive here once MongoDB is
                    connected.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      )}
      {edit && (
        <Modal
          title={edit._id ? 'Edit project' : 'Add project'}
          onClose={() => {
            if (!busy) setEdit(null);
          }}
          className="admin-editor"
        >
          <span className="eyebrow">MAKE YOUR WORK SHINE</span>
          <h2>{edit._id ? 'Edit the project.' : 'Add something new.'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <label>
                Project title
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={edit.title}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      title: e.target.value,
                      ...(!edit._id
                        ? {
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, ''),
                          }
                        : {}),
                    })
                  }
                />
              </label>
              <label>
                Slug
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  minLength={2}
                  maxLength={120}
                  value={edit.slug}
                  onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
                />
              </label>
            </div>
            <label>
              Summary
              <textarea
                required
                minLength={10}
                maxLength={700}
                rows={3}
                value={edit.summary}
                onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Category
                <select
                  aria-label="Category"
                  value={edit.category}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                >
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Display order
                <input
                  type="number"
                  min={0}
                  max={9999}
                  required
                  value={edit.order}
                  onChange={(e) => setEdit({ ...edit, order: e.target.value })}
                />
              </label>
            </div>
            <label>
              Toolkit <small>Comma-separated</small>
              <input
                required
                value={edit.stack}
                onChange={(e) => setEdit({ ...edit, stack: e.target.value })}
                placeholder="React, MongoDB, Figma"
              />
            </label>
            <label>
              Highlights <small>One per line</small>
              <textarea
                rows={3}
                value={edit.highlights}
                onChange={(e) => setEdit({ ...edit, highlights: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Live URL <small>Optional</small>
                <input
                  type="url"
                  value={edit.liveUrl}
                  onChange={(e) => setEdit({ ...edit, liveUrl: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label>
                Repository URL <small>Optional</small>
                <input
                  type="url"
                  value={edit.repoUrl}
                  onChange={(e) => setEdit({ ...edit, repoUrl: e.target.value })}
                  placeholder="https://github.com/…"
                />
              </label>
            </div>
            <label>
              Project image URL <small>Optional · defaults to illustrated artwork</small>
              <input
                type="url"
                value={edit.imageUrl}
                onChange={(e) => setEdit({ ...edit, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={edit.featured}
                onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
              />{' '}
              Feature this project
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="editor-actions">
              <button
                className="button button-outline"
                type="button"
                disabled={busy}
                onClick={() => setEdit(null)}
              >
                Cancel
              </button>
              <button className="button button-dark" disabled={busy} type="submit">
                {busy ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <>
                    <Check size={16} />
                    Save project
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && (
        <Modal
          title="Confirm deletion"
          className="confirm-modal"
          onClose={() => {
            if (!busy) setConfirm(null);
          }}
        >
          <span className="login-icon">
            <Trash2 size={25} />
          </span>
          <h2>Let this one go?</h2>
          <p>
            You’re about to delete <strong>{confirm.title}</strong>. This cannot be undone.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="editor-actions">
            <button
              className="button button-outline"
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Keep it
            </button>
            <button className="button button-danger" disabled={busy} onClick={remove}>
              {busy ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete permanently
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
