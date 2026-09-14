'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Search, CheckCircle, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/v1/website-cms/menu`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
          setDataSource('live');
        }
      } catch (err) {
        console.warn('[Menu] Live backend API fetch deferred or offline, loading cached menu:', err);
        // Resilient fallback with authentic items
        setCategories(getFallbackMenuData());
        setDataSource('cached');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Filter items
  const allItems = categories.flatMap((cat) =>
    (cat.items || []).map((item) => ({
      ...item,
      categoryName: cat.name,
      categorySlug: cat.slug,
    }))
  );

  const filteredItems = allItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.categorySlug === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegOnly || item.isVegetarian;

    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Artisanal Offerings</span>
        <h1 className="section-title">The Raahi Menu</h1>
        <p className="section-subtitle">
          Single-origin estate roasts, ceremonial grade infusions, slow sourdough bakes, and European pastry craft.
        </p>
      </header>

      {/* Control Bar: Search & Veg Toggle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '42px' }}
              placeholder="Search dishes, coffees, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Veg Only Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--veg-color)' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)' }}>
              🟢 Vegetarian Only
            </span>
          </label>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedCategory === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Items ({allItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: selectedCategory === cat.slug ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: selectedCategory === cat.slug ? 'var(--primary)' : 'var(--bg-surface)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Coffee size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent)' }} />
          <p>Loading fresh café menu from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '16px' }}>
            No menu items found matching "{searchQuery}"
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setVegOnly(false);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Menu Grid */
        <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {filteredItems.map((item) => (
            <div key={item._id || item.name} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
              {item.imageUrl && (
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15, 13, 11, 0.85)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: item.isVegetarian ? 'var(--veg-color)' : 'var(--nonveg-color)' }}>●</span>
                    <span>{item.isVegetarian ? 'Vegetarian' : 'Non-Veg'}</span>
                  </div>
                  <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(15, 13, 11, 0.9)', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, color: 'var(--accent)', fontSize: '1.05rem', boxShadow: 'var(--shadow-sm)' }}>
                    ₹{item.price}
                  </span>
                </div>
              )}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                    {item.categoryName}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-light)' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                    +5% GST Applicable
                  </span>
                  <Link
                    href="/reservation"
                    style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Reserve Table to Taste
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Banner */}
      <div className="card" style={{ textAlign: 'center', marginTop: '64px', padding: '36px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Have Dietary Inquiries or Custom Roast Preferences?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
          Our baristas and culinary team are glad to accommodate dairy alternatives (Oat, Almond, Soy) and gluten-sensitive requests.
        </p>
        <Link href="/contact" className="btn-secondary">
          Inquire with our Barista Team
        </Link>
      </div>
    </div>
  );
}

// Resilient Fallback Data for offline development
function getFallbackMenuData() {
  return [
    {
      name: 'Artisanal Coffee',
      slug: 'artisanal-coffee',
      items: [
        {
          _id: 'fb-1',
          name: 'Chikmagalur Pour Over (V60)',
          price: 240,
          description: 'Single-origin estate Arabica with notes of dark cocoa and cranberry.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        },
        {
          _id: 'fb-2',
          name: 'Signature Flat White',
          price: 220,
          description: 'Double shot of velvety espresso layered with silky micro-foamed milk.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600',
        },
        {
          _id: 'fb-3',
          name: 'Iced Spanish Latte',
          price: 260,
          description: 'Rich espresso over sweet condensed milk, whole milk, and crushed ice.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
        },
      ],
    },
    {
      name: 'Handcrafted Teas',
      slug: 'handcrafted-teas',
      items: [
        {
          _id: 'fb-4',
          name: 'Kashmiri Saffron Kahwa',
          price: 230,
          description: 'Whole saffron strands, green cardamom, cinnamon, and slivered almonds.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600',
        },
        {
          _id: 'fb-5',
          name: 'Ceremonial Uji Matcha Latte',
          price: 280,
          description: 'Stone-ground ceremonial grade Japanese matcha whisked with plant milk.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
        },
      ],
    },
    {
      name: 'Sourdough & Toasts',
      slug: 'sourdough-and-toasts',
      items: [
        {
          _id: 'fb-6',
          name: 'Avocado & Truffle Mushroom Sourdough',
          price: 360,
          description: 'Hass avocado mash, sautéed wild mushrooms, and white truffle essence.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
        },
        {
          _id: 'fb-7',
          name: 'Burrata & Heirloom Tomato Tartine',
          price: 390,
          description: 'Creamy burrata, marinated heirloom tomatoes, and aged balsamic glaze.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600',
        },
      ],
    },
    {
      name: 'Fresh Bakery & Desserts',
      slug: 'bakery-and-desserts',
      items: [
        {
          _id: 'fb-8',
          name: 'French Butter Croissant',
          price: 180,
          description: '27-layer laminated French butter croissant, baked golden every morning.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
        },
        {
          _id: 'fb-9',
          name: 'Belgian Dark Chocolate Ganache Tart',
          price: 290,
          description: '70% single-origin dark chocolate silk ganache in crisp sablé shell.',
          isVegetarian: true,
          imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600',
        },
      ],
    },
  ];
}
