import React, { useState } from 'react';
import { 
  GitBranch, Filter, Play, Pause, RotateCcw, ChevronRight, AlertTriangle, 
  CheckCircle, ArrowDown, HelpCircle, Scissors, Zap
} from 'lucide-react';

export default function BranchBoundView({ bbData }) {
  if (!bbData || !bbData.tree_trace) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
        <GitBranch size={36} color="#475569" style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ fontWeight: 600 }}>Branch & Bound trace not loaded.</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Run optimization to inspect the state-space search tree.</p>
      </div>
    );
  }

  const {
    nodes_expanded,
    nodes_pruned_bound,
    nodes_pruned_time,
    total_nodes_evaluated,
    best_cost,
    best_solution_updates,
    max_tree_depth,
    tree_trace,
    execution_time_ms
  } = bbData;

  const [filter, setFilter] = useState('ALL'); // ALL, EXPANDED, PRUNED_BOUND, PRUNED_TIME, NEW_BEST
  const [selectedNode, setSelectedNode] = useState(tree_trace[0] || null);
  const [stepIndex, setStepIndex] = useState(tree_trace.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play animation step by step
  React.useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= tree_trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tree_trace.length]);

  const visibleTrace = tree_trace.slice(0, stepIndex + 1);

  const filteredNodes = visibleTrace.filter((node) => {
    if (filter === 'ALL') return true;
    if (filter === 'EXPANDED') return node.status === 'EXPANDED';
    if (filter === 'PRUNED_BOUND') return node.status === 'PRUNED_BOUND' || node.status === 'PRUNED_LEAF';
    if (filter === 'PRUNED_TIME') return node.status === 'PRUNED_TIME';
    if (filter === 'NEW_BEST') return node.status === 'NEW_BEST';
    return true;
  });

  const totalPruned = (nodes_pruned_bound || 0) + (nodes_pruned_time || 0);
  const pruneEfficiency = total_nodes_evaluated ? Math.round((totalPruned / total_nodes_evaluated) * 100) : 0;

  return (
    <div className="card">
      {/* Title & Concept Explanation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Branch and Bound: State-Space Tree & Pruning Engine
            </h3>
            <span className="badge badge-emerald">Exact DAA Solver</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Calculates an admissible lower bound for each partial tour. Discards branches whose lower bound exceeds current best cost or violate time schedules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
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
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Prune Efficiency</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
            {pruneEfficiency}%
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{totalPruned} branches cut</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Bound Prunes</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>
            {nodes_pruned_bound}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Bound &ge; Best Cost</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Schedule Prunes</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
            {nodes_pruned_time}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Missed hours or T_max</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Expanded Nodes</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
            {nodes_expanded}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Promising states</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Optimal Cost</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>
            ${best_cost || 'N/A'}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Global minimum</span>
        </div>
      </div>

      {/* Step Scrubber / Player */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.3)',
        border: '1px solid #243247',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play Tree Expansion'}</span>
            </button>
            <button
              onClick={() => { setIsPlaying(false); setStepIndex(0); }}
              className="btn btn-outline"
              title="Reset to Root"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <RotateCcw size={14} />
            </button>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Step <strong>{stepIndex + 1}</strong> of <strong>{tree_trace.length}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {['ALL', 'EXPANDED', 'PRUNED_BOUND', 'PRUNED_TIME', 'NEW_BEST'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  background: filter === tab ? '#3b82f6' : 'transparent',
                  color: filter === tab ? '#ffffff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: filter === tab ? '#3b82f6' : '#334155',
                  borderRadius: '0.35rem',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={tree_trace.length - 1}
          value={stepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setStepIndex(parseInt(e.target.value, 10));
          }}
          style={{ width: '100%', accentColor: '#3b82f6' }}
        />
      </div>

      {/* Main Display: Tree Node Explorer + Node Inspector Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1rem', alignItems: 'start' }}>
        
        {/* Node Cards Stream */}
        <div style={{
          maxHeight: '440px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          paddingRight: '0.25rem'
        }}>
          {filteredNodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
              No nodes match the selected filter.
            </div>
          ) : (
            filteredNodes.map((node) => {
              const isSelected = selectedNode && selectedNode.id === node.id;
              let statusClass = 'tree-node-expanded';
              let badgeColor = 'badge-emerald';
              let statusLabel = 'EXPANDED';

              if (node.status === 'PRUNED_BOUND' || node.status === 'PRUNED_LEAF') {
                statusClass = 'tree-node-pruned-bound';
                badgeColor = 'badge-rose';
                statusLabel = 'PRUNED BOUND';
              } else if (node.status === 'PRUNED_TIME') {
                statusClass = 'tree-node-pruned-time';
                badgeColor = 'badge-amber';
                statusLabel = 'PRUNED SCHEDULE';
              } else if (node.status === 'NEW_BEST') {
                statusClass = 'tree-node-best';
                badgeColor = 'badge-purple';
                statusLabel = 'NEW OPTIMUM';
              }

              return (
                <div
                  key={`trace-node-${node.id}`}
                  onClick={() => setSelectedNode(node)}
                  className={`tree-node-card ${statusClass}`}
                  style={{
                    outline: isSelected ? '2px solid #38bdf8' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                        Node #{node.id}: {node.cityName}
                      </span>
                      <span className={`badge ${badgeColor}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                        {statusLabel}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Lvl {node.level}</span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', gap: '0.65rem' }}>
                      <span>Path: <strong>{node.path ? node.path.join(' → ') : ''}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      Bound: ${node.lower_bound}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      Cost: ${node.cost}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Node Deep Inspector */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #334155',
          borderRadius: '0.6rem',
          padding: '1rem'
        }}>
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Node #{selectedNode.id} Decision Details
                </h4>
                <span className="badge badge-blue">Depth {selectedNode.level}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Target City: </span>
                  <strong style={{ color: '#f8fafc' }}>{selectedNode.cityName}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>Partial Tour Sequence: </span>
                  <div style={{
                    marginTop: '0.2rem',
                    background: '#0b1120',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0.35rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#38bdf8'
                  }}>
                    {selectedNode.path ? selectedNode.path.join(' → ') : 'Root'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#0f172a', padding: '0.5rem', borderRadius: '0.4rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Cumulative Cost:</span>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${selectedNode.cost}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Admissible Lower Bound:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>${selectedNode.lower_bound}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Clock Time at Departure:</span>
                    <div style={{ fontWeight: 700, color: '#fbbf24' }}>{selectedNode.clock_time}h</div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Parent Node ID:</span>
                    <div style={{ fontWeight: 700, color: '#94a3b8' }}>
                      {selectedNode.parentId !== null ? `#${selectedNode.parentId}` : 'None (Root)'}
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>Algorithmic Pruning Verdict: </span>
                  <div style={{
                    marginTop: '0.25rem',
                    padding: '0.5rem',
                    borderRadius: '0.4rem',
                    background: selectedNode.status.includes('PRUNED') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: selectedNode.status.includes('PRUNED') ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: selectedNode.status.includes('PRUNED') ? '#fca5a5' : '#86efac'
                  }}>
                    {selectedNode.explanation}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 1rem' }}>
              Select a node from the tree trace to inspect its mathematical lower bound and pruning justification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
