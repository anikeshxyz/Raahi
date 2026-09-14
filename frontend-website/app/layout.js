import './globals.css';
import Link from 'next/link';
import { HeaderNav } from './components/HeaderNav';
import { QuickActions } from './components/QuickActions';
import { Coffee, MapPin, Clock, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export const metadata = {
  title: 'Raahi Café — Artisanal Coffee, Sourdough & Stories',
  description:
    'Experience single-origin estate roasts, 36-hour fermented sourdough, and soulful ambience in Indiranagar, Bangalore.',
  keywords: ['Raahi Cafe', 'Artisanal Coffee', 'Bangalore Cafe', 'Specialty Coffee', 'Table Reservation'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HeaderNav />

        <main>{children}</main>

        <QuickActions />

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Coffee size={22} style={{ color: 'var(--accent)' }} />
                <h3>Raahi Café</h3>
              </div>
              <p>
                A sanctuary for wanderers, thinkers, and coffee lovers. Rooted in artisanal roasting, slow culinary craftsmanship, and warm hospitality.
              </p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '18px', color: 'var(--text-muted)' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram"><Instagram size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook"><Facebook size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter"><Twitter size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Explore</h4>
              <ul className="footer-list">
                <li><Link href="/about">Our Story & Vision</Link></li>
                <li><Link href="/menu">Artisanal Menu</Link></li>
                <li><Link href="/gallery">Café Gallery</Link></li>
                <li><Link href="/offers">Combos & Offers</Link></li>
                <li><Link href="/events">Private Events</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Reservations</h4>
              <ul className="footer-list">
                <li><Link href="/reservation">Book a Table</Link></li>
                <li><Link href="/events">Party Inquiries</Link></li>
                <li><Link href="/contact">Location & Maps</Link></li>
                <li><a href="tel:+919876543210">+91 98765 43210</a></li>
                <li><a href="mailto:hello@raahicafe.com">hello@raahicafe.com</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Café Hours</h4>
              <ul className="footer-list" style={{ color: 'var(--text-muted)' }}>
                <li><strong>Mon – Fri:</strong> 8:00 AM – 11:00 PM</li>
                <li><strong>Sat – Sun:</strong> 8:00 AM – 12:00 Midnight</li>
                <li style={{ marginTop: '8px', color: 'var(--accent)' }}>
                  <MapPin size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  42 Heritage Lane, Indiranagar, Bangalore
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Raahi Café Management. All rights reserved.</p>
            <p>Designed with care for coffee lovers.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
