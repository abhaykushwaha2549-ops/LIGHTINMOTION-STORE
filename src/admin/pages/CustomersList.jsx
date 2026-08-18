// src/admin/pages/CustomersList.jsx
import React, { useState, useEffect } from 'react';
import { adminGetCustomers } from '../../api';
import { Users, Search, Mail, Phone } from 'lucide-react';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminGetCustomers();
        setCustomers(data || []);
      } catch (err) {
        console.error('Fetch customers error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="admin-page-title">Customers ({customers.length})</h1>
        <p className="admin-page-subtitle">View registered customers, purchase history, and lifetime spending.</p>
      </div>

      <div className="admin-card">
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading customer records...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No customer records found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{c.name}</div>
                  </td>
                  <td style={{ color: '#475569' }}>{c.email}</td>
                  <td style={{ color: '#475569' }}>{c.phone || 'N/A'}</td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{c.orders_count || 0}</span> orders
                  </td>
                  <td>
                    <strong style={{ color: '#008060' }}>₹{Number(c.total_spent || 0).toLocaleString('en-IN')}.00</strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
