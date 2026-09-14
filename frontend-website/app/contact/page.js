export const metadata = {
  title: 'Contact Us — Raahi Café',
};

export default function ContactPage() {
  return (
    <div className="content-container">
      <header className="page-header">
        <span className="page-badge">Find Us</span>
        <h1 className="page-title">Get in Touch</h1>
        <p className="page-desc">
          We'd love to hear from you. Drop by for a cup or send us your thoughts.
        </p>
      </header>

      <div className="card-grid">
        <div className="feature-box">
          <h2 className="feature-title">Location</h2>
          <p className="feature-text">
            42 Heritage Lane, Near Peace Park,<br />
            Indiranagar, Bangalore 560038
          </p>
        </div>
        <div className="feature-box">
          <h2 className="feature-title">Opening Hours</h2>
          <p className="feature-text">
            Monday – Friday: 8:00 AM – 11:00 PM<br />
            Saturday – Sunday: 8:00 AM – Midnight
          </p>
        </div>
        <div className="feature-box">
          <h2 className="feature-title">Reach Out</h2>
          <p className="feature-text">
            hello@raahicafe.com<br />
            +91 98765 43210
          </p>
        </div>
      </div>
    </div>
  );
}
