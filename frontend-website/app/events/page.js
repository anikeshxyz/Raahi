'use client';

import React, { useState } from 'react';
import { PartyPopper, Users, Sparkles, CheckCircle2, Send, Calendar } from 'lucide-react';

export default function EventsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Party',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/website-cms/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to submit inquiry'));
      }

      setStatusMessage('Thank you! Your event enquiry has been received. Our events manager will contact you within 24 hours with custom packages.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'Party',
        message: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const EVENT_TYPES = [
    {
      title: 'Birthday & Anniversary Gatherings',
      capacity: 'Up to 35 guests',
      desc: 'Dedicated terrace section, customized dessert table with Belgian chocolate cakes, ambient fairy lights, and personalized playlist support.',
    },
    {
      title: 'Corporate Offsites & Workshops',
      capacity: '15 to 40 guests',
      desc: 'High-speed fiber WiFi, projector and screen setup, endless filter coffee / pour-overs, and curated artisanal working lunch bowls.',
    },
    {
      title: 'Coffee Brewing Masterclasses',
      capacity: '6 to 12 guests',
      desc: 'Interactive hands-on session with our head barista learning espresso calibration, manual pour-over physics, and sensory cupping.',
    },
  ];

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Host with Us</span>
        <h1 className="section-title">Events & Private Gatherings</h1>
        <p className="section-subtitle">
          Celebrate milestones, host corporate brainstorms, or hold private dinners in our serene courtyard and brick-walled lounge.
        </p>
      </header>

      {/* Event Types */}
      <div className="responsive-grid responsive-grid-3" style={{ marginBottom: '64px' }}>
        {EVENT_TYPES.map((evt) => (
          <div key={evt.title} className="card">
            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              <PartyPopper size={28} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              {evt.capacity}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>{evt.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {evt.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Inquiry Form */}
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="badge-tag">Custom Event Booking</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '8px' }}>Enquire About Your Event</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Tell us about your expected date, party size, and preferred menu requirements.
          </p>
        </div>

        {statusMessage && (
          <div className="alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>Enquiry Submitted!</span>
            </div>
            <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>{statusMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="alert-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-control">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Vikramaditya Rao"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="form-label">Event Category</label>
            <select
              className="form-select"
              value={formData.inquiryType}
              onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
            >
              <option value="Party">Birthday / Anniversary Party</option>
              <option value="Corporate">Corporate Meeting / Workshop</option>
              <option value="Event">Private Terrace Dining</option>
              <option value="General">Other Custom Gathering</option>
            </select>
          </div>

          <div className="form-control form-control-full">
            <label className="form-label">Event Details & Estimated Date / Guest Count</label>
            <textarea
              required
              className="form-textarea"
              placeholder="Provide estimated date, timing, number of guests, and any specific culinary preferences..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="form-control-full">
            <button type="submit" disabled={loading} className="btn-submit">
              <Send size={18} />
              <span>{loading ? 'Submitting Details...' : 'Send Event Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
