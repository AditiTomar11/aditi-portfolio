// Illustrated project covers, not screenshots. No fabricated client results.
export default function ProjectArt({ project, index = 0, large = false }) {
  const variant =
    {
      employeems: 'employee',
      'bhoomi-homestay': 'bhoomi',
      'nitin-hydraulics': 'nitin',
      shopease: 'shop',
      'file-converter-ai': 'file',
    }[project.slug] || 'custom';
  if (project.imageUrl && /^https?:\/\//i.test(project.imageUrl))
    return (
      <div className={`project-art art-custom ${large ? 'large-art' : ''}`}>
        <img
          src={project.imageUrl}
          alt={`${project.title} project preview`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentNode.classList.add('image-failed');
          }}
        />
        <span className="custom-project-title">{project.title}</span>
      </div>
    );
  return (
    <div className={`project-art art-${variant} ${large ? 'large-art' : ''}`} aria-hidden="true">
      <div className="art-caption">
        <span>
          {variant === 'employee'
            ? 'People. Processes. Possibilities.'
            : variant === 'bhoomi'
              ? 'A space to call yours.'
              : variant === 'nitin'
                ? 'Engineering, online.'
                : variant === 'shop'
                  ? 'A smarter way to shop.'
                  : variant === 'file'
                    ? 'Documents, with a dialogue.'
                    : 'An idea brought to life.'}
        </span>
        <span className="art-project-no">0{index + 1}</span>
      </div>
      {variant === 'employee' && (
        <div className="mock-window employee-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>EmployeeMS / dashboard</span>
          </div>
          <div className="employee-content">
            <aside>
              <strong>
                <span className="mini-logo">e</span> EmployeeMS
              </strong>
              <b>▦ &nbsp; Overview</b>
              <span>♙ &nbsp; Employees</span>
              <span>▤ &nbsp; Departments</span>
              <span>◷ &nbsp; Attendance</span>
              <div className="mock-profile">
                <i>AT</i>
                <span>Administrator</span>
              </div>
            </aside>
            <div className="mock-dashboard">
              <div className="mock-heading">
                <div>
                  <small>YOUR WORKSPACE, SIMPLIFIED</small>
                  <h4>Welcome back.</h4>
                </div>
                <span className="avatar-small">A</span>
              </div>
              <div className="mock-stats">
                <div>
                  <small>Team members</small>
                  <strong>
                    128<span>↗</span>
                  </strong>
                </div>
                <div>
                  <small>Departments</small>
                  <strong>
                    08<span>↗</span>
                  </strong>
                </div>
                <div>
                  <small>Attendance</small>
                  <strong>
                    96%<span>↗</span>
                  </strong>
                </div>
              </div>
              <div className="mock-chart">
                <strong>
                  Team overview <small>This month ⌄</small>
                </strong>
                <div className="bars">
                  {[38, 58, 46, 78, 64, 89, 72, 96, 84].map((h, i) => (
                    <i key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="mock-table">
                <b>Recently added</b>
                {['Design team', 'Engineering', 'Operations'].map((label, i) => (
                  <div key={label}>
                    <i style={{ background: ['#efb7cb', '#c4c1ed', '#d1e0a5'][i] }} />
                    <span>{label}</span>
                    <em>Active</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {variant === 'bhoomi' && (
        <div className="mock-window bhoomi-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>bhoomi / find your place</span>
          </div>
          <div className="bhoomi-nav">
            <b>
              bhōomi<span>real estate</span>
            </b>
            <span>Properties &nbsp; About &nbsp; Contact</span>
            <small>Find your home ↗</small>
          </div>
          <div className="bhoomi-hero">
            <div>
              <small>YOUR NEXT CHAPTER STARTS HERE</small>
              <h4>
                Find a place.
                <br />
                Make it <em>home.</em>
              </h4>
              <p>Thoughtful spaces. Endless possibilities.</p>
              <b>Explore properties ↗</b>
            </div>
            <div className="house-illustration">
              <div className="sky-circle" />
              <div className="house-main">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="house-wing">
                <span />
                <span />
              </div>
              <i className="tree tree-one" />
              <i className="tree tree-two" />
              <div className="house-ground" />
            </div>
          </div>
          <div className="property-search">
            <span>
              ⌖ Location <b>Where do you want to live?</b>
            </span>
            <span>
              ⌂ Property type <b>Choose your space</b>
            </span>
            <strong>Search ↗</strong>
          </div>
        </div>
      )}
      {variant === 'nitin' && (
        <div className="mock-window nitin-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>nitin hydraulics / built for performance</span>
          </div>
          <div className="nitin-nav">
            <b>
              NH<span>NITIN HYDRAULICS</span>
            </b>
            <small>About &nbsp; Products &nbsp; Contact</small>
          </div>
          <div className="nitin-main">
            <div>
              <small>PRECISION MEETS PERFORMANCE</small>
              <h4>
                Powering
                <br />
                possibilities<span>.</span>
              </h4>
              <p>Hydraulic solutions, engineered for you.</p>
              <b>Our products ↗</b>
            </div>
            <div className="machine">
              <i className="machine-rod" />
              <i className="machine-body" />
              <i className="machine-base" />
              <i className="machine-ring" />
            </div>
          </div>
          <div className="nitin-bottom">
            <span>HYDRAULIC SYSTEMS</span>
            <span>ENGINEERED TO LAST ↗</span>
          </div>
        </div>
      )}
      {variant === 'shop' && (
        <div className="mock-window shop-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>shopease / less effort, more discovery</span>
          </div>
          <div className="shop-nav">
            <b>
              shop<span>ease.</span>
            </b>
            <small>Discover &nbsp; Collections &nbsp; ♡ &nbsp; Bag (0)</small>
          </div>
          <div className="shop-hero">
            <div>
              <small>EVERYDAY, ELEVATED.</small>
              <h4>
                Your next
                <br />
                <em>favorite.</em>
              </h4>
              <b>Explore the collection ↗</b>
            </div>
            <div className="shop-product">
              <span className="product-handle" />
              <span className="product-bag" />
              <i>the everyday edit</i>
            </div>
          </div>
          <div className="shop-footer">
            <span>Good finds. Great experiences.</span>
            <span>01 / 03 &nbsp; →</span>
          </div>
        </div>
      )}
      {variant === 'file' && (
        <div className="file-art-inner">
          <div className="file-document">
            <div className="document-fold" />
            <b>PDF</b>
            <i />
            <i />
            <i />
            <span>
              your ideas,
              <br />
              unlocked.
            </span>
          </div>
          <div className="file-spark">✳</div>
          <div className="file-chat">
            <span className="chat-top">✧ &nbsp; Ask your document</span>
            <div>What’s the big idea?</div>
            <p>
              Let’s find the answer, together.
              <span />
              <span />
            </p>
            <small>Powered by curiosity + AI ↗</small>
          </div>
        </div>
      )}
      {variant === 'custom' && (
        <div className="custom-cover">
          <span>✳</span>
          <h4>{project.title}</h4>
          <small>{project.stack?.slice(0, 3).join(' / ')}</small>
        </div>
      )}
      <span className="cover-note">CONCEPT COVER</span>
    </div>
  );
}
