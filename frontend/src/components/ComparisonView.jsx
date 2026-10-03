import React from 'react';
import { 
  BarChart3, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Scissors, 
  HelpCircle, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function ComparisonView({ comparisonMatrix, explainability }) {
  if (!comparisonMatrix || comparisonMatrix.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
        <BarChart3 size={36} color="#475569" style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ fontWeight: 600 }}>No comparison data available.</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Run optimization with "Compare All Algorithms" to populate benchmark metrics.</p>
      </div>
    );
  }

  const {
    summary,
    branch_and_bound_analysis,
    dynamic_programming_analysis,
    greedy_analysis,
    theoretical_complexity
  } = explainability || {};

  return (
    <div className="card">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Algorithm Comparison & DAA Benchmark
            </h3>
            <span className="badge badge-blue">DAA Performance Matrix</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Empirical comparison of Branch and Bound, Dynamic Programming (Held-Karp), and Greedy Heuristic.
          </p>
        </div>
      </div>

      {/* Summary Alert */}
      {summary && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '0.5rem',
          marginBottom: '1.25rem',
          color: '#93c5fd',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Sparkles size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
          <span>{summary}</span>
        </div>
      )}

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #1e293b', borderRadius: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#111827', borderBottom: '1px solid #243247', color: '#94a3b8' }}>
              <th style={{ padding: '0.65rem 0.85rem' }}>Algorithm</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Tour Cost</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Trip Duration</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Runtime (ms)</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>States / Nodes</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Pruned / Memo Hits</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Optimality Guarantee</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Feasible?</th>
            </tr>
          </thead>
          <tbody>
            {comparisonMatrix.map((row, idx) => {
              const isBB = row.algorithm.includes('Branch');
              const isDP = row.algorithm.includes('Dynamic');
              const isGreedy = row.algorithm.includes('Greedy');

              let badgeStyle = 'badge-blue';
              if (isBB) badgeStyle = 'badge-emerald';
              if (isDP) badgeStyle = 'badge-purple';
              if (isGreedy) badgeStyle = 'badge-amber';

              return (
                <tr
                  key={`comp-${idx}`}
                  style={{
                    background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(30, 41, 59, 0.2)',
                    borderBottom: '1px solid #1e293b'
                  }}
                >
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    <span className={`badge ${badgeStyle}`} style={{ fontSize: '0.7rem' }}>
                      {row.algorithm}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                    ${row.cost || 'N/A'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                    {row.duration_hours ? `${row.duration_hours}h` : 'N/A'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                    {row.execution_time_ms} ms
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                    {row.states_or_nodes}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#34d399', fontWeight: 600 }}>
                    {row.pruned_or_hits}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                    {row.guarantee}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    {row.feasible ? (
                      <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Yes
                      </span>
                    ) : (
                      <span style={{ color: '#fb7185', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={14} /> Infeasible
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Why Result Was Selected (Explainability Insights) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <HelpCircle size={16} color="#60a5fa" />
          <span>Decision Explainability: Why Was This Itinerary Selected?</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          
          {/* Branch & Bound Insight */}
          {branch_and_bound_analysis && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Scissors size={14} /> Branch & Bound Pruning Power
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {branch_and_bound_analysis.insight}
              </p>
            </div>
          )}

          {/* Dynamic Programming Insight */}
          {dynamic_programming_analysis && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Layers size={14} /> Dynamic Programming Subproblem Cache
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {dynamic_programming_analysis.insight}
              </p>
            </div>
          )}

          {/* Greedy Heuristic Insight */}
          {greedy_analysis && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} /> Greedy Trade-Off & Optimality Gap
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {greedy_analysis.insight}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Theoretical DAA Complexity Matrix */}
      {theoretical_complexity && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem'
        }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={14} color="#38bdf8" />
            <span>Theoretical DAA Complexity Summary</span>
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Brute-Force Permutations:</span>
              <div style={{ color: '#fb7185', fontWeight: 600 }}>
                {theoretical_complexity.brute_force_complexity} ({theoretical_complexity.brute_force_permutations} tours)
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b' }}>Held-Karp Dynamic Programming:</span>
              <div style={{ color: '#c084fc', fontWeight: 600 }}>
                Time: {theoretical_complexity.dp_time_complexity} | Space: {theoretical_complexity.dp_space_complexity}
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b' }}>Branch and Bound:</span>
              <div style={{ color: '#34d399', fontWeight: 600 }}>
                {theoretical_complexity.branch_and_bound_complexity}
              </div>
            </div>

            <div>
              <span style={{ color: '#64748b' }}>Greedy Nearest-Neighbor:</span>
              <div style={{ color: '#fbbf24', fontWeight: 600 }}>
                Time: {theoretical_complexity.greedy_complexity} (polynomial)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
