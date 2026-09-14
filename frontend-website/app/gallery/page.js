export const metadata = {
  title: 'Gallery — Raahi Café',
};

export default function GalleryPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Visual Moments</span>
        <h1 className="page-title">Café Gallery</h1>
        <p className="page-desc">
          A glimpse into our serene ambience, master barista creations, and joyful guest moments.
        </p>
      </header>

      <div className="card-grid">
        {['The Reading Nook', 'Espresso Bar Craft', 'Sunset Patio', 'Fresh Batch Bakes', 'Acoustic Evenings', 'Artisanal Latte Art'].map((title) => (
          <div key={title} className="feature-box" style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(180deg, rgba(29, 23, 20, 0.4), rgba(29, 23, 20, 0.95))' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>Raahi Atmosphere</span>
          </div>
        ))}
      </div>
    </div>
  );
}
