import React from 'react';
import { ApprovalQueue } from './components/ApprovalQueue';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <header style={{
        backgroundColor: '#0d1b2a',
        color: '#fff',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}>
        <span style={{ fontSize: '1.6rem' }}>🛡️</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.02em' }}>
            DevSecOps Control Plane
          </h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#a0aec0' }}>
            Explainable AI · Automated Remediation · Human-in-the-Loop Approval
          </p>
        </div>
      </header>
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 20px' }}>
        <ApprovalQueue />
      </main>
    </div>
  );
}

export default App;
