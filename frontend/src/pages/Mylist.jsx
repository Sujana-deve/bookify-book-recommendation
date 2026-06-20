import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

const PALETTE = [
  ['#b5604a','#8c3d28'], ['#7a8c6e','#4e6348'],
  ['#9e7a4a','#6e5030'], ['#6a7a9e','#3e5078'],
  ['#9e6a7a','#6e3e50'], ['#5a8c7a','#2e6050'],
];

function Nocover({ title }) {
  const idx = (title?.charCodeAt(0) || 0) % PALETTE.length;
  const [from, to] = PALETTE[idx];
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0.6rem',
      background: `linear-gradient(155deg, ${from}, ${to})`, textAlign: 'center',
    }}>
      <span style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>📖</span>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
    </div>
  );
}

export default function MyList() {
  const { user, loading: authLoading, toggleSave, savedIds } = useAuth();
  const navigate = useNavigate();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!user) return;
    const token = localStorage.getItem('access');
    fetch(`${API}/auth/reading-list/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  const handleRemove = async (bookId) => {
    setRemoving(bookId);
    await toggleSave(bookId);
    setItems(prev => prev.filter(item => item.book.id !== bookId));
    setRemoving(null);
  };

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '1.4rem', maxWidth: 900, width: '100%', padding: '2rem' }}>
        {Array.from({length:6}).map((_,i) => (
          <div key={i} style={{ height: 240, borderRadius: 8, background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 88 }}>
      {/* Header banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--terra), var(--rust))', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
            {user?.username}'s Collection
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>
            My Reading List 🔖
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
            {items.length} {items.length === 1 ? 'book' : 'books'} saved
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.6rem' }}>Your list is empty</h2>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.8rem', color: 'var(--ink-muted)' }}>Start exploring and save books you want to read.</p>
            <Link to="/" style={{
              display: 'inline-block', background: 'var(--terra)', color: 'white',
              textDecoration: 'none', borderRadius: 100, padding: '0.7rem 2rem',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
            }}>Browse Books →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.8rem' }}>
            {items.map(({ id, book, saved_at }) => (
              <div key={id} style={{ position: 'relative' }}>
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(book.id)}
                  disabled={removing === book.id}
                  title="Remove from list"
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 2,
                    width: 28, height: 28, borderRadius: '50%',
                    background: removing === book.id ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.55)',
                    border: 'none', color: 'white', cursor: removing === book.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', transition: 'background 0.2s',
                    backdropFilter: 'blur(4px)',
                  }}
                >×</button>

                <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '100%', aspectRatio: '2/3', borderRadius: 8, overflow: 'hidden',
                    boxShadow: '3px 5px 16px rgba(44,26,14,0.18)', background: 'var(--parchment)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='5px 10px 24px rgba(44,26,14,0.24)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 5px 16px rgba(44,26,14,0.18)'; }}
                  >
                    {book.thumbnail
                      ? <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                      : <Nocover title={book.title} />
                    }
                  </div>
                  <div style={{ marginTop: '0.6rem' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.authors}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--ink-muted)', marginTop: 3, opacity: 0.7 }}>
                      Saved {new Date(saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}