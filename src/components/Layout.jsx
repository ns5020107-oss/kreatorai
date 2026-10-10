import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../lib/art";
import { useStore } from "../state/store";
import { useAuth } from "../state/auth";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const { user, logout, backendUp } = useAuth();
  const navigate = useNavigate();
  const [hideOffline, setHideOffline] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="site-header">
      <a className="skip" href="#main">Skip to content</a>
      <div className="wrap bar">
        <Link to="/" className="wordmark" aria-label="KreatorAI home">
          KreatorAI<span className="dot">.</span>
        </Link>
        <nav className="main-nav" aria-label="Main">
          <NavLink to="/creators" className={({ isActive }) => (isActive ? "active" : "")}>Find creators</NavLink>
          <NavLink to="/brief/new" className={({ isActive }) => (isActive ? "active" : "")}>Post a brief</NavLink>
          <NavLink to="/briefs" className={({ isActive }) => (isActive ? "active" : "")}>My briefs</NavLink>
          <NavLink to="/inbox" className={({ isActive }) => (isActive ? "active" : "")}>Inbox</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About</NavLink>
          {user && user.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>Admin</NavLink>
          )}
        </nav>
        <div className="header-right">
          <span className="role-pill hide-mobile">Demo build · Mixed data</span>
          <Link to="/brief/new" className="btn btn-sm">Post a brief</Link>
          {user ? (
            <>
              <span className="user-chip hide-mobile" title={user.email}>{user.name}</span>
              <button type="button" className="btn-line btn-sm" onClick={doLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-quiet btn-sm hide-mobile">Log in</Link>
              <Link to="/register" className="btn-line btn-sm hide-mobile">Sign up</Link>
            </>
          )}
        </div>
      </div>
      {/* mobile nav row */}
      <nav className="wrap mobile-nav" aria-label="Main mobile">
        <NavLink to="/creators" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>Find creators</NavLink>
        <NavLink to="/briefs" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>My briefs</NavLink>
        <NavLink to="/inbox" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>Inbox</NavLink>
        <NavLink to="/about" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>About</NavLink>
        {user ? (
          <>
            {user.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>Admin</NavLink>
            )}
            <button type="button" className="chip" onClick={doLogout}>Log out</button>
          </>
        ) : (
          <NavLink to="/login" className={({ isActive }) => "chip" + (isActive ? " active" : "")}>Log in</NavLink>
        )}
      </nav>
      {!backendUp && !hideOffline && (
        <div className="offline-strip" role="note">
          <span>Offline demo mode — the API server isn't reachable. Logins are paused; everything is saved in this browser.</span>
          <button type="button" className="offline-dismiss" onClick={() => setHideOffline(true)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { user, logout } = useAuth();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <Link to="/" className="wordmark" style={{ fontSize: 20 }}>KreatorAI<span className="dot">.</span></Link>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 10, maxWidth: 300 }}>
              A marketplace for AI-native creators and the brands who hire them.
              Every profile shows the tools, the workflow, and the proof.
            </p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link to="/creators">Find creators</Link></li>
              <li><Link to="/brief/new">Post a brief</Link></li>
              <li><Link to="/briefs">My briefs</Link></li>
            </ul>
          </div>
          <div>
            <h5>Account</h5>
            <ul>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <li><Link to="/admin">Admin panel</Link></li>
                  )}
                  <li><button type="button" className="linklike" onClick={logout}>Log out ({user.name})</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Log in</Link></li>
                  <li><Link to="/register">Create account</Link></li>
                </>
              )}
              <li><Link to="/inbox">Sent messages</Link></li>
              <li><Link to="/about">How verification works</Link></li>
            </ul>
          </div>
          <div>
            <h5>Fine print</h5>
            <ul>
              <li><Link to="/about">About this demo</Link></li>
              <li><Link to="/404">A page that doesn't exist</Link></li>
            </ul>
          </div>
        </div>
        <p className="fineprint">
          KreatorAI demo prototype — the 14 featured creators, their brands, prices and messages are fictional;
          the 100 directory listings are real public finds, shown unverified. Built for a hackathon;
          nothing here sends real email or moves real money.
        </p>
      </div>
    </footer>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name="check" size={16} className="tick" />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Toasts />
    </>
  );
}
