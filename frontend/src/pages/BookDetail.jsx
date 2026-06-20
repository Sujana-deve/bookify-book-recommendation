import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:8000/api';

function Nocover({ title, authors }) {
  const colors = [
    ['#c4603a','#9e3d20'], ['#7a8c6e','#5a6b50'],
    ['#9e7a4a','#7a5a2e'], ['#6a7a9e','#4a5a7e'],
    ['#9e6a7a','#7e4a5a'],
  ];
  const idx = (title?.charCodeAt(0) || 0) % colors.length;
  const [from, to] = colors[idx];
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '1.2rem',
      background: `linear-gradient(145deg, ${from}, ${to})`, textAlign: 'center',
    }}>
      <span style={{ fontSize: '2.5rem', marginBottom: '0.6rem', opacity: 0.9 }}>📖</span>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)', lineHeight: 1.4 }}>{title}</p>
      {authors && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{authors}</p>}
    </div>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ fontSize: '1rem', color: i < full ? 'var(--terra)' : (half && i === full ? 'var(--terra-pale)' : 'var(--parchment)') }}>★</span>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--terra)' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function MetaBadge({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 10, padding: '0.6rem 1rem', minWidth: 90 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>{value}</p>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/books/${id}/`)
      .then(r => {
        if (r.status === 404) throw new Error('Book not found');
        if (!r.ok) throw new Error('Failed to load book');
        return r.json();
      })
      .then(data => { setBook(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', padding: '2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem' }}>
        <div style={{ height: 320, borderRadius: 10, background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
          {[{h:40,w:'70%'},{h:20,w:'45%'},{h:20,w:'55%'},{h:100,w:'100%'}].map((line, j) => (
            <div key={j} style={{ height: line.h, width: line.w, borderRadius: 4, background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
          ))}
        </div>
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
      <span style={{ fontSize: '2.5rem' }}>📭</span>
      <p>{error}</p>
      <button onClick={() => navigate(-1)} style={{ background: 'var(--terra)', color: 'white', border: 'none', borderRadius: 100, padding: '0.6rem 1.6rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>← Go Back</button>
    </div>
  );

  const openLibraryUrl = book.isbn13
    ? `https://openlibrary.org/isbn/${book.isbn13}`
    : book.isbn10 ? `https://openlibrary.org/isbn/${book.isbn10}` : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        {book.thumbnail && (
          <div style={{ position: 'absolute', inset: -40, backgroundImage: `url(${book.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(28px) saturate(0.7) brightness(0.6)' }}/>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: book.thumbnail
            ? 'linear-gradient(to bottom, rgba(253,246,238,0) 0%, rgba(253,246,238,0.4) 60%, var(--cream) 100%)'
            : 'linear-gradient(135deg, var(--cream-dark), var(--parchment))',
        }}/>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '5rem 2rem 0' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: book.thumbnail ? 'rgba(255,255,255,0.85)' : 'var(--ink-muted)',
            textDecoration: 'none', background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)', borderRadius: 100, padding: '0.4rem 1rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>← Back to Library</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '-80px auto 0', padding: '0 2rem 5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 48px rgba(44,26,14,0.1)', padding: '2.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2.5rem' }} className="detail-grid">

          <div>
            <div style={{ width: 200, height: 290, borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-book)', background: 'var(--parchment)' }}>
              {book.thumbnail
                ? <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <Nocover title={book.title} authors={book.authors} />
              }
            </div>

            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {openLibraryUrl && (
                <a href={openLibraryUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '0.65rem',
                  background: 'var(--terra)', color: 'white', borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                  textDecoration: 'none',
                }}>View on Open Library ↗</a>
              )}
              <button disabled style={{
                padding: '0.65rem', background: 'var(--cream-dark)', color: 'var(--ink-muted)',
                border: 'none', borderRadius: 10, fontFamily: 'var(--font-body)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'not-allowed', opacity: 0.6,
              }}>Read Free (Coming Soon)</button>
            </div>
          </div>

          <div>
            {book.categories && (
              <div style={{ display: 'inline-block', background: 'rgba(196,96,58,0.1)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: '0.8rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)' }}>{book.categories}</span>
              </div>
            )}

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '0.4rem' }}>{book.title}</h1>

            {book.subtitle && <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--ink-mid)', marginBottom: '0.6rem' }}>{book.subtitle}</p>}

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
              by <strong style={{ color: 'var(--ink-mid)' }}>{book.authors}</strong>
            </p>

            {book.average_rating > 0 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <StarRating rating={book.average_rating} />
                {book.ratings_count > 0 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 4 }}>{book.ratings_count.toLocaleString()} ratings</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.8rem' }}>
              <MetaBadge label="Published" value={book.published_year} />
              <MetaBadge label="Pages" value={book.num_pages} />
              <MetaBadge label="ISBN-13" value={book.isbn13} />
              <MetaBadge label="ISBN-10" value={book.isbn10} />
            </div>

            <div style={{ height: 1, background: 'var(--cream-dark)', marginBottom: '1.5rem' }}/>

            {book.description && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.8rem' }}>About this book</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--ink-mid)' }}>{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 640px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .detail-grid > div:first-child { display: flex; flex-direction: column; align-items: center; }
        }
      `}</style>
    </div>
  );
}