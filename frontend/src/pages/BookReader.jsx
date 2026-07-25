import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = 'http://localhost:8000/api';
const CHARS_PER_PAGE = 1300;
const PAGE_WIDTH = 380;
const PAGE_HEIGHT = 520;
const FLIP_MS = 500;

// Greedy paragraph-packing: never splits mid-word, keeps paragraphs together
// when they fit, breaks by word only when a single paragraph is too long.
// Gutenberg .txt is hard-wrapped at ~70 chars with single newlines inside
// paragraphs — collapse those to spaces so text reflows to fill the page
// instead of stacking short forced lines.
function paginate(text) {
  const paragraphs = text.split(/\r?\n\r?\n/)
    .map(p => p.replace(/\s*\r?\n\s*/g, ' ').trim())
    .filter(Boolean);
  const pages = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= CHARS_PER_PAGE) {
      current = current ? current + '\n\n' + para : para;
      continue;
    }
    if (current) { pages.push(current); current = ''; }

    if (para.length <= CHARS_PER_PAGE) {
      current = para;
    } else {
      const words = para.split(' ');
      let chunk = '';
      for (const w of words) {
        if ((chunk + ' ' + w).length > CHARS_PER_PAGE) {
          pages.push(chunk);
          chunk = w;
        } else {
          chunk = chunk ? chunk + ' ' + w : w;
        }
      }
      current = chunk;
    }
  }
  if (current) pages.push(current);
  return pages;
}

function PageFace({ children, pageNumber }) {
  return (
    <div style={{
      width: PAGE_WIDTH, height: PAGE_HEIGHT, background: 'var(--parchment)',
      padding: '3rem 2.4rem 2rem', boxSizing: 'border-box', display: 'flex',
      flexDirection: 'column', border: '1px solid var(--cream-dark)', borderRadius: 4,
      boxShadow: 'var(--shadow-book)', overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.8,
        color: 'var(--ink-mid)', whiteSpace: 'pre-wrap', overflowY: 'auto', height: PAGE_HEIGHT - 130,
      }}>{children}</div>
      {pageNumber !== '' && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '0.6rem', borderTop: '1px solid var(--cream-dark)', paddingTop: '0.6rem' }}>{pageNumber}</div>
      )}
    </div>
  );
}

function CoverFace({ title }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink)' }}>{title}</h2>
    </div>
  );
}

export default function BookReader() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(null); // { dir: 'next' | 'prev', from, to }
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setData(null); setError(null); setIndex(0); setFlip(null);
    fetch(`${API}/books/${id}/read/`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setData(json); })
      .catch(() => setError('Failed to load book.'));
    return () => clearTimeout(timeoutRef.current);
  }, [id]);

  const pages = useMemo(() => (data ? paginate(data.text) : []), [data]);

  const faces = useMemo(() => {
    if (!data) return [];
    return [
      { number: '', content: <CoverFace title={data.title} /> },
      ...pages.map((text, i) => ({ number: i + 1, content: text })),
    ];
  }, [data, pages]);

  const total = faces.length;

  const goTo = (dir) => {
    if (flip) return; // ignore clicks mid-animation
    const target = dir === 'next' ? index + 1 : index - 1;
    if (target < 0 || target >= total) return;
    setFlip({ dir, from: index, to: target });
    setAnimate(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    timeoutRef.current = setTimeout(() => {
      setIndex(target);
      setFlip(null);
      setAnimate(false);
    }, FLIP_MS);
  };

  useEffect(() => {
    if (!data) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goTo('next');
      if (e.key === 'ArrowLeft') goTo('prev');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, index, flip]);

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
      <span style={{ fontSize: '2.5rem' }}>📭</span>
      <p>{error}</p>
      <Link to={`/books/${id}`} style={{ background: 'var(--terra)', color: 'white', border: 'none', borderRadius: 100, padding: '0.6rem 1.6rem', fontFamily: 'var(--font-body)', fontWeight: 600, textDecoration: 'none' }}>← Go Back</Link>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 88, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 700, width: '100%', padding: '2rem' }}>
        {[{ h: 36, w: '60%' }, { h: 18, w: '100%' }, { h: 18, w: '95%' }, { h: 18, w: '90%' }].map((line, j) => (
          <div key={j} style={{ height: line.h, width: line.w, borderRadius: 4, marginBottom: '0.8rem', background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--parchment) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
  const baseIndex = flip ? flip.to : index;
  const baseFace = faces[baseIndex];
  const flippingFace = flip ? faces[flip.from] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 88 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link to={`/books/${id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)',
            textDecoration: 'none',
          }}>← Back to Book</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{data.title}</h1>
        </div>

        <div style={{ padding: '1.5rem', background: 'var(--cream-dark)', borderRadius: 12, boxShadow: '0 12px 40px rgba(44,26,14,0.15)' }}>
          <div style={{ position: 'relative', width: PAGE_WIDTH, height: PAGE_HEIGHT, perspective: 1800 }}>
            {/* destination page, sits underneath */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <PageFace pageNumber={baseFace.number}>{baseFace.content}</PageFace>
            </div>

            {/* page currently animating away, only rendered mid-flip */}
            {flip && (
              <div style={{
                position: 'absolute', inset: 0,
                transformOrigin: flip.dir === 'next' ? 'left center' : 'right center',
                transform: animate ? `rotateY(${flip.dir === 'next' ? -150 : 150}deg)` : 'rotateY(0deg)',
                transition: `transform ${FLIP_MS}ms ease-in-out`,
                backfaceVisibility: 'hidden',
              }}>
                <PageFace pageNumber={flippingFace.number}>{flippingFace.content}</PageFace>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.2rem' }}>
          <button onClick={() => goTo('prev')} disabled={index === 0} style={{
            background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 100,
            width: 38, height: 38, cursor: index === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem', color: 'var(--ink-mid)', opacity: index === 0 ? 0.4 : 1,
          }}>←</button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
            {index === 0 ? 'Cover' : `Page ${index} of ${pages.length}`} · use ← →
          </span>
          <button onClick={() => goTo('next')} disabled={index === total - 1} style={{
            background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 100,
            width: 38, height: 38, cursor: index === total - 1 ? 'not-allowed' : 'pointer',
            fontSize: '1rem', color: 'var(--ink-mid)', opacity: index === total - 1 ? 0.4 : 1,
          }}>→</button>
        </div>
      </div>
    </div>
  );
}