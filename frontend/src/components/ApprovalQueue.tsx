import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Remediation {
  id: string;
  vulnerability: string;
  proposed_patch: string;
  xai_explanation: string;
  status: string;
}

export const ApprovalQueue: React.FC = () => {
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRemediations();
  }, []);

  const fetchRemediations = async () => {
    try {
      const response = await axios.get<Remediation[]>('/api/v1/remediations');
      setRemediations(response.data);
    } catch (err) {
      setError('Failed to fetch remediations.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/v1/remediations/${id}/approve`);
      alert('Patch Approved and Merged!');
      fetchRemediations();
    } catch (err) {
      alert('Failed to approve patch.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Pending Approvals</h2>
      {remediations.length === 0 ? (
        <p>No pending remediations.</p>
      ) : (
        remediations.map((rem) => (
          <div key={rem.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <h3>{rem.vulnerability}</h3>
            <p><strong>XAI Explanation:</strong> {rem.xai_explanation}</p>
            <pre style={{ backgroundColor: '#f4f4f4', padding: '10px' }}>{rem.proposed_patch}</pre>
            <p>Status: {rem.status}</p>
            {rem.status === 'pending' && (
              <button onClick={() => handleApprove(rem.id)} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Approve Patch
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};
