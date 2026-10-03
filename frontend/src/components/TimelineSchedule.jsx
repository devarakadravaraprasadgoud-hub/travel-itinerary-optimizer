import React from 'react';
import { 
  Clock, MapPin, DollarSign, ArrowRight, AlertCircle, CheckCircle2, 
  Hourglass, Car, Landmark, Home, Calendar
} from 'lucide-react';

export default function TimelineSchedule({ schedule, algorithmName }) {
  if (!schedule || !schedule.timeline || schedule.timeline.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
        <Calendar size={36} color="#475569" style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ fontWeight: 600 }}>{schedule?.error || "No itinerary schedule generated yet."}</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Run optimization or adjust constraints to produce the chronological travel itinerary.</p>
      </div>
    );
  }

  const {
    feasible = true,
    violations = [],
    total_cost = 0,
    transit_cost = 0,
    admission_cost = 0,
    total_elapsed_hours = 0,
    transit_hours = 0,
    wait_hours = 0,
    visit_hours = 0,
    max_trip_duration = 48,
    timeline = [],
    route_names = []
  } = schedule;

  return (
    <div className="card">
      {/* Header and Feasibility Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Chronological Travel Itinerary
            </h3>
            <span className="badge badge-blue">{algorithmName || "Optimal"}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Detailed clock-time schedule including transit, wait times, visiting windows, and admissions.
          </p>
        </div>

        {feasible ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '9999px',
            color: '#34d399',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={16} />
            <span>Feasible Tour within {max_trip_duration}h Budget</span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '9999px',
            color: '#fb7185',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <AlertCircle size={16} />
            <span>Schedule Violations Detected</span>
          </div>
        )}
      </div>

      {/* Metrics Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        padding: '0.85rem',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '0.5rem',
        border: '1px solid #1e293b'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>${total_cost}</div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>${transit_cost} transit + ${admission_cost} fees</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Duration</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: total_elapsed_hours > max_trip_duration ? '#fb7185' : '#34d399' }}>
            {total_elapsed_hours}h
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Budget: {max_trip_duration}h</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sightseeing Stay</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>{visit_hours}h</div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Active exploration</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transit Time</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{transit_hours}h</div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>En route between cities</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wait Time</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>{wait_hours}h</div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Waiting for opening hours</span>
        </div>
      </div>

      {/* Violations Warning Box */}
      {violations && violations.length > 0 && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#fca5a5'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={15} /> Constraint Violations:
          </div>
          <ul style={{ paddingLeft: '1.25rem' }}>
            {violations.map((v, i) => (
              <li key={`v-${i}`}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Steps List */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Vertical line connector */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)'
        }} />

        {timeline.map((step, idx) => {
          const isOriginDepart = (step.step_type === "DEPARTURE_ORIGIN");
          const isReturn = (step.step_type === "RETURN_ORIGIN");

          return (
            <div key={`step-${idx}`} style={{ position: 'relative' }}>
              {/* Step indicator dot */}
              <div style={{
                position: 'absolute',
                left: '-1.5rem',
                top: '0.2rem',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: isOriginDepart ? '#3b82f6' : isReturn ? '#10b981' : '#8b5cf6',
                border: '3px solid #0f172a',
                boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} />

              {/* Step Content Card */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid #243247',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem'
              }}>
                {isOriginDepart && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Home size={18} color="#60a5fa" />
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>{step.location_name}</span>
                      <span className="badge badge-blue">Departure Hub</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={14} />
                      <span>{step.clock_time}</span>
                    </div>
                  </div>
                )}

                {isReturn && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home size={18} color="#34d399" />
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>Return to {step.location_name}</span>
                        <span className="badge badge-emerald">Tour Completed</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={14} />
                        <span>Arrived: {step.arrival_clock}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span><Car size={13} style={{ display: 'inline', marginRight: '3px' }} /> Return transit: {step.transit_hours}h ({step.distance_km} km)</span>
                      <span><DollarSign size={13} style={{ display: 'inline', marginRight: '2px' }} /> Transit cost: ${step.transit_cost}</span>
                    </div>
                  </div>
                )}

                {!isOriginDepart && !isReturn && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Landmark size={18} color="#c084fc" />
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>{step.location_name}</span>
                        <span className="badge badge-purple">Stop #{idx}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={14} />
                        <span>Visit: {step.visit_start_clock} - {step.visit_end_clock}</span>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '0.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '0.5rem',
                      borderRadius: '0.4rem'
                    }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Transit: </span>
                        <strong>{step.transit_hours}h</strong> ({step.distance_km} km, ${step.transit_cost})
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Arrival: </span>
                        <strong>{step.arrival_clock}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Visiting Window: </span>
                        <strong>{step.open_window}</strong>
                      </div>
                      {step.wait_hours > 0 && (
                        <div style={{ color: '#fbbf24' }}>
                          <Hourglass size={12} style={{ display: 'inline', marginRight: '2px' }} />
                          <span>Wait for opening: <strong>{step.wait_hours}h</strong></span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: '#64748b' }}>Stay Duration: </span>
                        <strong>{step.visit_duration}h</strong>
                        {step.admission_fee > 0 && ` (Fee: $${step.admission_fee})`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
