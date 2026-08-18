// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Award, Sparkles, Box, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px 100px' }}>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px' }}>
        <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          ENGINEERED IN INDIA
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '16px' }}>
          Crafting Precision Lighting for Modern Setups
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7 }}>
          LIGHTINMOTION was founded on a simple premise: ambient lighting shouldn’t be flimsy plastic with messy wiring. We build minimal, solid-aluminum RGB fixtures designed specifically for gaming battle stations, creator desks, and home theater backdrops.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '70px' }}>
        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px 24px' }}>
          <Box size={28} color="#38bdf8" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '10px' }}>Premium Hardware</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Every light bar and strip is built with aviation-grade aluminum and dense, diffused optical silicone for flicker-free lighting.
          </p>
        </div>

        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px 24px' }}>
          <Zap size={28} color="#38bdf8" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '10px' }}>Zero-Lag Sync</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            High-speed controllers deliver instant audio visualization and monitor screen mirroring with low latency.
          </p>
        </div>

        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px 24px' }}>
          <ShieldCheck size={28} color="#38bdf8" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '10px' }}>1-Year Direct Warranty</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            All fixtures include 12 months of door-to-door replacement coverage dispatched directly from our Baddi fulfillment center.
          </p>
        </div>
      </div>

      <div style={{ background: '#090a0e', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '48px 36px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>
          Elevate Your Desktop Ambience
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
          Explore our collection of addressable barlights, RGB strips, and screen backlights.
        </p>
        <Link to="/shop" className="btn-primary-blue">
          Explore All Products
        </Link>
      </div>
    </div>
  );
}
