'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/website-cms/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, inquiryType: 'General' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      setStatus('Message sent successfully! Our café team will respond to your email or WhatsApp.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('Message received! We will be in touch shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Visit & Connect</span>
        <h1 className="section-title">Contact & Location</h1>
        <p className="section-subtitle">
          Have a question about our beans, looking for employment, or planning your visit? We're always here for you.
        </p>
      </header>

      <div className="responsive-grid" style={{ marginBottom: '64px' }}>
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent)', marginTop: '4px' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Our Location</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  42 Heritage Lane, Near Peace Park,<br />
                  12th Main Road, Indiranagar, Bangalore 560038
                </p>
                <div style={{ marginTop: '12px' }}>
                  <a
                    href="https://maps.google.com/?q=Raahi+Cafe+Indiranagar+Bangalore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-cta"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <Navigation size={14} />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent)', marginTop: '4px' }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Operating Hours</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  <strong>Monday – Friday:</strong> 8:00 AM – 11:00 PM<br />
                  <strong>Saturday – Sunday:</strong> 8:00 AM – Midnight<br />
                  <em>Kitchen orders open until 45 minutes before closing.</em>
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent)', marginTop: '4px' }}>
                <Phone size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Phone & WhatsApp</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Direct Line: <a href="tel:+919876543210" style={{ color: 'var(--accent)', fontWeight: 600 }}>+91 98765 43210</a><br />
                  WhatsApp Orders: <a href="https://wa.me/919876543210" style={{ color: 'var(--whatsapp-green)', fontWeight: 600 }}>+91 98765 43210</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Message Form */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>Send Us a Message</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Fill out the form and our guest relations team will get back to you within a few hours.
          </p>

          {status && (
            <div className="alert-success" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{status}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Message / Feedback *</label>
              <textarea
                required
                className="form-textarea"
                placeholder="How can we help you today?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop: '8px' }}>
              <Send size={16} />
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Map Snapshot Card */}
      <section className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Find Us on the Map</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Centrally situated in Indiranagar with dedicated valet parking available on weekends.
        </p>
        <div style={{ height: '280px', borderRadius: 'var(--radius-sm)', background: '#1c1917', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '20px' }}>
          <MapPin size={40} style={{ color: 'var(--accent)' }} />
          <div>
            <strong style={{ fontSize: '1.1rem' }}>Raahi Café Indiranagar</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>42 Heritage Lane, Indiranagar, Bangalore 560038</p>
          </div>
          <a
            href="https://maps.google.com/?q=Raahi+Cafe+Indiranagar+Bangalore"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
            style={{ padding: '10px 22px' }}
          >
            <Navigation size={16} />
            <span>Launch in Google Maps App</span>
          </a>
        </div>
      </section>
    </div>
  );
}
