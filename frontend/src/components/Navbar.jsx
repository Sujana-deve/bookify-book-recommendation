import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading, savedIds } = useAuth();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(253,246,238,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(196,96,58,0.15)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>📖</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--terra)' }}>Bookify</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="nav-desktop">
            <Link to="/" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
              color: location.pathname === '/' ? 'var(--terra)' : 'var(--ink-muted)',
              borderBottom: location.pathname === '/' ? '2px solid var(--terra)' : '2px solid transparent',
              paddingBottom: 2,
            }}>Discover</Link>

            {user && (
              <Link to="/my-list" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
                color: location.pathname === '/my-list' ? 'var(--terra)' : 'var(--ink-muted)',
                borderBottom: location.pathname === '/my-list' ? '2px solid var(--terra)' : '2px solid transparent',
                paddingBottom: 2, display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}>
                🔖 My List
                {savedIds.size > 0 && (
                  <span style={{
                    background: 'var(--terra)', color: 'white', borderRadius: 100,
                    fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', lineHeight: 1.5,
                  }}>{savedIds.size}</span>
                )}
              </Link>
            )}

            {loading ? null : user ? (
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--cream-dark)', border: 'none', borderRadius: 100,
                  padding: '0.4rem 1rem 0.4rem 0.5rem', cursor: 'pointer',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--terra)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
                  }}>{user.username[0].toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>{user.username}</span>
                </button>
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: '120%', right: 0, background: 'white',
                    borderRadius: 12, boxShadow: '0 8px 32px rgba(44,26,14,0.15)',
                    minWidth: 180, padding: '0.5rem', border: '1px solid var(--cream-dark)',
                  }}>
                    <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--cream-dark)', marginBottom: '0.3rem' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Signed in as</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>{user.username}</p>
                    </div>
                    <Link to="/my-list" style={{ display: 'block', padding: '0.6rem 0.8rem', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                      🔖 My Reading List {savedIds.size > 0 && `(${savedIds.size})`}
                    </Link>
                    <button onClick={handleLogout} style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none',
                      padding: '0.6rem 0.8rem', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--rust)',
                    }}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: 'var(--terra)', color: 'white', textDecoration: 'none',
                borderRadius: 100, padding: '0.5rem 1.4rem',
              }}>Sign In</Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(v => !v)} className="nav-hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2, background: 'var(--ink)', borderRadius: 2,
                transition: 'transform 0.25s, opacity 0.25s',
                transform: menuOpen ? (i===0 ? 'translateY(7px) rotate(45deg)' : i===2 ? 'translateY(-7px) rotate(-45deg)' : 'none') : 'none',
                opacity: menuOpen && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </div>

        {menuOpen && (
          <div style={{ padding: '1rem 2rem 1.5rem', background: 'rgba(253,246,238,0.97)', borderTop: '1px solid var(--parchment)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none' }}>Discover</Link>
            {user && <Link to="/my-list" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none' }}>🔖 My List {savedIds.size > 0 && `(${savedIds.size})`}</Link>}
            {loading ? null : user ? (
              <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--rust)', cursor: 'pointer' }}>Sign Out</button>
            ) : (
              <Link to="/login" style={{ fontFamily: 'var(--font-body)', color: 'var(--terra)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>
        )}
      </nav>
      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}