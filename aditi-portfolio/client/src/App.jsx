import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Github,
  Linkedin,
  Mail,
  Search,
  X,
  Menu,
  Code2,
  PenTool,
  Heart,
  Sparkles,
  Play,
  Pause,
  Check,
  Loader2,
  RotateCw,
  Plus,
} from 'lucide-react';
import { profile, categories } from './lib/profile.js';
import { api, safeUrl } from './lib/api.js';
import { useProjects } from './hooks/useProjects.js';
import ProjectArt from './components/ProjectArt.jsx';
import ProjectModal from './components/ProjectModal.jsx';
const Playground = lazy(() => import('./components/Playground.jsx'));
const Admin = lazy(() => import('./components/Admin.jsx'));

function Star({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M50 0l8 31 28-17-17 28 31 8-31 8 17 28-28-17-8 31-8-31-28 17 17-28L0 50l31-8-17-28 28 17z" />
    </svg>
  );
}
function useMotion() {
  const [motion, setMotion] = useState(() => {
    try {
      const saved = localStorage.getItem('aditi-motion');
      return saved !== null
        ? saved === 'true'
        : !matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    try {
      localStorage.setItem('aditi-motion', String(motion));
    } catch {}
  }, [motion]);
  return [motion, setMotion];
}
function Header() {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    document.querySelectorAll('main section[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="nav-container">
        <a className="logo" href="#top" aria-label="Aditi Tomar, back to top">
          <Star />
          <span>
            {profile.name.toLowerCase()}
            <span className="logo-dot">.</span>
          </span>
        </a>
        <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {[
            ['work', 'Work'],
            ['about', 'About'],
            ['toolkit', 'Toolkit'],
          ].map(([id, label]) => (
            <a
              className={active === id ? 'active' : ''}
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
            >
              {label}
              <span />
            </a>
          ))}
          <a href="#contact" className="mobile-contact" onClick={() => setOpen(false)}>
            Let’s talk <ArrowUpRight size={17} />
          </a>
        </nav>
        <a className="nav-cta" href="#contact">
          Let’s talk <ArrowUpRight size={17} />
        </a>
        <button
          className="mobile-menu icon-button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Hero({ onPlay, motion }) {
  const visual = useRef(null);
  const move = (e) => {
    if (!motion || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    visual.current?.style.setProperty(
      '--tilt-x',
      `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`,
    );
    visual.current?.style.setProperty(
      '--tilt-y',
      `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`,
    );
  };
  const reset = () => {
    visual.current?.style.setProperty('--tilt-x', '0deg');
    visual.current?.style.setProperty('--tilt-y', '0deg');
  };
  return (
    <section className="hero container" id="top">
      <div className="hero-copy">
        <div className="availability">
          <span />
          <span>{profile.availability}</span>
          <ArrowUpRight size={13} />
        </div>
        <h1>
          Hi, I’m {profile.firstName}.<br />I make ideas
          <br />
          <em>
            come alive<span className="pink-period">.</span>
            <svg viewBox="0 0 430 18" aria-hidden="true">
              <path
                d="M6 12Q185-2 424 9M35 16Q225 7 392 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </em>
        </h1>
        <p>{profile.intro}</p>
        <div className="hero-roles">
          {profile.roles.map((role) => (
            <span key={role}>{role}</span>
          ))}
          <span className="role-more">& a little more</span>
        </div>
        <div className="hero-actions">
          <a className="button button-dark" href="#work">
            Explore my work <ArrowUpRight size={19} />
          </a>
          <a className="text-link" href="#about">
            Meet the mind <ArrowRight size={17} />
          </a>
        </div>
      </div>
      <div className="hero-visual" onPointerMove={move} onPointerLeave={reset} ref={visual}>
        <div className="handwritten hero-note">
          a little logic,
          <br />a lot of imagination.
          <svg viewBox="0 0 100 70" aria-hidden="true">
            <path
              d="M14 5C85 10 95 60 44 57M44 57l13-12M44 57l18 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="hero-art">
          <img
            src="/images/creative-sculpture.webp"
            alt="A playful 3D sculpture with a pink ring, lime sphere, orange cube and lilac sparkle"
            width="1254"
            height="1254"
            fetchPriority="high"
          />
        </div>
        <span className="floating-chip design-chip">
          <PenTool size={13} /> design-minded
        </span>
        <span className="floating-chip curiosity-chip">
          <Sparkles size={14} /> fueled by curiosity
        </span>
        <div className="orbit-badge">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <path id="badge-circle" d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" />
            </defs>
            <text>
              <textPath href="#badge-circle" textLength="216">
                DESIGN · BUILD · CREATE · REPEAT ·{' '}
              </textPath>
            </text>
          </svg>
          <Star />
        </div>
        <button className="playground-launch" onClick={onPlay}>
          <span>
            <Play size={11} fill="currentColor" />
          </span>
          Play in 3D <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="hero-bottom">
        <a href="#work">
          <span className="scroll-circle">
            <ArrowDown size={15} />
          </span>{' '}
          A little scroll. A lot to discover.
        </a>
        <span>CREATIVE BY INSTINCT. CURIOUS BY DEFAULT.</span>
      </div>
    </section>
  );
}
function Marquee() {
  const items = ['Thoughtful design', 'Purposeful code', 'Fresh perspective', 'Endless curiosity'];
  return (
    <div className="marquee" role="region" aria-label={items.join('. ')}>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1, 2].map((repeat) => (
          <div className="marquee-set" key={repeat}>
            {items.map((item) => (
              <span key={item}>
                {item}
                <Star />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
function Work({ onProject }) {
  const { projects, loading, error, source, reload } = useProjects();
  const [category, setCategory] = useState('all'),
    [query, setQuery] = useState(''),
    [searchOpen, setSearchOpen] = useState(false);
  const catList = Object.keys(categories).filter((cat) => projects.some((p) => p.category === cat));
  const shown = projects.filter(
    (p) =>
      (category === 'all' || p.category === category) &&
      `${p.title} ${p.summary} ${p.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="work-section container section" id="work">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            01 / SELECTED WORK
          </span>
          <h2>
            Proof of <em>curiosity.</em>
            <Star />
          </h2>
        </div>
        <p>
          Ideas explored. Challenges solved.
          <br />A few things I’ve brought to life.
        </p>
      </div>
      <div className="work-toolbar">
        <div className="filters" aria-label="Filter projects">
          <button
            className={category === 'all' ? 'selected' : ''}
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
          >
            All work <span>{String(projects.length).padStart(2, '0')}</span>
          </button>
          {catList.map((cat) => (
            <button
              key={cat}
              className={category === cat ? 'selected' : ''}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {categories[cat]}
              <span>
                {String(projects.filter((p) => p.category === cat).length).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
        <div className="work-search">
          {searchOpen && (
            <input
              aria-label="Search projects by title or technology"
              placeholder="Find a project or tech…"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <button
            className="icon-button"
            aria-label={searchOpen ? 'Close search' : 'Search projects'}
            onClick={() => {
              setSearchOpen(!searchOpen);
              setQuery('');
            }}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="data-note" role="status">
          Showing saved project previews while the live API reconnects.{' '}
          <button onClick={reload}>
            <RotateCw size={12} /> Retry
          </button>
        </div>
      )}
      <div className="projects-grid" aria-busy={loading}>
        {shown.map((project, index) => (
          <article
            className={`project-card ${shown.length % 2 !== 0 && index === shown.length - 1 && shown.length > 1 ? 'project-wide' : ''}`}
            key={project._id || project.slug}
          >
            <button
              className="project-image-button"
              aria-label={`View ${project.title} project details`}
              onClick={() => onProject(project, projects.indexOf(project))}
            >
              <ProjectArt project={project} index={projects.indexOf(project)} />
              <span className="project-open">
                <ArrowUpRight size={23} />
              </span>
              {project.featured && (
                <span className="featured-label">
                  <Star /> FEATURED
                </span>
              )}
            </button>
            <div className="project-card-content">
              <div className="project-meta">
                <span>{categories[project.category] || 'Project'}</span>
                <span>0{projects.indexOf(project) + 1}</span>
              </div>
              <button
                className="project-title"
                onClick={() => onProject(project, projects.indexOf(project))}
              >
                <h3>{project.title}</h3>
                <ArrowUpRight size={23} />
              </button>
              <p>{project.summary}</p>
              <div className="stack-tags">
                {project.stack.slice(0, 4).map((tech, i) => (
                  <span key={i}>{tech}</span>
                ))}
                {project.stack.length > 4 && <span>+{project.stack.length - 4}</span>}
              </div>
              {shown.length % 2 !== 0 && index === shown.length - 1 && shown.length > 1 && (
                <button
                  className="text-link"
                  onClick={() => onProject(project, projects.indexOf(project))}
                >
                  Take a closer look <ArrowRight size={17} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!shown.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>{projects.length ? 'Nothing here just yet.' : 'The next idea is on its way.'}</h3>
          <p>
            {projects.length
              ? 'Try a different technology or explore all the work.'
              : 'New projects will appear here when they’re added to the portfolio.'}
          </p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
          >
            Reset filters <RotateCw size={16} />
          </button>
        </div>
      )}
      <div className="work-footer">
        <span>
          <span className="tiny-dot" />
          {shown.length} {shown.length === 1 ? 'project' : 'projects'} · Built with care, shared
          with pride.
        </span>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          There’s more on GitHub <Github size={16} />
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
function About({ setInterest }) {
  return (
    <section className="about-section section" id="about">
      <div className="container">
        <div className="about-layout">
          <div className="about-poster">
            <div className="poster-top">
              <span>A LITTLE INTRODUCTION</span>
              <span>↗</span>
            </div>
            <div className="poster-title">
              more than
              <br />
              <em>a title.</em>
            </div>
            <Star className="poster-star" />
            <div className="smiley">
              <span />
              <span />
              <svg viewBox="0 0 80 40">
                <path
                  d="M8 6Q40 50 72 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="poster-label">
              Designer’s eye.
              <br />
              Builder’s mind.
              <br />
              Human, first.
            </div>
            <div className="poster-bottom">
              <span>{profile.name.toUpperCase()}</span>
              <span>EST. CURIOUS</span>
            </div>
            <span className="poster-tape">WORK IN PROGRESS. ALWAYS.</span>
          </div>
          <div className="about-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              02 / A LITTLE ABOUT ME
            </span>
            <h2>
              I don’t fit in one box.
              <br />
              <em>That’s my thing.</em>
            </h2>
            {profile.about.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <div className="values">
              <div>
                <span>01</span>
                <strong>Stay curious.</strong>
              </div>
              <div>
                <span>02</span>
                <strong>Make it clear.</strong>
              </div>
              <div>
                <span>03</span>
                <strong>Keep learning.</strong>
              </div>
            </div>
            <a className="text-link" href="#contact">
              Let’s see what we can create <ArrowUpRight size={17} />
            </a>
            {profile.resumeUrl && (
              <a
                className="text-link resume-link"
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View my résumé <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </div>
        <div className="opportunity-strip">
          <div>
            <span className="tiny-dot" />
            <span>A fresh perspective for your team.</span>
          </div>
          <div>
            {['Frontend development', 'UI / UX', 'Graphic design', 'Creative & tech roles'].map(
              (role) => (
                <a href="#contact" key={role} onClick={() => setInterest(role)}>
                  {role}
                  <ArrowUpRight size={13} />
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function Toolkit() {
  const [selected, setSelected] = useState('all');
  const cards = [
    {
      id: 'build',
      className: 'toolkit-build',
      number: '01',
      icon: Code2,
      label: 'THE TECHNICAL SIDE',
      title: 'Build things.',
      summary: 'From thoughtful interfaces to the systems behind them.',
      skills: profile.technicalSkills,
      foot: 'Turning “what if” into something that works.',
    },
    {
      id: 'design',
      className: 'toolkit-design',
      number: '02',
      icon: PenTool,
      label: 'THE CREATIVE INTERESTS',
      title: 'Think visually.',
      summary: 'Exploring the space where clarity and creativity meet.',
      skills: profile.designInterests,
      foot: 'Learning the language of thoughtful design.',
    },
    {
      id: 'human',
      className: 'toolkit-human',
      number: '03',
      icon: Heart,
      label: 'THE HUMAN SIDE',
      title: 'Stay human.',
      summary: 'The non-technical strengths I want to bring to a team.',
      skills: profile.professionalSkills,
      foot: 'Good work starts with how we work together.',
    },
  ];
  return (
    <section className="toolkit-section container section" id="toolkit">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            03 / MY TOOLKIT
          </span>
          <h2>
            A toolkit. <em>Not a box.</em>
          </h2>
        </div>
        <p>
          Technology, creative interests, and people skills.
          <br />
          Different sides. One curious person.
        </p>
      </div>
      <div className="toolkit-tabs" aria-label="Explore toolkit categories">
        {[
          ['all', 'The whole picture'],
          ['build', 'Build'],
          ['design', 'Design'],
          ['human', 'Human'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={selected === id ? 'active' : ''}
            aria-pressed={selected === id}
            onClick={() => setSelected(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={`toolkit-grid ${selected !== 'all' ? 'toolkit-focused' : ''}`}>
        {cards
          .filter((card) => selected === 'all' || selected === card.id)
          .map((card) => (
            <article className={`toolkit-card ${card.className}`} key={card.id}>
              <div className="toolkit-top">
                <span>
                  {card.number} / {card.label}
                </span>
                <card.icon size={25} strokeWidth={1.5} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <ul>
                {card.skills.map((skill) => (
                  <li key={skill}>
                    <Plus size={13} />
                    {skill}
                  </li>
                ))}
              </ul>
              <div className="toolkit-foot">
                <span>{card.foot}</span>
                <ArrowUpRight size={18} />
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
function Contact({ interest, setInterest }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState(''),
    [database, setDatabase] = useState('checking');
  useEffect(() => {
    let alive = true;
    api('/health')
      .then((data) => {
        if (alive) setDatabase(data.database);
      })
      .catch(() => {
        if (alive) setDatabase('unavailable');
      });
    return () => {
      alive = false;
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify({ ...form, interest }) });
      setSent(true);
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setError(
        err.status === 503 && database === 'demo'
          ? 'This portfolio is in preview mode. Connect MongoDB to enable the inbox, or reach out through GitHub for now.'
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="contact-section section" id="contact">
      <div className="container contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            04 / LET’S CONNECT
          </span>
          <h2>
            Good things start
            <br />
            with a <em>hello.</em>
            <Star />
          </h2>
          <p>
            A role, a collaboration, or an interesting idea?
            <br />
            I’d love to hear what you have in mind.
          </p>
          <div className="contact-availability">
            <span className="tiny-dot" />
            <span>Open to opportunities & new possibilities</span>
          </div>
          <div className="contact-socials">
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              <Github size={19} /> GitHub <ArrowUpRight size={15} />
            </a>
            {safeUrl(profile.linkedin) && (
              <a href={safeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer">
                <Linkedin size={19} /> LinkedIn <ArrowUpRight size={15} />
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <Mail size={19} /> Email <ArrowUpRight size={15} />
              </a>
            )}
          </div>
          <span className="handwritten contact-note">
            Let’s make something
            <br />
            worth caring about.
          </span>
        </div>
        <div className="contact-form-card">
          {sent ? (
            <div className="contact-success" role="status">
              <span>
                <Check size={30} />
              </span>
              <h3>Hello received!</h3>
              <p>Your message is safely in my inbox. Thank you for starting the conversation.</p>
              <button className="button button-dark" onClick={() => setSent(false)}>
                Send another message <ArrowUpRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="What should I call you?"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@somewhere.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
              </div>
              <label>
                What brings you here?
                <select
                  aria-label="What brings you here?"
                  name="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                >
                  {[
                    'A role or opportunity',
                    'Frontend development',
                    'UI / UX',
                    'Graphic design',
                    'Creative & tech roles',
                    'A collaboration',
                    'Just saying hello',
                  ].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                A little about your idea
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  placeholder="Tell me a little about the role, project, or possibility…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Leave this field blank
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </label>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button button-dark contact-submit" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 size={18} className="spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send a hello <ArrowUpRight size={18} />
                  </>
                )}
              </button>
              <p className="form-note">
                {database === 'demo'
                  ? 'Preview mode · The inbox goes live once MongoDB is connected.'
                  : database === 'unavailable'
                    ? 'Inbox temporarily unavailable. You can find me on GitHub.'
                    : 'Your details are only used to reply to your message.'}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
function Footer({ motion, setMotion }) {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <a className="logo" href="#top">
          <Star />
          <span>
            {profile.name.toLowerCase()}
            <span className="logo-dot">.</span>
          </span>
        </a>
        <span>
          Design. Build. <em>Make it matter.</em>
        </span>
        <a className="back-top" href="#top">
          Back to top <ArrowUp size={16} />
        </a>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {profile.name}. Made with intention.
        </span>
        <div>
          <span>{profile.location}</span>
          <button
            onClick={() => setMotion(!motion)}
            aria-pressed={motion}
            aria-label={motion ? 'Turn animation off' : 'Turn animation on'}
          >
            {motion ? <Pause size={12} /> : <Play size={12} />} Motion {motion ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </footer>
  );
}
export default function App() {
  const [motion, setMotion] = useMotion();
  const [project, setProject] = useState(null),
    [play, setPlay] = useState(false),
    [interest, setInterest] = useState('A role or opportunity');
  if (window.location.pathname.replace(/\/$/, '') === '/studio')
    return (
      <Suspense
        fallback={
          <div className="page-loader">
            <Loader2 className="spin" /> Opening the studio…
          </div>
        }
      >
        <Admin />
      </Suspense>
    );
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <Header />
      <main>
        <Hero onPlay={() => setPlay(true)} motion={motion} />
        <Marquee />
        <Work onProject={(p, index) => setProject({ item: p, index })} />
        <About setInterest={setInterest} />
        <Toolkit />
        <Contact interest={interest} setInterest={setInterest} />
      </main>
      <Footer motion={motion} setMotion={setMotion} />
      {project && (
        <ProjectModal
          project={project.item}
          index={project.index}
          onClose={() => setProject(null)}
        />
      )}{' '}
      {play && (
        <Suspense
          fallback={
            <div className="loading-overlay" role="status">
              <Loader2 className="spin" /> Loading the playground…
            </div>
          }
        >
          <Playground motion={motion} onClose={() => setPlay(false)} />
        </Suspense>
      )}
    </>
  );
}
