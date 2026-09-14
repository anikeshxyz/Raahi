import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Welcome to Raahi</span>
        <h1 className="page-title">Where Every Sip Tells a Story</h1>
        <p className="page-desc">
          Rooted in tradition and crafted for the modern wanderer. Explore our single-origin coffees, handcrafted artisanal teas, and fresh bakery treats.
        </p>
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/menu" className="nav-cta" style={{ display: 'inline-block' }}>
            Explore Menu
          </Link>
          <Link href="/reservation" style={{ 
            padding: '10px 22px', 
            borderRadius: '30px', 
            border: '1px solid var(--border)', 
            color: 'var(--text-light)', 
            fontSize: '0.88rem',
            fontWeight: 600
          }}>
            Reserve a Table
          </Link>
        </div>
      </header>

      <div className="card-grid">
        <div className="feature-box">
          <h2 className="feature-title">Artisanal Roasts</h2>
          <p className="feature-text">
            Carefully curated beans sourced ethically from lush Indian estates, roasted to perfection in micro-batches.
          </p>
        </div>
        <div className="feature-box">
          <h2 className="feature-title">Warm Ambience</h2>
          <p className="feature-text">
            Thoughtfully designed corners, soft acoustic melodies, and an atmosphere built for focus and soulful conversations.
          </p>
        </div>
        <div className="feature-box">
          <h2 className="feature-title">Gourmet Kitchen</h2>
          <p className="feature-text">
            From sourdough sandwiches to classic European pastries, freshly baked daily in-house by our master chefs.
          </p>
        </div>
      </div>
    </div>
  );
}
