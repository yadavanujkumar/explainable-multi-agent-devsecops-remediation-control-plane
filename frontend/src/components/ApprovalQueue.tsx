import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Remediation {
  id: string;
  event_id: string;
  vulnerability: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score: number;
  proposed_patch: string;
  xai_explanation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const SEVERITY_STYLES: Record<string, React.CSSProperties> = {
  critical: { backgroundColor: '#dc3545', color: '#fff' },
  high:     { backgroundColor: '#fd7e14', color: '#fff' },
  medium:   { backgroundColor: '#ffc107', color: '#212529' },
  low:      { backgroundColor: '#198754', color: '#fff' },
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  pending:  { backgroundColor: '#0d6efd', color: '#fff' },
  approved: { backgroundColor: '#198754', color: '#fff' },
  rejected: { backgroundColor: '#6c757d', color: '#fff' },
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '3px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginRight: '6px',
};

export const ApprovalQueue: React.FC = () => {
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  useEffect(() => {
    fetchRemediations();
  }, [statusFilter, severityFilter]);

  const fetchRemediations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter)   params.status   = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const response = await axios.get<Remediation[]>('/api/v1/remediations', { params });
      setRemediations(response.data);
    } catch {
      setError('Failed to fetch remediations. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/v1/remediations/${id}/approve`);
      fetchRemediations();
    } catch {
      alert('Failed to approve patch.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`/api/v1/remediations/${id}/reject`);
      fetchRemediations();
    } catch {
      alert('Failed to reject patch.');
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const pendingCount  = remediations.filter(r => r.status === 'pending').length;
  const approvedCount = remediations.filter(r => r.status === 'approved').length;
  const rejectedCount = remediations.filter(r => r.status === 'rejected').length;

  return (
    <div>
      {/* Summary Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Pending',  value: pendingCount,  color: '#0d6efd' },
          { label: 'Approved', value: approvedCount, color: '#198754' },
          { label: 'Rejected', value: rejectedCount, color: '#6c757d' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 100px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${s.color}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Filter by:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(statusFilter || severityFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setSeverityFilter(''); }}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#f8f9fa' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* List */}
      <h2 style={{ marginTop: 0 }}>Remediations</h2>

      {loading && <div>Loading...</div>}
      {error   && <div style={{ color: '#dc3545' }}>Error: {error}</div>}

      {!loading && !error && remediations.length === 0 && (
        <p>No remediations match the current filters.</p>
      )}

      {!loading && !error && remediations.map((rem) => (
        <div
          key={rem.id}
          style={{
            border: '1px solid #dee2e6',
            padding: '16px',
            marginBottom: '16px',
            borderRadius: '8px',
            borderLeft: `4px solid ${(SEVERITY_STYLES[rem.severity] || {}).backgroundColor ?? '#ccc'}`,
            background: '#fff',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>{rem.vulnerability}</h3>
            <div>
              <span style={{ ...badgeStyle, ...SEVERITY_STYLES[rem.severity] }}>{rem.severity}</span>
              <span style={{ ...badgeStyle, ...STATUS_STYLES[rem.status] }}>{rem.status}</span>
            </div>
          </div>

          {/* Meta */}
          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '10px' }}>
            ID: {rem.id} &nbsp;·&nbsp; Event: {rem.event_id}
            {rem.confidence_score > 0 && <> &nbsp;·&nbsp; Confidence: {(rem.confidence_score * 100).toFixed(0)}%</>}
            {rem.created_at && <> &nbsp;·&nbsp; {formatDate(rem.created_at)}</>}
          </div>

          {/* XAI Explanation */}
          <p style={{ margin: '0 0 8px' }}>
            <strong>XAI Explanation:</strong> {rem.xai_explanation}
          </p>

          {/* Proposed Patch */}
          <pre style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            padding: '10px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: '0 0 12px',
          }}>
            {rem.proposed_patch}
          </pre>

          {/* Actions */}
          {rem.status === 'pending' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleApprove(rem.id)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#198754',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✓ Approve Patch
              </button>
              <button
                onClick={() => handleReject(rem.id)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
