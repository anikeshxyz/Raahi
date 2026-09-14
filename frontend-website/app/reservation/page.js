export const metadata = {
  title: 'Reserve a Table — Raahi Café',
};

export default function ReservationPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Dine In Experience</span>
        <h1 className="page-title">Table Reservation</h1>
        <p className="page-desc">
          Plan ahead and book your favorite cozy corner or terrace seating.
        </p>
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', background: 'var(--bg-card)', padding: '36px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
            <input type="text" placeholder="e.g. Ananya Sharma" style={{ width: '100%', padding: '12px 16px', background: '#0e0b09', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
              <input type="date" style={{ width: '100%', padding: '12px 16px', background: '#0e0b09', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Time Slot</label>
              <select style={{ width: '100%', padding: '12px 16px', background: '#0e0b09', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}>
                <option>Lunch (12:00 PM - 3:00 PM)</option>
                <option>High Tea (4:00 PM - 7:00 PM)</option>
                <option>Dinner (7:30 PM - 10:30 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Number of Guests</label>
            <input type="number" min="1" max="20" defaultValue="2" style={{ width: '100%', padding: '12px 16px', background: '#0e0b09', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
          </div>

          <button type="button" className="nav-cta" style={{ width: '100%', padding: '14px', marginTop: '10px', cursor: 'pointer', border: 'none' }}>
            Confirm Reservation Request (Phase 1 Form)
          </button>
        </form>
      </div>
    </div>
  );
}
