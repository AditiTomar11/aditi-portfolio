import { ArrowUpRight, Github, Check, Layers } from 'lucide-react';
import Modal from './Modal.jsx';
import ProjectArt from './ProjectArt.jsx';
import { categories } from '../lib/profile.js';
import { safeUrl } from '../lib/api.js';
export default function ProjectModal({ project, index, onClose }) {
  const live = safeUrl(project.liveUrl),
    repo = safeUrl(project.repoUrl);
  return (
    <Modal title={project.title} onClose={onClose} className="project-modal">
      <ProjectArt project={project} index={index} large />
      <div className="project-modal-body">
        <span className="eyebrow">
          <Layers size={13} /> {categories[project.category] || 'Project'}{' '}
          {project.featured && ' / FEATURED'}
        </span>
        <h2>{project.title}</h2>
        <p className="project-summary">{project.summary}</p>
        {!!project.highlights?.length && (
          <>
            <h3>What went into it</h3>
            <ul className="highlight-list">
              {project.highlights.map((text, i) => (
                <li key={i}>
                  <Check size={17} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <h3>The toolkit</h3>
        <div className="stack-tags">
          {project.stack?.map((tech, i) => (
            <span key={i}>{tech}</span>
          ))}
        </div>
        <div className="project-modal-actions">
          {live && (
            <a className="button button-dark" href={live} target="_blank" rel="noopener noreferrer">
              Visit live project <ArrowUpRight size={18} />
            </a>
          )}
          {repo && (
            <a
              className="button button-outline"
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={17} /> Explore the code <ArrowUpRight size={17} />
            </a>
          )}
        </div>
        <p className="fine-print">
          Cover artwork is an illustrative concept. Live links open the actual project.
        </p>
      </div>
    </Modal>
  );
}
