'use client';

import React, { useState } from 'react';
import { CalendarCheck, Users, Clock, CheckCircle2, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ReservationPage() {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: today,
    time: '19:30',
    guestCount: 2,
    specialRequests: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  const TIME_SLOTS = [
    '08:30 AM (Breakfast)',
    '10:30 AM (Brunch)',
    '12:30 PM (Lunch)',
    '02:00 PM (Afternoon Coffee)',
    '04:30 PM (Sunset High Tea)',
    '07:00 PM (Dinner)',
    '08:30 PM (Dinner)',
    '10:00 PM (Late Night Brews)',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages([]);
    setSuccessData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/v1/website-cms/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setErrorMessages(result.errors);
        } else {
          setErrorMessages([result.message || 'Failed to submit reservation']);
        }
        return;
      }

      setSuccessData(result.data);
    } catch (err) {
      setErrorMessages(['Could not connect to the reservation system. Please call us directly at +91 98765 43210.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="section-header">
        <span className="badge-tag">Table Booking</span>
        <h1 className="section-title">Reserve Your Table</h1>
        <p className="section-subtitle">
          Secure your cozy table, terrace seating, or work nook in advance. We hold tables for 15 minutes past booking time.
        </p>
      </header>

      <div className="form-card">
        {successData ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
              Reservation Request Confirmed!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Thank you, <strong>{successData.name}</strong>! We have received your booking request for{' '}
              <strong>{successData.guestCount} guest(s)</strong> on <strong>{successData.date}</strong> at{' '}
              <strong>{successData.time}</strong>.
            </p>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '28px',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Reference:</span>
                <strong style={{ color: 'var(--accent)' }}>#{String(successData.reservationId).slice(-6).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{successData.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Venue:</span>
                <span>Raahi Café, Indiranagar</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    date: today,
                    time: '19:30',
                    guestCount: 2,
                    specialRequests: '',
                  });
                }}
              >
                Book Another Table
              </button>
              <Link href="/menu" className="nav-cta">
                Browse Café Menu
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            {errorMessages.length > 0 && (
              <div className="alert-error form-control-full">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                  <AlertCircle size={18} />
                  <span>Please check the errors below:</span>
                </div>
                <ul style={{ paddingLeft: '20px' }}>
                  {errorMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-control">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ananya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="form-label">Phone Number *</label>
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
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="ananya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="form-label">Reservation Date *</label>
              <input
                type="date"
                required
                min={today}
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="form-label">Preferred Time Slot *</label>
              <select
                className="form-select"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="form-label">Number of Guests *</label>
              <input
                type="number"
                required
                min={1}
                max={30}
                className="form-input"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
              />
            </div>

            <div className="form-control form-control-full">
              <label className="form-label">Special Seating or Dietary Notes (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Quiet outdoor corner table preferred, baby high-chair needed, celebrating a birthday..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              />
            </div>

            <div className="form-control-full">
              <button type="submit" disabled={loading} className="btn-submit">
                <CalendarCheck size={18} />
                <span>{loading ? 'Submitting Reservation...' : 'Confirm Table Reservation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ maxWidth: '600px', margin: '40px auto 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>
          Need an immediate reservation within the next 2 hours or party sizes above 20? Please call our floor manager directly at{' '}
          <a href="tel:+919876543210" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            +91 98765 43210
          </a>.
        </p>
      </div>
    </div>
  );
}
