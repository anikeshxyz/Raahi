export const metadata = {
  title: 'Our Menu — Raahi Café',
};

const menuCategories = [
  { name: 'Specialty Coffee', items: ['Espresso Con Panna', 'Pour Over (Chikmagalur)', 'Iced Spanish Latte', 'Cold Brew Tonic'] },
  { name: 'Artisan Teas', items: ['Darjeeling First Flush', 'Kashmiri Kahwa', 'Matcha Latte', 'Hibiscus Berry Cooler'] },
  { name: 'Bakery & Small Plates', items: ['Butter Croissant', 'Truffle Mushroom Toast', 'Avocado Sourdough', 'Dark Chocolate Tart'] },
];

export default function MenuPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Explore Flavors</span>
        <h1 className="page-title">Curated Menu</h1>
        <p className="page-desc">
          Browse our seasonal offerings prepared with fresh ingredients and precise culinary care.
        </p>
      </header>

      <div className="card-grid">
        {menuCategories.map((cat) => (
          <div key={cat.name} className="feature-box">
            <h2 className="feature-title">{cat.name}</h2>
            <ul style={{ listStyle: 'none', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cat.items.map((item) => (
                <li key={item} style={{ color: 'var(--text-light)', fontSize: '0.95rem', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
