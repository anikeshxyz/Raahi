import React from 'react';
import { MessageCircle, Phone, Navigation } from 'lucide-react';

export const QuickActions = () => {
  return (
    <aside className="quick-action-bar" aria-label="Quick contact and directions">
      <a
        href="https://wa.me/919876543210?text=Hello%20Raahi%20Caf%C3%A9%2C%20I%20would%20like%20to%20enquire%20about..."
        target="_blank"
        rel="noopener noreferrer"
        className="action-fab fab-whatsapp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </a>

      <a
        href="tel:+919876543210"
        className="action-fab fab-call"
        title="Call Raahi Café"
      >
        <Phone size={18} />
        <span>Call</span>
      </a>

      <a
        href="https://maps.google.com/?q=Raahi+Cafe+Indiranagar+Bangalore"
        target="_blank"
        rel="noopener noreferrer"
        className="action-fab fab-directions"
        title="Get Directions"
      >
        <Navigation size={18} />
        <span>Directions</span>
      </a>
    </aside>
  );
};
