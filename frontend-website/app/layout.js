import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Raahi Café — Artisanal Coffee & Warm Moments',
  description: 'Experience artisanal roasts, gourmet delicacies, and soulful conversations at Raahi Café.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <Link href="/" className="nav-brand">
            <span className="brand-dot"></span>
            <span>Raahi Café</span>
          </Link>
          <nav>
            <ul className="nav-menu">
              <li><Link href="/" className="nav-link">Home</Link></li>
              <li><Link href="/about" className="nav-link">About</Link></li>
              <li><Link href="/menu" className="nav-link">Menu</Link></li>
              <li><Link href="/gallery" className="nav-link">Gallery</Link></li>
              <li><Link href="/offers" className="nav-link">Offers</Link></li>
              <li><Link href="/events" className="nav-link">Events</Link></li>
              <li><Link href="/contact" className="nav-link">Contact</Link></li>
            </ul>
          </nav>
          <Link href="/reservation" className="nav-cta">
            Book a Table
          </Link>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="footer-links">
            <Link href="/about">About Us</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/reservation">Reservations</Link>
            <Link href="/contact">Location & Hours</Link>
          </div>
          <p>© {new Date().getFullYear()} Raahi Café. Handcrafted with passion. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
