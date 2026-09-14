'use client';

import React, { useState } from 'react';
import { Camera, Eye, Sparkles } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'The Courtyard Seating',
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    description: 'Sun-dappled open-air brick patio surrounded by monstera and ficus trees.',
  },
  {
    id: 2,
    title: 'Manual Pour-Over Bar',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    description: 'Precision water kettle temperature and bloom timing on our Chemex & V60 station.',
  },
  {
    id: 3,
    title: 'Morning Croissant Batch',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
    description: 'Golden, buttery, multi-layered viennoiserie fresh out of our stone deck ovens at 7:30 AM.',
  },
  {
    id: 4,
    title: 'Acoustic Saturdays',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    description: 'Intimate candlelight music sessions featuring local indie singers and poets.',
  },
  {
    id: 5,
    title: 'The Reading Nook & Library',
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
    description: 'Floor-to-ceiling wooden bookshelves curated with travelogues, poetry, and philosophy.',
  },
  {
    id: 6,
    title: 'Velvet Latte Art',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800',
    description: 'Barista free-pour swans and rosettas using silky micro-foamed milk.',
  },
  {
    id: 7,
    title: 'Sourdough Burrata Tartine',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800',
    description: 'Heirloom tomatoes, organic genovese basil pesto, and fresh artisanal burrata.',
  },
  {
    id: 8,
    title: 'Coffee Brewing Masterclass',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    description: 'Hands-on weekend workshops exploring grind sizes, water TDS, and extraction ratios.',
  },
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems =
    activeFilter === 'all'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  const filters = [
    { key: 'all', label: 'All Photos' },
    { key: 'ambience', label: 'Ambience & Spaces' },
    { key: 'coffee', label: 'Coffee Craft' },
    { key: 'food', label: 'Food & Bakes' },
    { key: 'events', label: 'Events & Nights' },
  ];

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Visual Journey</span>
        <h1 className="section-title">The Raahi Atmosphere</h1>
        <p className="section-subtitle">
          Immerse yourself in moments captured at our café—from steam rising off fresh pour-overs to cozy corner conversations.
        </p>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: activeFilter === f.key ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: activeFilter === f.key ? 'var(--primary)' : 'var(--bg-card)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(15, 13, 11, 0.85)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}
              >
                {item.category}
              </span>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
