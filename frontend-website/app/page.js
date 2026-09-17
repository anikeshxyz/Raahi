import Link from 'next/link';
import { Coffee, Sparkles, Utensils, Star, MapPin, Clock, ArrowRight, Heart, Award } from 'lucide-react';

export const metadata = {
  title: 'Raahi Café — Artisanal Roasts, Fresh Bakes & Warm Ambience',
  description: 'Welcome to Raahi Café in Indiranagar, Bangalore. Discover specialty single-origin coffees, handcrafted sourdoughs, and cozy corners.',
};

export default function HomePage() {
  const popularItems = [
    {
      name: 'Chikmagalur Pour Over (V60)',
      category: 'Artisanal Coffee',
      price: '₹240',
      desc: 'Single estate washed Arabica with tasting notes of cocoa nibs and hazelnut.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    },
    {
      name: 'Avocado & Truffle Mushroom Toast',
      category: 'Sourdough',
      price: '₹360',
      desc: 'Fresh Hass avocado, sautéed forest mushrooms, and white truffle oil on 36h sourdough.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
    },
    {
      name: 'Iced Spanish Latte',
      category: 'Cold Brews',
      price: '₹260',
      desc: 'Velvety espresso with condensed milk, chilled milk, and cinnamon dust.',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
    },
    {
      name: 'Belgian Dark Chocolate Tart',
      category: 'Pastry',
      price: '₹290',
      desc: '70% Callebaut dark chocolate silk ganache sprinkled with flaky sea salt.',
      image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600',
    },
  ];

  const reviews = [
    {
      name: 'Dr. Aditi Mukherjee',
      rating: 5,
      review: 'Raahi has ruined regular café coffee for me. Their V60 pour over is extraordinary, and the courtyard seating is an absolute peaceful haven in Bangalore.',
      tag: 'Coffee Connoisseur',
    },
    {
      name: 'Vikramaditya Rao',
      rating: 5,
      review: 'The sourdough truffle mushroom toast is simply unforgettable. Perfect place to sit with a book, meet friends, or work remotely with fast WiFi.',
      tag: 'Regular Guest',
    },
    {
      name: 'Sneha & Rohan',
      rating: 5,
      review: 'Hosted our anniversary high-tea here. The staff made it effortless, the food was exquisite, and the aesthetic decor created gorgeous photos!',
      tag: 'Private Event Guest',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero-content">
          <div className="badge-tag">
            <Sparkles size={14} />
            <span>Bangalore’s Artisanal Coffee Haven</span>
          </div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '20px' }}>
            Where Every Sip Tells a Story & Every Corner Welcomes You
          </h1>
          <p className="section-subtitle">
            Named after the traveler, <strong>Raahi Café</strong> celebrates mindful living, single-origin Indian roasts, and European bakery traditions crafted fresh daily.
          </p>

          <div className="hero-actions">
            <Link href="/menu" className="nav-cta" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
              <Coffee size={18} />
              <span>Explore Our Menu</span>
            </Link>
            <Link href="/reservation" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
              <span>Reserve a Table</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container">
        {/* Café Intro / Pillars */}
        <section style={{ marginBottom: '80px' }}>
          <div className="section-header">
            <span className="badge-tag">The Raahi Philosophy</span>
            <h2 className="section-title">Crafted with Intention</h2>
            <p className="section-subtitle">
              From bean to cup, every ingredient is ethically sourced and handled with precision.
            </p>
          </div>

          <div className="responsive-grid responsive-grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Coffee size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Single-Estate Roasts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Handpicked shade-grown beans from certified sustainable estates across Chikmagalur, roasted in micro-lots for maximum aromatic clarity.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Utensils size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>36h Slow Sourdough</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Naturally leavened doughs baked fresh every morning, paired with organic compound butters, cold-pressed oils, and farm cheese.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Soulful Atmosphere</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Thoughtfully tuned acoustics, lush indoor foliage, ergonomic wood seating, and dedicated power sockets for quiet remote work.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Items Showcase */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge-tag">House Favorites</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Most Loved by Guests</h2>
            </div>
            <Link href="/menu" style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>View Complete Menu</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
            {popularItems.map((item) => (
              <div key={item.name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '190px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(15, 13, 11, 0.85)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.name}</h3>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem' }}>{item.price}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Offers Highlight */}
        <section style={{ marginBottom: '80px', background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(20, 16, 13, 0.8))', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-lg)', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 28px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <span className="badge-tag" style={{ background: 'var(--accent)', color: '#000' }}>Limited Time Combo</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', marginBottom: '8px' }}>
                Morning Brew & Bake: Pour-Over + Almond Croissant at ₹349
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Available daily from 8:00 AM to 11:30 AM. Start your morning with artisanal excellence.
              </p>
            </div>
            <Link href="/offers" className="nav-cta">
              <span>View All Offers</span>
            </Link>
          </div>
        </section>

        {/* Guest Reviews */}
        <section style={{ marginBottom: '80px' }}>
          <div className="section-header">
            <span className="badge-tag">Community Love</span>
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-subtitle">Over 1,200+ five-star experiences in Indiranagar.</p>
          </div>

          <div className="responsive-grid responsive-grid-3">
            {reviews.map((rev) => (
              <div key={rev.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px', color: 'var(--accent)', marginBottom: '14px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="var(--accent)" />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.92rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px' }}>
                    "{rev.review}"
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>{rev.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location & Reservation CTA */}
        <section className="card" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)', textAlign: 'center' }}>
          <span className="badge-tag">Visit Us Today</span>
          <h2 className="section-title" style={{ marginBottom: '12px' }}>A Warm Seat is Waiting for You</h2>
          <p className="section-subtitle" style={{ marginBottom: '28px' }}>
            Located on 42 Heritage Lane in Indiranagar, Bangalore. Step in for morning brews, leisurely terrace brunches, or late-night dessert cravings.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/reservation" className="nav-cta" style={{ padding: '14px 28px' }}>
              <span>Reserve Table Online</span>
            </Link>
            <a
              href="https://maps.google.com/?q=Raahi+Cafe+Indiranagar+Bangalore"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '14px 28px' }}
            >
              <MapPin size={18} />
              <span>Get Directions</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
