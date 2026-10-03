import React from 'react';
import { Compass, BookOpen, GitBranch, Cpu, Sparkles, MapPin } from 'lucide-react';

export default function Header({ 
  presets, 
  selectedPresetId, 
  onSelectPreset, 
  onOpenTheoryModal, 
  isOptimizing 
}) {
  return (
    <header className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(180deg, #131d2e 0%, #0d1524 100%)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '0.65rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
          }}>
            <Compass size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Travel Itinerary Optimizer
              </h1>
              <span className="badge badge-blue">DAA Project</span>
              <span className="badge badge-emerald">TSPTW Exact Solvers</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              Multi-City Itinerary Minimizing Travel Cost Under Maximum Trip Duration & Visiting Schedules
            </p>
          </div>
        </div>

        {/* Controls: Preset Selector & Theory Modal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Circuit:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              disabled={isOptimizing}
              className="input-field"
              style={{ width: 'auto', minWidth: '190px', padding: '0.45rem 0.75rem' }}
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location_count} cities)
                </option>
              ))}
              <option value="custom">Custom Circuit (Manual)</option>
            </select>
          </div>

          <button
            onClick={onOpenTheoryModal}
            className="btn btn-secondary"
            title="View Problem Statement, DAA Formulations & Objectives"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <BookOpen size={16} color="#60a5fa" />
            <span>DAA Theory & Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
}
