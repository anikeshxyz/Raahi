import { Coffee, Compass, Feather, Leaf, HeartHandshake, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Our Journey & Philosophy — Raahi Café',
  description: 'Learn the story of Raahi Café: the spirit of the wanderer, single-origin Indian coffee beans, and slow food craftsmanship.',
};

export default function AboutPage() {
  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Our Story</span>
        <h1 className="section-title">The Spirit of Raahi</h1>
        <p className="section-subtitle">
          In Hindustani, <em>Raahi</em> means "the traveler" or "wayfarer". We built this café as a welcoming pit stop for every soul seeking pause, connection, and craft.
        </p>
      </header>

      {/* Narrative Section */}
      <section style={{ maxWidth: '840px', margin: '0 auto 64px', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-light)' }}>
        <p style={{ marginBottom: '20px' }}>
          Raahi began with a simple observation: modern life moves at a dizzying pace, and the traditional café experience has often been reduced to paper cups and transactional drive-throughs.
        </p>
        <p style={{ marginBottom: '20px' }}>
          We envisioned something timeless—a space where you can smell freshly ground beans the moment you step through our wooden doorway, hear the gentle hum of conversations, and taste the difference that 36 hours of sourdough fermentation makes.
        </p>
        <p>
          Whether you visit us with a laptop to write your next chapter, with a companion to share laughter over hot cinnamon buns, or simply with your thoughts, Raahi is built to be your home away from home.
        </p>
      </section>

      {/* Pillars Grid */}
      <section style={{ marginBottom: '64px' }}>
        <div className="section-header" style={{ marginBottom: '36px' }}>
          <span className="badge-tag">Core Commitments</span>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>How We Craft Our Offerings</h2>
        </div>

        <div className="responsive-grid responsive-grid-3">
          <div className="card">
            <div style={{ color: 'var(--accent)', marginBottom: '14px' }}>
              <Coffee size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Direct-Trade Coffee</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              We partner directly with fourth-generation coffee growers in the Western Ghats of Karnataka. We pay above fair-trade minimums to support regenerative agriculture.
            </p>
          </div>

          <div className="card">
            <div style={{ color: 'var(--accent)', marginBottom: '14px' }}>
              <Compass size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Purity in Ingredients</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Zero artificial flavor syrups or pre-made baking mixes. Our vanilla is Madagascar bean, our chocolate is Belgian single-origin, and our breads are made from organic flours.
            </p>
          </div>

          <div className="card">
            <div style={{ color: 'var(--accent)', marginBottom: '14px' }}>
              <Leaf size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Sustainability & Care</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              100% biodegradable takeaway packaging made from bagasse and cornstarch. Coffee grounds are composted and provided free to local garden lovers.
            </p>
          </div>
        </div>
      </section>

      {/* Coffee Origin Spotlight */}
      <section className="card" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: '64px', background: 'linear-gradient(135deg, var(--bg-card), #2a1f18)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
          <div>
            <span className="badge-tag">Origin Spotlight</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', marginBottom: '12px' }}>
              The Western Ghats Canopy Roasts
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Grown at 4,200 feet above sea level under a biodiverse canopy of silver oaks, wild fig, and black pepper vines, our beans develop natural complex sugars that translate to a rich, syrupy cup with low acidity.
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '20px' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>4,200 ft</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Elevation</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shade-Grown Arabica</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>Micro-Lot</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Small Batch Roasted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link href="/menu" className="nav-cta" style={{ padding: '14px 30px' }}>
          <span>Discover the Menu We Love</span>
        </Link>
      </div>
    </div>
  );
}
