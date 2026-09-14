export const metadata = {
  title: 'About Our Journey — Raahi Café',
};

export default function AboutPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Our Story</span>
        <h1 className="page-title">The Spirit of Raahi</h1>
        <p className="page-desc">
          "Raahi" means the traveler. We created this space as a haven for thinkers, dreamers, and explorers from all walks of life.
        </p>
      </header>

      <div className="card-grid">
        <div className="feature-box">
          <h2 className="feature-title">Our Philosophy</h2>
          <p className="feature-text">
            Mindful sourcing, zero compromises on ingredient purity, and genuine hospitality for every guest that walks through our doors.
          </p>
        </div>
        <div className="feature-box">
          <h2 className="feature-title">Sustainable Practices</h2>
          <p className="feature-text">
            Compostable packaging, direct-trade coffee beans, and minimal food waste driven by precision kitchen inventory management.
          </p>
        </div>
      </div>
    </div>
  );
}
