import React from 'react';
import { Play, RotateCcw, Clock, Gauge, DollarSign, Layers, Sparkles, AlertTriangle } from 'lucide-react';

export default function ScheduleConfig({
  tripStartHour,
  setTripStartHour,
  maxTripDuration,
  setMaxTripDuration,
  costPerKm,
  setCostPerKm,
  avgSpeedKmh,
  setAvgSpeedKmh,
  algorithm,
  setAlgorithm,
  onRunOptimization,
  isOptimizing,
  disabled
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Trip Constraints & Algorithm Engine
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Set departure time, duration cutoff budget (T_max), transit speeds, and algorithm mode.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        
        {/* Trip Start Hour */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
            <Clock size={14} color="#60a5fa" />
            <span>Trip Start Time: {formatHourToTime(tripStartHour)}</span>
          </label>
          <input
            type="range"
            min="5"
            max="12"
            step="0.5"
            value={tripStartHour}
            onChange={(e) => setTripStartHour(parseFloat(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: '#3b82f6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
            <span>05:00 AM (Early)</span>
            <span>08:00 AM</span>
            <span>12:00 PM (Noon)</span>
          </div>
        </div>

        {/* Max Trip Duration (T_max) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              <Clock size={14} color="#f59e0b" />
              <span>Max Duration Budget (T_max):</span>
            </label>
            <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
              {maxTripDuration} Hours
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="96"
            step="2"
            value={maxTripDuration}
            onChange={(e) => setMaxTripDuration(parseFloat(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
            <span>12h (Tight)</span>
            <span>48h (2 Days)</span>
            <span>96h (4 Days)</span>
          </div>
        </div>

        {/* Transit Speed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              <Gauge size={14} color="#10b981" />
              <span>Avg Transit Speed:</span>
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
              {avgSpeedKmh} km/h
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="5"
            value={avgSpeedKmh}
            onChange={(e) => setAvgSpeedKmh(parseFloat(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
            <span>30 (Bus)</span>
            <span>65 (Road)</span>
            <span>120 (Express Rail)</span>
          </div>
        </div>

        {/* Algorithm Selection Mode */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
            <Layers size={14} color="#8b5cf6" />
            <span>Algorithm Showcase:</span>
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={disabled}
            className="input-field"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
          >
            <option value="all">Compare All (B&B vs DP vs Greedy) ★</option>
            <option value="branch_and_bound">Branch and Bound Only</option>
            <option value="dynamic_programming">Dynamic Programming Only</option>
            <option value="greedy">Greedy Heuristic Only</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Sparkles size={16} color="#3b82f6" />
          <span>Both DP & B&B guarantee global cost optimality while pruning sequences that violate T_max or visiting hours.</span>
        </div>

        <button
          onClick={onRunOptimization}
          disabled={disabled || isOptimizing}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
        >
          {isOptimizing ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Optimizing Itinerary...</span>
            </>
          ) : (
            <>
              <Play size={18} fill="#ffffff" />
              <span>Run Itinerary Optimization</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function formatHourToTime(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}
