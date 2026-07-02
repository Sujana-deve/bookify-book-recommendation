import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:8000/api';

const GENRES = ['All','Fiction','Biography','History','Science','Philosophy',
  'Psychology','Romance','Fantasy','Mystery','Self-Help','Children'];

const PALETTE = [
  ['#b5604a','#8c3d28'], ['#7a8c6e','#4e6348'],
  ['#9e7a4a','#6e5030'], ['#6a7a9e','#3e5078'],
  ['#9e6a7a','#6e3e50'], ['#5a8c7a','#2e6050'],
];

function Nocover({ title, authors, size = 'md' }) {
  const idx = (title?.charCodeAt(0) || 0) % PALETTE.length;
  const [from, to] = PALETTE[idx];
  const fs  = size === 'lg' ? '0.72rem' : '0.6rem';
  const afs = size === 'lg' ? '0.65rem' : '0.54rem';
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0.6rem',
      background: `linear-gradient(155deg, ${from}, ${to})`, textAlign: 'center',
    }}>
      <span style={{ fontSize: size === 'lg' ? '1.2rem' : '1rem', marginBottom: '0.35rem', opacity: 0.85 }}>📖</span>
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: fs, fontWeight: 600,
        color: 'rgba(255,255,255,0.95)', lineHeight: 1.25,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{title}</p>
      {authors && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: afs,
          color: 'rgba(255,255,255,0.65)', marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
        }}>{authors}</p>
      )}
    </div>
  );
}

function BookCard({ book, size = 'md' }) {
  const [hovered, setHovered] = useState(false);
  const w = size === 'lg' ? 155 : 130;
  return (
    <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ width: w, transition: 'transform 0.22s ease', transform: hovered ? 'translateY(-5px)' : 'none' }}>
        <div style={{
          width: w, height: Math.round(w * 1.46), borderRadius: 6, overflow: 'hidden',
          boxShadow: hovered
            ? '5px 10px 28px rgba(44,26,14,0.26), -1px 0 0 rgba(44,26,14,0.06)'
            : '3px 5px 14px rgba(44,26,14,0.16), -1px 0 0 rgba(44,26,14,0.05)',
          background: 'var(--parchment)', transition: 'box-shadow 0.22s', position: 'relative',
        }}>
          {book.thumbnail
            ? <img src={book.thumbnail} alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
            : <Nocover title={book.title} authors={book.authors} size={size} />
          }
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)', pointerEvents: 'none' }}/>
        </div>
        <div style={{ marginTop: '0.45rem', paddingRight: 4 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: size === 'lg' ? '0.82rem' : '0.74rem',
            fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{book.title}</p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--ink-muted)',
            marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{book.authors}</p>
        </div>
      </div>
    </Link>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
      <span style={{ display: 'block', width: 4, height: 22, background: 'var(--terra)', borderRadius: 2, flexShrink: 0 }}/>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{children}</h2>
    </div>
  );
}

function Carousel({ title, books, loading }) {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });
  return (
    <section style={{ marginBottom: '2.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <SectionHeading>{title}</SectionHeading>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['←','→'].map((arrow, i) => (
            <button key={arrow} onClick={() => scroll(i===0 ? -1 : 1)} style={{
              width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--parchment)',
              background: 'white', cursor: 'pointer', color: 'var(--terra)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
              boxShadow: '0 2px 6px rgba(44,26,14,0.08)', transition: 'all 0.18s',
            }}>{arrow}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.75rem', scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({length:9}).map((_,i) => (
              <div key={i} style={{
                flexShrink: 0, width: 130, height: 190, borderRadius: 6,
                background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)',
                backgroundSize: '200% 100%', animation: `shimmer 1.4s ${i*0.07}s ease-in-out infinite`,
              }}/>
            ))
          : books.map(b => <BookCard key={b.id} book={b} />)
        }
      </div>
    </section>
  );
}

function ReadingPanda() {
  return (
    /* Increased dimension to 260px for a more notable visual presence near the center */
    <div style={{ width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '0 -10px 0 auto' }}>
      <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <style>{`
          @keyframes panda-bob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes ear-wiggle-left {
            0%, 90%, 100% { transform: rotate(0deg); }
            93% { transform: rotate(-8deg); }
            96% { transform: rotate(4deg); }
          }
          @keyframes ear-wiggle-right {
            0%, 88%, 100% { transform: rotate(0deg); }
            91% { transform: rotate(8deg); }
            94% { transform: rotate(-4deg); }
          }
          @keyframes eye-blink {
            0%, 48%, 52%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(0.1); }
          }
          @keyframes page-turn {
            0% { transform: rotateY(0deg) skewY(0deg); opacity: 0; }
            10% { opacity: 1; }
            80% { opacity: 1; }
            90%, 100% { transform: rotateY(-160deg) skewY(-10deg); opacity: 0; }
          }
          .panda-body { animation: panda-bob 4s ease-in-out infinite; transform-origin: bottom center; }
          .ear-l { animation: ear-wiggle-left 5s ease-in-out infinite; transform-origin: 240px 110px; }
          .ear-r { animation: ear-wiggle-right 5s ease-in-out infinite; transform-origin: 440px 110px; }
          .panda-eye { animation: eye-blink 4s linear infinite; transform-origin: center; }
          .turning-page { animation: page-turn 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: 340px 280px; }
        `}</style>
        
        <circle cx="340" cy="220" r="180" fill="var(--cream-dark)" opacity="0.4" />

        <g className="panda-body">
          <g className="ear-l"><circle cx="240" cy="110" r="38" fill="#1C1C1E" /></g>
          <g className="ear-r"><circle cx="440" cy="110" r="38" fill="#1C1C1E" /></g>
          
          <ellipse cx="340" cy="180" rx="115" ry="95" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="2" />
          
          <ellipse cx="285" cy="185" rx="28" ry="34" fill="#1C1C1E" transform="rotate(-15 285 185)" />
          <ellipse cx="395" cy="185" rx="28" ry="34" fill="#1C1C1E" transform="rotate(15 395 185)" />
          
          <circle className="panda-eye" cx="292" cy="180" r="8" fill="#FFFFFF" />
          <circle className="panda-eye" cx="388" cy="180" r="8" fill="#FFFFFF" />
          
          <circle cx="285" cy="180" r="38" fill="none" stroke="var(--terra)" strokeWidth="4" />
          <circle cx="395" cy="180" r="38" fill="none" stroke="var(--terra)" strokeWidth="4" />
          <line x1="323" y1="180" x2="357" y2="180" stroke="var(--terra)" strokeWidth="4" />
          
          <ellipse cx="340" cy="215" rx="22" ry="15" fill="#F2F2F7" />
          <path d="M 330 212 Q 340 222 350 212 Q 340 216 330 212" fill="#1C1C1E" />
          
          <circle cx="245" cy="215" r="12" fill="#FFB3BA" opacity="0.5" />
          <circle cx="435" cy="215" r="12" fill="#FFB3BA" opacity="0.5" />

          <path d="M 250 270 C 230 340, 220 370, 340 370 C 460 370, 450 340, 430 270 Z" fill="#1C1C1E" />
        </g>

        <g>
          <path d="M 190 295 L 340 325 L 490 295 L 485 303 L 340 333 L 195 303 Z" fill="var(--forest-dark)" />
          
          <path d="M 195 290 Q 270 270 340 295 L 340 325 Q 270 300 195 320 Z" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="1" />
          <path d="M 198 287 Q 271 268 340 292 L 340 322 Q 271 297 198 317 Z" fill="#FAF9F6" />
          
          <path d="M 485 290 Q 410 270 340 295 L 340 325 Q 410 300 485 320 Z" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="1" />
          <path d="M 482 287 Q 409 268 340 292 L 340 322 Q 409 297 482 317 Z" fill="#FAF9F6" />

          <path d="M 220 288 Q 250 280 280 288 M 220 298 Q 250 290 290 298 M 230 308 Q 260 300 310 308" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <path d="M 400 288 Q 430 280 460 288 M 390 298 Q 420 290 460 298 M 370 308 Q 410 300 450 308" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

          <path className="turning-page" d="M 340 292 Q 270 270 220 285 L 220 315 Q 270 300 340 322 Z" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="1" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function BrowseAll() {
  const [books, setBooks]       = useState([]);
  const [page, setPage]         = useState(1);
  const [hasNext, setHasNext]   = useState(true);
  const [loading, setLoading]   = useState(false);

  const loadMore = () => {
    setLoading(true);
    fetch(`${API}/books/?page=${page}`)
      .then(r => r.json())
      .then(d => {
        setBooks(prev => [...prev, ...(d.results ?? [])]);
        setHasNext(!!d.next);
        setPage(p => p + 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <section style={{ marginTop: '1rem' }}>
      <SectionHeading>Browse All Books</SectionHeading>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <button onClick={loadMore} style={{
            background: 'var(--terra)', color: 'white', border: 'none',
            borderRadius: 100, padding: '0.75rem 2rem',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(196,96,58,0.25)',
          }}>Browse All Books →</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.4rem' }}>
            {books.map(b => <BookCard key={b.id} book={b} size="lg" />)}
          </div>
          {hasNext && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button onClick={loadMore} disabled={loading} style={{
                background: loading ? 'var(--cream-dark)' : 'white',
                color: loading ? 'var(--ink-muted)' : 'var(--terra)',
                border: '1.5px solid var(--parchment)', borderRadius: 100,
                padding: '0.65rem 2rem', fontFamily: 'var(--font-body)',
                fontSize: '0.88rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
              }}>
                {loading ? 'Loading…' : 'Load More Books'}
              </button>
            </div>
          )}
          {!hasNext && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              You've reached the end · {books.length.toLocaleString()} books browsed
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function BookList() {
  const [allBooks, setAllBooks]           = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery]                 = useState('');
  const [inputVal, setInputVal]           = useState('');
  const [genre, setGenre]                 = useState('All');
  const [loading, setLoading]             = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError]                 = useState(null);
  const [page, setPage]                   = useState(1);
  const [hasNext, setHasNext]             = useState(false);
  const [hasPrev, setHasPrev]             = useState(false);
  const [totalCount, setTotalCount]       = useState(0);
  const debounceRef      = useRef(null);
  const searchSectionRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/books/?page=1`)
      .then(r => r.json())
      .then(d => { setAllBooks(d.results ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query && genre === 'All') { setSearchResults([]); return; }
    setSearchLoading(true);
    const params = new URLSearchParams({ page });
    if (query && genre !== 'All') params.set('search', `${query} ${genre}`);
    else if (query) params.set('search', query);
    else params.set('search', genre);
    fetch(`${API}/books/?${params}`)
      .then(r => r.json())
      .then(d => {
        setSearchResults(d.results ?? []);
        setTotalCount(d.count ?? 0);
        setHasNext(!!d.next); setHasPrev(!!d.previous);
        setSearchLoading(false);
      })
      .catch(e => { setError(e.message); setSearchLoading(false); });
  }, [query, genre, page]);

  const handleSearch = val => {
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setQuery(val); setPage(1); }, 400);
  };

  const handleGenre = g => {
    setGenre(g); setPage(1);
    if (g !== 'All') setTimeout(() => searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const isSearching   = query || genre !== 'All';
  const featuredBooks = allBooks.slice(0, 20);
  const newBooks      = [...allBooks].reverse().slice(0, 20);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Hero */}
      <section style={{
        paddingTop: '5.5rem', paddingBottom: '3.5rem', paddingLeft: '2rem', paddingRight: '2rem',
        background: 'linear-gradient(160deg, #fdf6ee 0%, #f7e8d5 55%, #eeddc6 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,96,58,0.1), transparent 68%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -40, left: '25%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,140,110,0.09), transparent 68%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Left Text / Search Block */}
          <div style={{ flex: '1 1 380px', animation: 'fadeUp 0.65s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(196,96,58,0.1)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.85rem' }}>✨</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--terra)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Smart Book Discovery</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.1, color: 'var(--ink)', marginBottom: '0.9rem' }}>
              Discover Books<br/>
              <em style={{ color: 'var(--terra)', fontStyle: 'italic' }}>You'll Love</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--ink-mid)', lineHeight: 1.65, marginBottom: '1.8rem', maxWidth: 400 }}>
              52,000+ books across every genre. Search by title, author, or browse categories below.
            </p>
            <div style={{ display: 'flex', background: 'white', borderRadius: 100, boxShadow: '0 4px 20px rgba(44,26,14,0.1)', border: '1.5px solid rgba(196,96,58,0.15)', overflow: 'hidden', maxWidth: 460 }}>
              <span style={{ padding: '0 0.6rem 0 1.1rem', display: 'flex', alignItems: 'center', color: 'var(--ink-muted)', fontSize: '1rem' }}>🔍</span>
              <input type="text" placeholder="Search books, authors…" value={inputVal}
                onChange={e => handleSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '0.85rem 0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem', background: 'transparent', color: 'var(--ink)' }}
              />
              {inputVal && (
                <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: '0 0.7rem', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              )}
              <button style={{ background: 'var(--terra)', color: 'white', border: 'none', borderRadius: 100, margin: 4, padding: '0.55rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Find Books
              </button>
            </div>
          </div>

          {/* Expanded layout wrapper to house the semi-centered panda and floating books side-by-side */}
          <div className="hero-visuals" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 520px', justifyContent: 'flex-end', animation: 'fadeUp 0.65s 0.12s ease both' }}>
            
            {/* Bigger, centered-aligned reading panda */}
            <ReadingPanda />

            {/* Original Floating covers setup matching layout parameters */}
            <div style={{ position: 'relative', height: 320, width: 260, flexShrink: 0 }}>
              {allBooks.filter(b => b.thumbnail).slice(0,5).map((book, i) => {
                const pos = [
                  { top: 10,  left: 20,  rotate: -7, z: 5, s: 1.08 },
                  { top: 50,  left: 150, rotate:  4, z: 4, s: 0.97 },
                  { top: 145, left: -25, rotate:  3, z: 3, s: 0.93 },
                  { top: 185, left: 135, rotate: -4, z: 3, s: 0.88 },
                  { top: 90,  left: 75,  rotate:  1, z: 6, s: 1.03 },
                ][i];
                return (
                  <Link key={book.id} to={`/books/${book.id}`} style={{
                    position: 'absolute', textDecoration: 'none',
                    top: pos.top, left: pos.left, zIndex: pos.z,
                    transform: `rotate(${pos.rotate}deg) scale(${pos.s})`,
                    transition: 'transform 0.3s ease',
                  }}>
                    <div style={{ width: 88, height: 128, borderRadius: 5, overflow: 'hidden', boxShadow: '4px 7px 20px rgba(44,26,14,0.28)' }}>
                      <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* Genre chips */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--cream-dark)', position: 'sticky', top: 68, zIndex: 90, boxShadow: '0 2px 6px rgba(44,26,14,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.65rem 2rem', display: 'flex', gap: '0.45rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => handleGenre(g)} style={{
              flexShrink: 0, padding: '0.38rem 1rem', borderRadius: 100, border: '1.5px solid',
              borderColor: genre === g ? 'var(--terra)' : 'var(--parchment)',
              background: genre === g ? 'var(--terra)' : 'white',
              color: genre === g ? 'white' : 'var(--ink-mid)',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
            }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem 2rem' }}>
        {error && <div style={{ textAlign: 'center', padding: '2rem', color: '#c0392b', fontFamily: 'var(--font-body)' }}>⚠ {error} — Is the Django server running?</div>}

        {isSearching ? (
          <div ref={searchSectionRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <SectionHeading>
                {query ? `"${query}"` : genre}
                {!searchLoading && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>· {totalCount.toLocaleString()} books</span>}
              </SectionHeading>
              <button onClick={() => { setQuery(''); setInputVal(''); setGenre('All'); }} style={{ background: 'none', border: '1.5px solid var(--parchment)', borderRadius: 100, padding: '0.3rem 0.9rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--terra)', cursor: 'pointer', fontWeight: 600 }}>Clear ×</button>
            </div>

            {searchLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.4rem' }}>
                {Array.from({length:12}).map((_,i) => <div key={i} style={{ height: 240, borderRadius: 6, background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>)}
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>📭</p>
                <p style={{ fontSize: '0.95rem' }}>No books found. Try a different search.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.4rem' }}>
                  {searchResults.map(b => <BookCard key={b.id} book={b} size="lg"/>)}
                </div>
                {(hasNext || hasPrev) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                    <button disabled={!hasPrev} onClick={() => setPage(p=>p-1)} style={{ padding: '0.5rem 1.3rem', borderRadius: 100, border: '1.5px solid var(--parchment)', background: hasPrev ? 'white' : 'var(--cream-dark)', color: hasPrev ? 'var(--terra)' : 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, cursor: hasPrev ? 'pointer' : 'not-allowed' }}>← Prev</button>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Page {page}</span>
                    <button disabled={!hasNext} onClick={() => setPage(p=>p+1)} style={{ padding: '0.5rem 1.3rem', borderRadius: 100, border: '1.5px solid var(--parchment)', background: hasNext ? 'var(--terra)' : 'var(--cream-dark)', color: hasNext ? 'white' : 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, cursor: hasNext ? 'pointer' : 'not-allowed' }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <Carousel title="Featured Books" books={featuredBooks} loading={loading} />
            <Carousel title="Recently Added"  books={newBooks}      loading={loading} />
            
            <BrowseAll />

            {/* CTA strip */}
            <div style={{ marginTop: '3rem', padding: '2rem 2.5rem', background: 'linear-gradient(130deg, var(--terra) 0%, var(--rust) 100%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.2rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>Find Your Next Favourite</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>Search 52,000+ books or pick a genre above.</p>
              </div>
              <button onClick={() => document.querySelector('input[type="text"]')?.focus()} style={{ background: 'white', color: 'var(--terra)', border: 'none', borderRadius: 100, padding: '0.65rem 1.8rem', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Start Searching →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '3rem', borderTop: '1px solid var(--cream-dark)', padding: '2rem', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📖</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--terra)' }}>Bookify</span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>52,000+ books · Built with Django + React</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>© {new Date().getFullYear()} Bookify</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @media (max-width: 992px) { .hero-visuals { display: none !important; } }
      `}</style>
    </div>
  );
}
