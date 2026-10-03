import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Eye, EyeOff, Info, Home, Clock } from 'lucide-react';

export default function MapCanvas({
  locations,
  startCityIdx,
  optimalRoute,
  costMatrix,
  distanceMatrix,
  onNodeClick
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showAllEdges, setShowAllEdges] = useState(false);

  // Compute bounding box to normalize coordinates into SVG space (e.g. 800 x 480)
  const svgWidth = 800;
  const svgHeight = 460;
  const padding = 60;

  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    if (!locations || locations.length === 0) {
      return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    }
    let minLt = Infinity, maxLt = -Infinity, minLg = Infinity, maxLg = -Infinity;
    locations.forEach(l => {
      if (l.lat < minLt) minLt = l.lat;
      if (l.lat > maxLt) maxLt = l.lat;
      if (l.lng < minLg) minLg = l.lng;
      if (l.lng > maxLg) maxLg = l.lng;
    });

    // Ensure we don't have zero division for single or very close points
    if (maxLt - minLt < 0.1) { maxLt += 0.5; minLt -= 0.5; }
    if (maxLg - minLg < 0.1) { maxLg += 0.5; minLg -= 0.5; }

    return { minLat: minLt, maxLat: maxLt, minLng: minLg, maxLng: maxLg };
  }, [locations]);

  // Transform lat/lng to SVG x,y
  const projectCoords = (lat, lng) => {
    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 2 * padding);
    // Invert latitude because SVG Y goes downward
    const y = svgHeight - padding - ((lat - minLat) / (maxLat - minLat)) * (svgHeight - 2 * padding);
    return { x, y };
  };

  const projectedLocations = useMemo(() => {
    return locations.map((loc, idx) => ({
      ...loc,
      idx,
      ...projectCoords(loc.lat, loc.lng)
    }));
  }, [locations, minLat, maxLat, minLng, maxLng]);

  // Generate tour segments from optimalRoute (e.g. [0, 2, 1, 3, 0])
  const tourSegments = useMemo(() => {
    if (!optimalRoute || optimalRoute.length < 2 || !projectedLocations.length) return [];
    const segments = [];
    for (let i = 0; i < optimalRoute.length - 1; i++) {
      const u = optimalRoute[i];
      const v = optimalRoute[i + 1];
      if (projectedLocations[u] && projectedLocations[v]) {
        segments.push({
          from: projectedLocations[u],
          to: projectedLocations[v],
          legNumber: i + 1,
          cost: costMatrix ? costMatrix[u][v] : null,
          dist: distanceMatrix ? distanceMatrix[u][v] : null
        });
      }
    }
    return segments;
  }, [optimalRoute, projectedLocations, costMatrix, distanceMatrix]);

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Interactive Route Map & Tour Graph
            </h3>
            {optimalRoute && (
              <span className="badge badge-emerald">
                {optimalRoute.length - 1} Leg Optimal Tour
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Visualizes spatial graph, transit paths, and visit sequence. Click any node to set as origin hub.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowAllEdges(!showAllEdges)}
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          >
            {showAllEdges ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showAllEdges ? 'Hide Background Mesh' : 'Show Full Graph Mesh'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div style={{
        background: 'radial-gradient(ellipse at center, #111a2e 0%, #090e18 100%)',
        border: '1px solid #1e293b',
        borderRadius: '0.5rem',
        position: 'relative'
      }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Arrow marker for tour path */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
            </marker>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4">
            {[100, 200, 300, 400, 500, 600, 700].map(x => (
              <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2={svgHeight} />
            ))}
            {[80, 160, 240, 320, 400].map(y => (
              <line key={`gy-${y}`} x1="0" y1={y} x2={svgWidth} y2={y} />
            ))}
          </g>

          {/* Background all-to-all edges if enabled */}
          {showAllEdges && projectedLocations.map((p1, i) =>
            projectedLocations.slice(i + 1).map((p2, j) => (
              <line
                key={`mesh-${i}-${j}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(100, 116, 139, 0.15)"
                strokeWidth="1"
              />
            ))
          )}

          {/* Optimal Tour Path Edges */}
          {tourSegments.map((seg, idx) => (
            <g key={`tour-seg-${idx}`}>
              {/* Outer glow stroke */}
              <line
                x1={seg.from.x}
                y1={seg.from.y}
                x2={seg.to.x}
                y2={seg.to.y}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="6"
              />
              {/* Main directed stroke */}
              <line
                x1={seg.from.x}
                y1={seg.from.y}
                x2={seg.to.x}
                y2={seg.to.y}
                stroke="#3b82f6"
                strokeWidth="2.5"
                markerEnd="url(#arrow)"
                className="animated-route-path"
              />
              {/* Leg sequence badge in middle */}
              <circle
                cx={(seg.from.x + seg.to.x) / 2}
                cy={(seg.from.y + seg.to.y) / 2}
                r="10"
                fill="#0f172a"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <text
                x={(seg.from.x + seg.to.x) / 2}
                y={(seg.from.y + seg.to.y) / 2 + 3.5}
                fill="#60a5fa"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {seg.legNumber}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {projectedLocations.map((loc) => {
            const isStart = (loc.idx === startCityIdx);
            const isHovered = (hoveredNode === loc.idx);
            
            // Find visit order if in optimalRoute
            const visitIndex = optimalRoute ? optimalRoute.indexOf(loc.idx) : -1;

            return (
              <g
                key={`node-${loc.idx}`}
                transform={`translate(${loc.x}, ${loc.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredNode(loc.idx)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick && onNodeClick(loc.id)}
              >
                {/* Start hub beacon pulse */}
                {isStart && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="pulse-node"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={isStart ? "14" : "11"}
                  fill={isStart ? "#2563eb" : "#1e293b"}
                  stroke={isStart ? "#93c5fd" : isHovered ? "#38bdf8" : "#475569"}
                  strokeWidth={isHovered ? "2.5" : "2"}
                  filter={isHovered ? "url(#glow)" : undefined}
                />

                {/* Node Inner Symbol / Step number */}
                {isStart ? (
                  <text
                    textAnchor="middle"
                    y="3.5"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                  >
                    ★
                  </text>
                ) : (
                  <text
                    textAnchor="middle"
                    y="3.5"
                    fill={isHovered ? "#38bdf8" : "#94a3b8"}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {visitIndex > 0 ? visitIndex : loc.idx + 1}
                  </text>
                )}

                {/* Node Label Card */}
                <g transform={`translate(0, ${isStart ? 26 : 22})`}>
                  <rect
                    x="-55"
                    y="-10"
                    width="110"
                    height="20"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.85)"
                    stroke={isStart ? "#3b82f6" : "#334155"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    fill={isStart ? "#93c5fd" : "#f1f5f9"}
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {loc.name.length > 15 ? loc.name.substring(0, 14) + '...' : loc.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode !== null && projectedLocations[hoveredNode] && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #3b82f6',
            borderRadius: '0.5rem',
            padding: '0.65rem 0.85rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            maxWidth: '280px',
            fontSize: '0.75rem',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#3b82f6" />
              <span>{projectedLocations[hoveredNode].name}</span>
              {hoveredNode === startCityIdx && <span className="badge badge-blue">Origin</span>}
            </div>
            <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <div>Coordinates: {projectedLocations[hoveredNode].lat.toFixed(2)}°, {projectedLocations[hoveredNode].lng.toFixed(2)}°</div>
              <div>Stay Duration: <strong>{projectedLocations[hoveredNode].visit_duration_hours} hours</strong></div>
              <div>Visiting Window: <strong>{projectedLocations[hoveredNode].open_time} - {projectedLocations[hoveredNode].close_time}</strong></div>
              {projectedLocations[hoveredNode].cost_per_entry > 0 && (
                <div>Admission Fee: ${projectedLocations[hoveredNode].cost_per_entry}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
