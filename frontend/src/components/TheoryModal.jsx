import React from 'react';
import { X, BookOpen, GitBranch, Layers, Clock, DollarSign, Target, CheckCircle2 } from 'lucide-react';

export default function TheoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '850px',
        width: '100%',
        maxHeight: '88vh',
        overflowY: 'auto',
        background: '#0f172a',
        border: '1px solid #334155',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              DAA Problem Formulation & Algorithm Specifications
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          
          {/* Section 1: Problem Statement */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Target size={16} /> 1. Problem Statement & Real-World Translation
            </h3>
            <p>
              Generate a multi-city tour itinerary that minimizes total travel cost while strictly respecting a maximum trip duration budget (T_max) and location-specific visiting hours (Time Windows [E_i, L_i]) and visit durations (S_i).
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
              <li><strong>Entities:</strong> Set of locations V = [0, 1, ..., N-1] with geographical coordinates (lat_i, lng_i).</li>
              <li><strong>Costs C_ij:</strong> Transit expenditure between city i and city j plus location admission fees.</li>
              <li><strong>Transit Times T_ij:</strong> Road/rail transit hours between city i and city j.</li>
              <li><strong>Visiting Schedules:</strong> Opening time E_i, admission deadline L_i, and required exploration stay S_i.</li>
              <li><strong>Tour Requirement:</strong> The traveler departs from designated start hub c_0, visits every selected city exactly once, and returns to c_0 (closed tour).</li>
            </ul>
          </div>

          {/* Section 2: Branch and Bound */}
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', padding: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GitBranch size={16} /> 2. Branch and Bound with Pruning
            </h3>
            <p>
              Branch and Bound explores a state-space tree where each node represents a partial tour sequence P = [c_0, c_1, ..., c_k].
            </p>
            <div style={{ marginTop: '0.4rem' }}>
              <strong>Admissible Lower Bound:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', background: '#0b1120', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', margin: '0.3rem 0', color: '#93c5fd' }}>
                {"LB(P) = Cost(P) + min_{u in U} C(c_k, u) + sum_{u in U} min_{w in U\\{u} U {c_0}} C(u, w)"}
              </div>
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <strong>Pruning Criteria (Discarding Unpromising Branches):</strong>
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li><strong>Cost Bound Prune:</strong> If LB(P) &ge; BestCost, discard immediately because no completion can beat the current best tour.</li>
                <li><strong>Time Window Prune:</strong> If transit arrival at candidate next city v exceeds its closing hour (arrival &gt; L_v), prune.</li>
                <li><strong>Max Duration Prune:</strong> If elapsed time + minimum remaining transit exceeds T_max, prune.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Dynamic Programming */}
          <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '0.5rem', padding: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} /> 3. Dynamic Programming (Bellman-Held-Karp)
            </h3>
            <p>
              Instead of recomputing the shortest path through a subset of cities repeatedly, Held-Karp decomposes the problem into overlapping subproblems using bitmask state representation:
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', background: '#0b1120', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', margin: '0.3rem 0', color: '#c084fc' }}>
              {"DP(S, u) = min_{v in S \\ {u}} [ DP(S \\ {u}, v) + Cost(v, u) ]"}
            </div>
            <p style={{ marginTop: '0.3rem' }}>
              Where S is represented by a binary bitmask of visited cities, and u is the current city. Subproblem results are memoized in the state table, allowing optimal route reconstruction via backtracking pointers.
            </p>
          </div>

          {/* Section 4: Key Objectives & Decision Explainability */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> 4. Objectives & Explainability Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              <div style={{ background: '#111827', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #1e293b' }}>
                <strong style={{ color: '#38bdf8' }}>Visible Decisions:</strong>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Animated SVG route graph, chronological day schedule, wait times, and visit slots.
                </p>
              </div>

              <div style={{ background: '#111827', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #1e293b' }}>
                <strong style={{ color: '#34d399' }}>Pruning Inspection:</strong>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Step-by-step search tree player showing exact lower bounds and color-coded prune reasons.
                </p>
              </div>

              <div style={{ background: '#111827', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #1e293b' }}>
                <strong style={{ color: '#c084fc' }}>Subproblem Memo Table:</strong>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Decoded bitmasks and cache hit counters proving how overlapping subproblems save computation.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
}
