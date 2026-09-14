export const metadata = {
  title: 'Special Offers & Combos — Raahi Café',
};

export default function OffersPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Deals & Combos</span>
        <h1 className="page-title">Current Offers</h1>
        <p className="page-desc">
          Enjoy our curated pairings and seasonal discounts crafted especially for café lovers.
        </p>
      </header>

      <div className="card-grid">
        <div className="feature-box">
          <span className="page-badge">Morning Ritual</span>
          <h2 className="feature-title">Brew & Bake Combo</h2>
          <p className="feature-text">Any pour-over or cappuccino paired with a freshly baked almond croissant at ₹349 (8:00 AM - 11:30 AM).</p>
        </div>
        <div className="feature-box">
          <span className="page-badge">Sunset Special</span>
          <h2 className="feature-title">High Tea for Two</h2>
          <p className="feature-text">Select tea pot accompanied by a dessert platter and finger sandwiches at ₹799 (4:00 PM - 7:00 PM).</p>
        </div>
      </div>
    </div>
  );
}
