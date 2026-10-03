import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LocationSelector from './components/LocationSelector';
import ScheduleConfig from './components/ScheduleConfig';
import MapCanvas from './components/MapCanvas';
import TimelineSchedule from './components/TimelineSchedule';
import BranchBoundView from './components/BranchBoundView';
import DPTableView from './components/DPTableView';
import ComparisonView from './components/ComparisonView';
import TheoryModal from './components/TheoryModal';

import { fetchPresets, fetchPresetDetail, optimizeItinerary, FALLBACK_PRESETS } from './services/api';
import { 
  MapPin, GitBranch, Database, BarChart3, Clock, AlertCircle, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function App() {
  const initialPreset = FALLBACK_PRESETS.europe;
  const [presets, setPresets] = useState(
    Object.values(FALLBACK_PRESETS).map(p => ({
      id: p.id,
      name: p.name,
      region: p.region,
      description: p.description,
      location_count: p.locations.length,
      default_start_id: p.default_start_id,
      recommended_max_duration: p.recommended_max_duration,
      trip_start_hour: p.trip_start_hour
    }))
  );
  const [selectedPresetId, setSelectedPresetId] = useState('europe');
  
  const [allLocations, setAllLocations] = useState(initialPreset.locations);
  const [selectedLocationIds, setSelectedLocationIds] = useState(initialPreset.locations.map(l => l.id));
  const [startLocationId, setStartLocationId] = useState(initialPreset.default_start_id);

  // Trip constraints & algorithm settings
  const [tripStartHour, setTripStartHour] = useState(8.0);
  const [maxTripDuration, setMaxTripDuration] = useState(48.0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(65.0);
  const [costPerKm, setCostPerKm] = useState(0.5);
  const [algorithm, setAlgorithm] = useState('all');

  // UI Tabs & State
  const [activeTab, setActiveTab] = useState('MAP_SCHEDULE'); // 'MAP_SCHEDULE' | 'BRANCH_BOUND' | 'DYNAMIC_PROGRAMMING' | 'COMPARISON'
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load presets on mount
  useEffect(() => {
    async function loadPresets() {
      try {
        const data = await fetchPresets();
        setPresets(data.presets || []);
      } catch (err) {
        console.error("Failed to load presets:", err);
      }
    }
    loadPresets();
  }, []);

  // Load preset details whenever selectedPresetId changes
  useEffect(() => {
    async function loadPresetData() {
      if (selectedPresetId === 'custom') return;
      try {
        setErrorMessage(null);
        const data = await fetchPresetDetail(selectedPresetId);
        const preset = data.preset;
        if (preset) {
          setAllLocations(preset.locations || []);
          const ids = (preset.locations || []).map(l => l.id);
          setSelectedLocationIds(ids);
          setStartLocationId(preset.default_start_id || (ids[0] || ''));
          setMaxTripDuration(preset.recommended_max_duration || 48.0);
          setTripStartHour(preset.trip_start_hour || 8.0);

          // Auto optimize after preset loads
          runOptimizationWithParams(
            preset.locations, 
            ids, 
            preset.default_start_id || ids[0], 
            preset.trip_start_hour || 8.0, 
            preset.recommended_max_duration || 48.0,
            algorithm
          );
        }
      } catch (err) {
        console.error("Failed to load preset detail:", err);
      }
    }
    loadPresetData();
  }, [selectedPresetId]);

  // Execute optimization
  const runOptimizationWithParams = async (
    locationsList, 
    selectedIds, 
    startId, 
    startHr, 
    maxDur, 
    algoChoice
  ) => {
    const activeLocations = locationsList.filter(l => selectedIds.includes(l.id));
    if (activeLocations.length < 3) {
      setErrorMessage("At least 3 locations must be selected to optimize a tour itinerary.");
      return;
    }

    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const payload = {
        locations: activeLocations,
        start_city_id: startId,
        trip_start_hour: startHr,
        max_trip_duration: maxDur,
        cost_per_km: costPerKm,
        avg_speed_kmh: avgSpeedKmh,
        algorithm: algoChoice
      };

      const result = await optimizeItinerary(payload);
      setOptimizationResult(result);
    } catch (err) {
      console.error("Optimization failed:", err);
      setErrorMessage(err.message || "Failed to optimize itinerary. Check backend connectivity.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunOptimization = () => {
    runOptimizationWithParams(
      allLocations, 
      selectedLocationIds, 
      startLocationId, 
      tripStartHour, 
      maxTripDuration, 
      algorithm
    );
  };

  // Location Handlers
  const handleToggleLocation = (id) => {
    setSelectedLocationIds(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(item => item !== id);
        // If we deselected the start hub, pick another from remaining
        if (id === startLocationId && updated.length > 0) {
          setStartLocationId(updated[0]);
        }
      } else {
        updated = [...prev, id];
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (selectedLocationIds.length === allLocations.length) {
      // Keep only start hub or first 3
      setSelectedLocationIds(allLocations.slice(0, 3).map(l => l.id));
    } else {
      setSelectedLocationIds(allLocations.map(l => l.id));
    }
  };

  const handleSetStartLocation = (id) => {
    setStartLocationId(id);
    if (!selectedLocationIds.includes(id)) {
      setSelectedLocationIds(prev => [...prev, id]);
    }
  };

  const handleUpdateLocation = (id, updates) => {
    setAllLocations(prev => prev.map(loc => {
      if (loc.id === id) {
        return { ...loc, ...updates };
      }
      return loc;
    }));
  };

  const handleAddLocation = (newLoc) => {
    setAllLocations(prev => [...prev, newLoc]);
    setSelectedLocationIds(prev => [...prev, newLoc.id]);
    setSelectedPresetId('custom');
  };

  const handleRemoveLocation = (id) => {
    setAllLocations(prev => prev.filter(l => l.id !== id));
    setSelectedLocationIds(prev => prev.filter(i => i !== id));
  };

  // Extracted data for child components
  const activeLocationsList = allLocations.filter(l => selectedLocationIds.includes(l.id));
  
  // Find start city index among active locations
  let activeStartIdx = 0;
  activeLocationsList.forEach((loc, idx) => {
    if (loc.id === startLocationId) activeStartIdx = idx;
  });

  const optimalRoute = optimizationResult?.algorithms?.branch_and_bound?.metrics?.best_path 
    || optimizationResult?.algorithms?.dynamic_programming?.metrics?.best_path 
    || optimizationResult?.algorithms?.greedy?.metrics?.best_path;

  const optimalSchedule = optimizationResult?.algorithms?.branch_and_bound?.schedule
    || optimizationResult?.algorithms?.dynamic_programming?.schedule
    || optimizationResult?.algorithms?.greedy?.schedule;

  const bbData = optimizationResult?.algorithms?.branch_and_bound?.metrics;
  const dpData = optimizationResult?.algorithms?.dynamic_programming?.metrics;
  const comparisonMatrix = optimizationResult?.comparison || [];
  const explainability = optimizationResult?.explainability;

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        presets={presets}
        selectedPresetId={selectedPresetId}
        onSelectPreset={setSelectedPresetId}
        onOpenTheoryModal={() => setIsTheoryModalOpen(true)}
        isOptimizing={isOptimizing}
      />

      {/* Error notification if any */}
      {errorMessage && (
        <div style={{
          padding: '0.85rem 1rem',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: '0.5rem',
          color: '#fca5a5',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Grid: Location & Time Schedule Manager + Trip Constraints */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <LocationSelector
          allLocations={allLocations}
          selectedLocationIds={selectedLocationIds}
          startLocationId={startLocationId}
          onToggleLocation={handleToggleLocation}
          onSelectAll={handleSelectAll}
          onSetStartLocation={handleSetStartLocation}
          onUpdateLocation={handleUpdateLocation}
          onAddLocation={handleAddLocation}
          onRemoveLocation={handleRemoveLocation}
          disabled={isOptimizing}
        />

        <ScheduleConfig
          tripStartHour={tripStartHour}
          setTripStartHour={setTripStartHour}
          maxTripDuration={maxTripDuration}
          setMaxTripDuration={setMaxTripDuration}
          costPerKm={costPerKm}
          setCostPerKm={setCostPerKm}
          avgSpeedKmh={avgSpeedKmh}
          setAvgSpeedKmh={setAvgSpeedKmh}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          onRunOptimization={handleRunOptimization}
          isOptimizing={isOptimizing}
          disabled={selectedLocationIds.length < 3}
        />
      </div>

      {/* Main Exploration Tabs */}
      <div className="tabs-bar">
        <button
          onClick={() => setActiveTab('MAP_SCHEDULE')}
          className={`tab-btn ${activeTab === 'MAP_SCHEDULE' ? 'active' : ''}`}
        >
          <MapPin size={17} />
          <span>Route Map & Itinerary Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCH_BOUND')}
          className={`tab-btn ${activeTab === 'BRANCH_BOUND' ? 'active' : ''}`}
        >
          <GitBranch size={17} />
          <span>Branch & Bound Search Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('DYNAMIC_PROGRAMMING')}
          className={`tab-btn ${activeTab === 'DYNAMIC_PROGRAMMING' ? 'active' : ''}`}
        >
          <Database size={17} />
          <span>Dynamic Programming Subproblems</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPARISON')}
          className={`tab-btn ${activeTab === 'COMPARISON' ? 'active' : ''}`}
        >
          <BarChart3 size={17} />
          <span>Algorithm Comparison & Benchmarks</span>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'MAP_SCHEDULE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '1.25rem' }}>
          <MapCanvas
            locations={activeLocationsList}
            startCityIdx={activeStartIdx}
            optimalRoute={optimalRoute}
            costMatrix={optimizationResult?.graph?.cost_matrix}
            distanceMatrix={optimizationResult?.graph?.distance_matrix}
            onNodeClick={handleSetStartLocation}
          />
          <TimelineSchedule
            schedule={optimalSchedule}
            algorithmName={optimizationResult?.chosen_algorithm === 'all' ? 'Exact Global Optimum (DP & B&B)' : optimizationResult?.chosen_algorithm}
          />
        </div>
      )}

      {activeTab === 'BRANCH_BOUND' && (
        <BranchBoundView bbData={bbData} />
      )}

      {activeTab === 'DYNAMIC_PROGRAMMING' && (
        <DPTableView dpData={dpData} />
      )}

      {activeTab === 'COMPARISON' && (
        <ComparisonView
          comparisonMatrix={comparisonMatrix}
          explainability={explainability}
        />
      )}

      {/* DAA Theory & Specifications Modal */}
      <TheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
      />
    </div>
  );
}
