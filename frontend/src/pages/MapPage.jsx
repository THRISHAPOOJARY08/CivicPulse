import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllComplaints, getMyComplaints, getHotspots } from '../lib/api';
import Layout from '../components/Layout';
import { AlertBanner, LoadingSpinner } from '../components/UI';

const CATEGORIES = [
  'All',
  'Roads and Potholes',
  'Garbage and Waste Management',
  'Water Supply',
  'Drainage and Sewage',
  'Streetlights and Electricity',
  'Public Sanitation',
  'Public Infrastructure',
  'Other',
];

const PRIORITY_COLORS = {
  Critical: '#ba1a1a',
  High:     '#d97706',
  Medium:   '#006a61',
  Low:      '#74777e',
};

const CATEGORY_ICONS = {
  'Roads and Potholes':           'add_road',
  'Garbage and Waste Management': 'delete',
  'Water Supply':                 'water_drop',
  'Drainage and Sewage':          'water',
  'Streetlights and Electricity': 'bolt',
  'Public Sanitation':            'cleaning_services',
  'Public Infrastructure':        'domain',
  'Other':                        'report',
};

function buildMarkerIcon(color, L) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

function buildHotspotCircleOptions() {
  return {
    color: '#ba1a1a',
    fillColor: '#ba1a1a',
    fillOpacity: 0.12,
    weight: 1.5,
    dashArray: '4 4',
  };
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MapPage() {
  const { token, isAdmin } = useAuth();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayerRef = useRef(null);
  const hotspotLayerRef = useRef(null);

  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showHotspots, setShowHotspots] = useState(true);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  // Load complaints — admin sees all, citizen sees own, unauthenticated sees own (empty)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      let complaintsData = [];
      let hotspotsData = [];

      if (token) {
        const fetchFn = isAdmin ? getAllComplaints : getMyComplaints;
        const { data, error: err } = await fetchFn(token);
        if (err) { setError(err); setLoading(false); return; }
        complaintsData = Array.isArray(data) ? data : [];

        if (isAdmin) {
          const { data: hData } = await getHotspots(token);
          hotspotsData = Array.isArray(hData) ? hData : [];
        }
      }

      setComplaints(complaintsData);
      setHotspots(hotspotsData);
      const resolved = complaintsData.filter(c => c.status === 'Resolved').length;
      setStats({
        total: complaintsData.length,
        resolved,
        pending: complaintsData.length - resolved,
      });
      setLoading(false);
    })();
  }, [token, isAdmin]);

  // Init Leaflet map once
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // India centroid — adjusts once markers load
      zoom: 5,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    hotspotLayerRef.current = L.layerGroup().addTo(map);
    leafletMap.current = map;
  }, []);

  // Render markers whenever complaints or filters change
  const renderMarkers = useCallback(() => {
    const L = window.L;
    const map = leafletMap.current;
    const layer = markersLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();

    const filtered = complaints.filter(c => {
      const lat = c.latitude ?? c.location?.lat;
      const lng = c.longitude ?? c.location?.lng;
      if (lat == null || lng == null) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
      return true;
    });

    filtered.forEach(c => {
      const lat = c.latitude ?? c.location?.lat;
      const lng = c.longitude ?? c.location?.lng;
      const color = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.Low;
      const icon = buildMarkerIcon(color, L);

      const marker = L.marker([lat, lng], { icon }).addTo(layer);
      marker.bindPopup(
        `<div style="min-width:210px;font-family:'Plus Jakarta Sans',sans-serif">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#74777e;font-weight:600">
              #${c.id?.slice(0, 8).toUpperCase()}
            </span>
            <span style="font-size:10px;padding:1px 7px;border-radius:9999px;background:${color}22;color:${color};font-weight:700">
              ${c.priority || 'Unknown'}
            </span>
          </div>
          <p style="font-size:14px;font-weight:600;color:#001428;margin:0 0 4px">${c.title || 'Untitled'}</p>
          <p style="font-size:12px;color:#43474d;margin:0 0 6px">${c.category || ''}</p>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#74777e;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:6px">
            <span>${c.status || ''}</span>
            <span>${formatDate(c.createdAt || c.created_at)}</span>
          </div>
        </div>`,
        { maxWidth: 260 }
      );
    });

    // Fit bounds to markers if any
    if (filtered.length > 0) {
      const bounds = L.latLngBounds(
        filtered.map(c => [c.latitude ?? c.location?.lat, c.longitude ?? c.location?.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [complaints, categoryFilter, priorityFilter]);

  // Render hotspot circles
  const renderHotspots = useCallback(() => {
    const L = window.L;
    const layer = hotspotLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();
    if (!showHotspots) return;

    hotspots.forEach(h => {
      if (h.centerLat == null || h.centerLng == null) return;
      // GRID_SIZE=0.01° ≈ 1.1km. Use count to scale radius.
      const radiusM = Math.max(300, Math.min(1200, h.count * 120));
      L.circle([h.centerLat, h.centerLng], {
        radius: radiusM,
        ...buildHotspotCircleOptions(),
      })
        .bindPopup(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:160px">
            <p style="font-size:12px;font-weight:700;color:#ba1a1a;margin:0 0 4px">
              🔴 Hotspot — ${h.count} complaint${h.count !== 1 ? 's' : ''}
            </p>
            <p style="font-size:11px;color:#43474d;margin:0">
              ${h.topCategory || 'Multiple categories'}
            </p>
          </div>`,
          { maxWidth: 220 }
        )
        .addTo(layer);
    });
  }, [hotspots, showHotspots]);

  useEffect(() => { renderMarkers(); }, [renderMarkers]);
  useEffect(() => { renderHotspots(); }, [renderHotspots]);

  const visibleCount = complaints.filter(c => {
    const lat = c.latitude ?? c.location?.lat;
    const lng = c.longitude ?? c.location?.lng;
    if (lat == null || lng == null) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    return true;
  }).length;

  return (
    <Layout noPad>
      {/* Control bar */}
      <div className="bg-surface-container-lowest shadow-sm px-margin py-space-md z-10 relative">
        <div className="max-w-[1440px] mx-auto space-y-space-sm">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wide">
                  Live Map
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary mt-0.5">
                Civic Complaint Map
              </h1>
            </div>
            {/* Stats strip */}
            <div className="flex items-center gap-space-md text-sm">
              <div className="flex flex-col items-center px-space-md py-space-xs bg-surface-container rounded-xl">
                <span className="font-display-lg text-[22px] font-bold text-primary leading-tight">{stats.total}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
              </div>
              <div className="flex flex-col items-center px-space-md py-space-xs bg-surface-container rounded-xl">
                <span className="font-display-lg text-[22px] font-bold text-secondary leading-tight">{stats.resolved}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Resolved</span>
              </div>
              <div className="flex flex-col items-center px-space-md py-space-xs bg-surface-container rounded-xl">
                <span className="font-display-lg text-[22px] font-bold text-error leading-tight">{stats.pending}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Pending</span>
              </div>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm flex-wrap">
            {/* Priority filter */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg shrink-0">
              <span className="px-space-sm font-label-sm text-label-sm text-on-surface-variant">Priority:</span>
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                    priorityFilter === p
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto scrollbar-none pb-0.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap shrink-0 transition-all ${
                    categoryFilter === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {cat !== 'All' && (
                    <span className="material-symbols-outlined text-[13px]">{CATEGORY_ICONS[cat] || 'report'}</span>
                  )}
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Hotspot toggle — admin only */}
            {isAdmin && hotspots.length > 0 && (
              <button
                onClick={() => setShowHotspots(v => !v)}
                className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-full font-label-sm text-label-sm border transition-all shrink-0 ${
                  showHotspots
                    ? 'bg-error-container text-on-error-container border-error/30'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                Hotspots {showHotspots ? 'On' : 'Off'}
                {hotspots.length > 0 && (
                  <span className="ml-1 text-[10px] font-bold">{hotspots.length}</span>
                )}
              </button>
            )}
          </div>

          {error && <AlertBanner type="error" message={error} />}

          {!token && (
            <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-lg">
              <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <Link to="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
                {' '}to see complaints on the map.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map + legend wrapper — explicit height required by Leaflet */}
      <div className="relative" style={{ height: 'calc(100vh - 64px - 180px)' }}>
        {loading && (
          <div className="absolute inset-0 bg-surface/60 z-20 flex items-center justify-center">
            <LoadingSpinner label="Loading map data…" size="lg" />
          </div>
        )}

        {/* Leaflet map container — must have explicit pixel height */}
        <div ref={mapRef} className="w-full" style={{ height: '100%', minHeight: '500px', zIndex: 1 }} />

        {/* Bottom legend overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-surface-container-lowest/95 backdrop-blur rounded-xl shadow-md px-space-md py-space-sm flex flex-wrap items-center gap-space-md text-label-sm font-label-sm text-on-surface-variant">
          <span className="font-bold text-primary">Legend:</span>
          {Object.entries(PRIORITY_COLORS).map(([p, color]) => (
            <div key={p} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }}></span>
              <span>{p}</span>
            </div>
          ))}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-error/50" style={{ background: 'rgba(186,26,26,0.12)' }}></span>
              <span>Hotspot</span>
            </div>
          )}
          <span className="text-on-surface-variant/60 text-[11px]">
            {visibleCount} marker{visibleCount !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>
    </Layout>
  );
}
