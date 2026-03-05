import React from 'react';
import { ApprovalQueue } from './components/ApprovalQueue';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>DevSecOps Control Plane</h1>
        <p>Explainable AI Remediation Dashboard</p>
      </header>
      <main>
        <ApprovalQueue />
      </main>
    </div>
  );
}

export default App;
