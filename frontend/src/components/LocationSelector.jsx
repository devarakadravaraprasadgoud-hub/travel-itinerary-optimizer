import React, { useState } from 'react';
import { 
  MapPin, Clock, DollarSign, Plus, Trash2, Home, CheckSquare, Square, 
  Settings2, AlertCircle, ChevronDown, ChevronUp, Star
} from 'lucide-react';

export default function LocationSelector({
  allLocations,
  selectedLocationIds,
  startLocationId,
  onToggleLocation,
  onSelectAll,
  onSetStartLocation,
  onUpdateLocation,
  onAddLocation,
  onRemoveLocation,
  disabled
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSettingsId, setExpandedSettingsId] = useState(null);

  // New location form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocLat, setNewLocLat] = useState('45.0');
  const [newLocLng, setNewLocLng] = useState('10.0');
  const [newLocDuration, setNewLocDuration] = useState('2.0');
  const [newLocOpen, setNewLocOpen] = useState('09:00');
  const [newLocClose, setNewLocClose] = useState('19:00');
  const [newLocCost, setNewLocCost] = useState('15.0');
  const [newLocCategory, setNewLocCategory] = useState('attraction');

  const handleAddNewSubmit = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    const newLoc = {
      id: `custom_${Date.now()}`,
      name: newLocName.trim(),
      lat: parseFloat(newLocLat) || 0,
      lng: parseFloat(newLocLng) || 0,
      visit_duration_hours: parseFloat(newLocDuration) || 2.0,
      open_time: newLocOpen || "08:00",
      close_time: newLocClose || "20:00",
      cost_per_entry: parseFloat(newLocCost) || 0.0,
      category: newLocCategory || 'attraction',
      rating: 4.8,
      description: "Custom user-defined itinerary destination."
    };

    onAddLocation(newLoc);
    setIsAddModalOpen(false);
    setNewLocName('');
  };

  const selectedCount = selectedLocationIds.length;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Destinations & Time Schedules
            </h2>
            <span className="badge badge-blue">
              {selectedCount} Selected
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Select multiple cities to tour, designate starting hub, and customize visiting hours & stay duration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onSelectAll}
            disabled={disabled}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <CheckSquare size={14} />
            <span>Toggle All</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={disabled}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Plus size={14} />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {selectedCount < 3 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.8rem',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          color: '#fb7185',
          fontSize: '0.8rem'
        }}>
          <AlertCircle size={16} />
          <span>Please select at least <strong>3 locations</strong> to generate a tour itinerary.</span>
        </div>
      )}

      {/* Locations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {allLocations.map((loc) => {
          const isSelected = selectedLocationIds.includes(loc.id);
          const isStartHub = (loc.id === startLocationId);
          const isExpanded = (expandedSettingsId === loc.id);

          return (
            <div
              key={loc.id}
              style={{
                background: isSelected ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)',
                border: isStartHub ? '1.5px solid #3b82f6' : isSelected ? '1px solid #334155' : '1px solid #1e293b',
                borderRadius: '0.6rem',
                padding: '0.75rem',
                transition: 'all 0.2s',
                opacity: isSelected ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                {/* Checkbox and Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => onToggleLocation(loc.id)}
                    disabled={disabled}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? '#3b82f6' : '#64748b' }}
                  >
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  <div style={{ cursor: 'pointer' }} onClick={() => onToggleLocation(loc.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? '#f8fafc' : '#94a3b8' }}>
                        {loc.name}
                      </span>
                      {isStartHub && (
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                          <Home size={10} /> Origin Hub
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                      <span><Clock size={12} style={{ display: 'inline', marginRight: '2px' }} /> Stay: {loc.visit_duration_hours}h</span>
                      <span>Hours: {loc.open_time} - {loc.close_time}</span>
                      {loc.cost_per_entry > 0 && <span>Fee: ${loc.cost_per_entry}</span>}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isSelected && !isStartHub && (
                    <button
                      onClick={() => onSetStartLocation(loc.id)}
                      disabled={disabled}
                      className="btn btn-outline"
                      title="Set as Starting Origin Hub"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      <Home size={12} /> Set Hub
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedSettingsId(isExpanded ? null : loc.id)}
                    className="btn btn-secondary"
                    title="Customize Time Schedule & Stay Duration"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    <Settings2 size={12} />
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {String(loc.id).startsWith('custom_') && (
                    <button
                      onClick={() => onRemoveLocation(loc.id)}
                      disabled={disabled}
                      className="btn btn-outline"
                      title="Delete Custom Location"
                      style={{ padding: '0.3rem', color: '#f43f5e' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Schedule Configuration Drawer */}
              {isExpanded && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #243247',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.6rem',
                  fontSize: '0.75rem'
                }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.2rem' }}>Stay Duration (hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      value={loc.visit_duration_hours}
                      onChange={(e) => onUpdateLocation(loc.id, { visit_duration_hours: parseFloat(e.target.value) || 1.0 })}
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.2rem' }}>Opening Time</label>
                    <input
                      type="time"
                      value={loc.open_time}
                      onChange={(e) => onUpdateLocation(loc.id, { open_time: e.target.value })}
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.2rem' }}>Closing Deadline</label>
                    <input
                      type="time"
                      value={loc.close_time}
                      onChange={(e) => onUpdateLocation(loc.id, { close_time: e.target.value })}
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.2rem' }}>Admission Fee ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={loc.cost_per_entry}
                      onChange={(e) => onUpdateLocation(loc.id, { cost_per_entry: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Adding Custom Location */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: '#111827', border: '1px solid #374151' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
              Add New Custom Destination
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Enter destination details, coordinates, and visit schedule.
            </p>

            <form onSubmit={handleAddNewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Location / Landmark Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Florence Historic Center"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLocLat}
                    onChange={(e) => setNewLocLat(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLocLng}
                    onChange={(e) => setNewLocLng(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Stay Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newLocDuration}
                    onChange={(e) => setNewLocDuration(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Admission Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newLocCost}
                    onChange={(e) => setNewLocCost(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Opening Time</label>
                  <input
                    type="time"
                    value={newLocOpen}
                    onChange={(e) => setNewLocOpen(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Closing Deadline</label>
                  <input
                    type="time"
                    value={newLocClose}
                    onChange={(e) => setNewLocClose(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Add to Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
