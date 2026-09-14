import React from 'react';
import Link from 'next/link';
import { Tag, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Promotions, Combos & Special Offers — Raahi Café',
  description: 'Discover special pairings, morning ritual combos, and high tea promotions at Raahi Café Indiranagar.',
};

export default function OffersPage() {
  const OFFERS = [
    {
      title: 'Morning Ritual Combo',
      badge: 'Daily Breakfast',
      price: '₹349',
      originalPrice: '₹420',
      timing: '8:00 AM – 11:30 AM (Daily)',
      code: 'MORNINGBREW',
      description: 'Choice of any single estate manual pour-over or velvety flat white, paired with our freshly baked almond butter croissant.',
      features: [
        'Single Estate Chikmagalur Pour Over / Flat White',
        'Warm Almond Butter Croissant',
        'Free hot water refills',
      ],
    },
    {
      title: 'Sunset High Tea for Two',
      badge: 'Afternoon Delight',
      price: '₹799',
      originalPrice: '₹1,020',
      timing: '4:00 PM – 7:00 PM (Daily)',
      code: 'HIGHTEA2',
      description: 'An elegant tiered stand featuring fresh berry tarts, cucumber cream cheese sandwiches, and an artisanal pot of Darjeeling or Kashmiri Kahwa.',
      features: [
        'Choice of Artisan Tea Pot (serves two)',
        'Selection of 4 Gourmet Finger Sandwiches',
        '2 French Pastries & 2 Dark Chocolate Truffles',
      ],
    },
    {
      title: 'Weekend Sourdough Brunch Feast',
      badge: 'Weekend Special',
      price: '₹949',
      originalPrice: '₹1,250',
      timing: 'Saturdays & Sundays (9:00 AM – 2:00 PM)',
      code: 'WEEKENDRAAHI',
      description: 'The ultimate weekend brunch spread with loaded sourdough tartines, specialty cold brew tonic, and house-made granola yogurt bowls.',
      features: [
        'Any 2 Signature Sourdough Tartines',
        '2 Specialty Coffees or Coolers',
        'Wildflower Honey & Greek Granola Bowl',
      ],
    },
  ];

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Current Specials</span>
        <h1 className="section-title">Combos & Curated Pairings</h1>
        <p className="section-subtitle">
          Experience our kitchen and coffee bar pairings at special promotional prices. Simply mention the code when ordering or booking.
        </p>
      </header>

      <div className="responsive-grid responsive-grid-3">
        {OFFERS.map((offer) => (
          <div
            key={offer.title}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge-tag" style={{ margin: 0 }}>{offer.badge}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, background: 'rgba(217, 119, 6, 0.15)', padding: '4px 10px', borderRadius: '12px' }}>
                  CODE: {offer.code}
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{offer.title}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>{offer.price}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>{offer.originalPrice}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <Clock size={15} style={{ color: 'var(--accent)' }} />
                <span>{offer.timing}</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {offer.description}
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {offer.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-light)' }}>
                    <Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                href="/reservation"
                className="btn-submit"
                style={{ textDecoration: 'none', textAlign: 'center', padding: '12px' }}
              >
                <span>Reserve Table for this Offer</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
