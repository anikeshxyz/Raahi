'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Menu as MenuIcon, X, CalendarCheck } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/menu', label: 'Menu' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/offers', label: 'Offers' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
];

export const HeaderNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="nav-brand" onClick={closeMenu}>
            <div className="brand-icon">
              <Coffee size={20} />
            </div>
            <div>
              <span className="brand-name">Raahi Café</span>
              <span className="brand-tagline">Artisanal Coffee & Stories</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav>
            <ul className="nav-desktop-menu">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/reservation" className="nav-cta" onClick={closeMenu}>
              <CalendarCheck size={16} />
              <span>Book a Table</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isOpen ? <X size={26} /> : <MenuIcon size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="drawer-link"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservation"
            className="nav-cta"
            style={{ textAlign: 'center', marginTop: '16px', justifyContent: 'center' }}
            onClick={closeMenu}
          >
            <CalendarCheck size={18} />
            <span>Reserve a Table</span>
          </Link>
        </div>
      )}
    </>
  );
};
