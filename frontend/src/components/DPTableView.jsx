import React, { useState } from 'react';
import { Table, Search, Cpu, Database, Repeat, ArrowRight, CheckCircle2, Layers } from 'lucide-react';

export default function DPTableView({ dpData }) {
  if (!dpData || !dpData.dp_table) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
        <Database size={36} color="#475569" style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ fontWeight: 600 }}>Dynamic Programming state table not loaded.</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Run optimization to inspect the Held-Karp memoization table.</p>
      </div>
    );
  }

  const {
    subproblems_computed,
    total_memo_hits,
    theoretical_max_states,
    best_cost,
    dp_table,
    execution_time_ms
  } = dpData;

  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(dp_table[dp_table.length - 1] || null);

  // Available subset sizes
  const availableSizes = Array.from(new Set(dp_table.map((e) => e.subset_size))).sort((a, b) => a - b);

  const filteredEntries = dp_table.filter((entry) => {
    if (sizeFilter !== 'ALL' && entry.subset_size !== parseInt(sizeFilter, 10)) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inCurrent = entry.current_city.toLowerCase().includes(term);
      const inSubset = entry.cities.some((c) => c.toLowerCase().includes(term));
      if (!inCurrent && !inSubset) return false;
    }
    return true;
  });

  return (
    <div className="card">
      {/* Header & Concept */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Dynamic Programming: Bellman-Held-Karp Subproblem Table
            </h3>
            <span className="badge badge-purple">Bitmask Memoization</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Divides the itinerary into overlapping subproblems $(S, u)$, caching minimal costs to prevent redundant recalculation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Runtime: {execution_time_ms} ms
          </span>
        </div>
      </div>

      {/* Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.65rem',
        marginBottom: '1.25rem',
        padding: '0.85rem',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '0.5rem',
        border: '1px solid #1e293b'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Subproblems Solved</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>
            {subproblems_computed}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Unique $(S, u)$ states</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Memoization Hits</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
            {total_memo_hits}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Redundant calls avoided</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Theoretical Upper Bound</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
            {theoretical_max_states}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>$n \times 2^n$ state space</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Optimal Tour Cost</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
            ${best_cost || 'N/A'}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Verified global min</span>
        </div>
      </div>

      {/* Recurrence Formula Banner */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid #243247',
        borderRadius: '0.5rem',
        padding: '0.65rem 0.85rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          <strong style={{ color: '#a78bfa' }}>DAA Recurrence: </strong>
          <code>DP(S, u) = min [ DP(S \ {"{"}u{"}"}, v) + Cost(v, u) ]</code> subject to Arrival $\le$ Closing Hour
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Time Complexity: <strong>O(n² 2ⁿ)</strong> &nbsp;|&nbsp; Space: <strong>O(n 2ⁿ)</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subset Size |S|:</span>
          <button
            onClick={() => setSizeFilter('ALL')}
            style={{
              background: sizeFilter === 'ALL' ? '#8b5cf6' : 'transparent',
              color: sizeFilter === 'ALL' ? '#ffffff' : '#94a3b8',
              border: '1px solid',
              borderColor: sizeFilter === 'ALL' ? '#8b5cf6' : '#334155',
              borderRadius: '0.35rem',
              padding: '0.2rem 0.5rem',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            All Sizes
          </button>
          {availableSizes.map((sz) => (
            <button
              key={`size-btn-${sz}`}
              onClick={() => setSizeFilter(String(sz))}
              style={{
                background: sizeFilter === String(sz) ? '#8b5cf6' : 'transparent',
                color: sizeFilter === String(sz) ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: sizeFilter === String(sz) ? '#8b5cf6' : '#334155',
                borderRadius: '0.35rem',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              |S| = {sz}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: '180px' }}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          />
        </div>
      </div>

      {/* DP Table */}
      <div style={{ overflowX: 'auto', maxHeight: '380px', border: '1px solid #1e293b', borderRadius: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#111827', borderBottom: '1px solid #243247', color: '#94a3b8' }}>
              <th style={{ padding: '0.6rem 0.75rem' }}>|S|</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Bitmask</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Visited Subset S</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Current City u</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Predecessor v</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Optimal Sub-Cost</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Arrival Time</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>Memo Hits</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No subproblem states match the current filter.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row, idx) => {
                const isSelected = selectedEntry && selectedEntry.mask === row.mask && selectedEntry.current_city === row.current_city;

                return (
                  <tr
                    key={`dp-row-${idx}`}
                    onClick={() => setSelectedEntry(row)}
                    style={{
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(30, 41, 59, 0.2)',
                      borderBottom: '1px solid #1e293b',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#c084fc' }}>
                      {row.subset_size}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                      {row.mask_bin}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>
                      {"{"} {row.cities.join(', ')} {"}"}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                      {row.current_city}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#94a3b8' }}>
                      {row.predecessor}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#34d399' }}>
                      ${row.min_cost}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#fbbf24' }}>
                      {row.clock_time}h
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#a78bfa', fontWeight: 600 }}>
                      {row.memo_hits}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Subproblem Explainability Card */}
      {selectedEntry && (
        <div style={{
          marginTop: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8rem'
        }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Inspected Subproblem State: </span>
            <strong style={{ color: '#c084fc' }}>
              DP(S = {"{"} {selectedEntry.cities.join(', ')} {"}"}, {selectedEntry.current_city}) = ${selectedEntry.min_cost}
            </strong>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Optimal predecessor was <strong>{selectedEntry.predecessor}</strong>. Subproblem was queried and reused <strong>{selectedEntry.memo_hits} times</strong>.
            </div>
          </div>
          <div className="badge badge-purple">
            Memoized Subproblem
          </div>
        </div>
      )}
    </div>
  );
}
