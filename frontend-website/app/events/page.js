export const metadata = {
  title: 'Events & Experiences — Raahi Café',
};

export default function EventsPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Community Gatherings</span>
        <h1 className="page-title">Events & Workshops</h1>
        <p className="page-desc">
          From live acoustic music to coffee brewing masterclasses and book club circles.
        </p>
      </header>

      <div className="card-grid">
        <div className="feature-box">
          <span className="page-badge">Every Saturday</span>
          <h2 className="feature-title">Acoustic Unplugged</h2>
          <p className="feature-text">Local indie artists performing soulful acoustics under the stars on our outdoor garden patio.</p>
        </div>
        <div className="feature-box">
          <span className="page-badge">Monthly Workshop</span>
          <h2 className="feature-title">Manual Brewing Masterclass</h2>
          <p className="feature-text">Learn Aeropress, V60, and French Press extraction ratios with our head barista.</p>
        </div>
      </div>
    </div>
  );
}
