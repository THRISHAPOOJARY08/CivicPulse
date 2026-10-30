import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitComplaint } from '../lib/api';
import Layout from '../components/Layout';
import { AlertBanner, LoadingSpinner } from '../components/UI';

// Backend allowed categories — must match constants.js exactly
const CATEGORIES = [
  { value: 'Roads and Potholes',         icon: 'construction',   label: 'Roads & Potholes',       sub: 'Potholes, asphalt, road damage' },
  { value: 'Garbage and Waste Management', icon: 'delete_sweep', label: 'Waste Management',        sub: 'Missed pickups, dumping, debris' },
  { value: 'Water Supply',               icon: 'water_drop',     label: 'Water Supply',           sub: 'Leaks, low pressure, outages' },
  { value: 'Drainage and Sewage',        icon: 'flood',          label: 'Drainage & Sewage',      sub: 'Blocked drains, sewage overflow' },
  { value: 'Streetlights and Electricity', icon: 'lightbulb',   label: 'Streetlights & Electricity', sub: 'Outages, broken lights' },
  { value: 'Public Sanitation',          icon: 'cleaning_services', label: 'Public Sanitation',  sub: 'Dirty public spaces, hygiene' },
  { value: 'Public Infrastructure',      icon: 'domain',         label: 'Public Infrastructure',  sub: 'Bridges, sidewalks, public assets' },
  { value: 'Other',                      icon: 'more_horiz',     label: 'Other',                  sub: 'Any other civic issue' }
];

const TITLE_MAX = 120;
const DESC_MAX = 1000;

export default function SubmitComplaintPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);

  // Initialize Leaflet map after mount
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    // Leaflet is loaded via CDN in index.html — access via window.L
    const L = window.L;
    if (!L) return;

    const defaultLat = 28.6139;
    const defaultLng = 77.2090;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], 13);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    setLatitude(defaultLat.toFixed(6));
    setLongitude(defaultLng.toFixed(6));

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setLatitude(pos.lat.toFixed(6));
      setLongitude(pos.lng.toFixed(6));
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        setLocating(false);
      },
      () => { setError('Could not get your location. Please pin manually on the map.'); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError('Complaint title is required.'); return; }
    if (title.trim().length > TITLE_MAX) { setError(`Title must be ${TITLE_MAX} characters or fewer.`); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (description.trim().length > DESC_MAX) { setError(`Description must be ${DESC_MAX} characters or fewer.`); return; }
    if (!latitude || !longitude) { setError('Please select a location on the map.'); return; }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    if (isNaN(parsedLat) || isNaN(parsedLng)) { setError('Invalid coordinates.'); return; }

    setLoading(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      latitude: parsedLat,
      longitude: parsedLng,
      locationLabel: locationLabel.trim() || `${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`,
      ...(category && { category })
    };

    const { data, error: apiErr } = await submitComplaint(payload, token);
    setLoading(false);

    if (apiErr) {
      setError(apiErr);
    } else {
      navigate(`/complaints/${data.id}`, { state: { fromSubmit: true } });
    }
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="w-full bg-surface-container-low py-space-xl px-margin">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-3xl space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              AI-Assisted Smart Intake
            </div>
            <h1 className="font-display-lg text-display-lg text-primary tracking-tight">Submit a Civic Issue</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Describe the problem below. Our AI engine will categorise, prioritise and route it to the responsible department.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-margin py-space-xl w-full">
        {error && <div className="mb-space-md"><AlertBanner type="error" message={error} onDismiss={() => setError(null)} /></div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-xl">

            {/* Section 1: Title & Description */}
            <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">1</span>
                <h2 className="font-headline-md text-headline-md text-primary">Complaint Title &amp; Description</h2>
              </div>

              <div className="space-y-space-xs">
                <label htmlFor="title" className="font-label-lg text-label-lg text-primary block">
                  Issue Summary <span className="text-error">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  maxLength={TITLE_MAX}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole damaging car tyres on main road"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                />
                <p className={`font-label-sm text-label-sm text-right ${title.length > TITLE_MAX - 10 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {title.length} / {TITLE_MAX}
                </p>
              </div>

              <div className="space-y-space-xs">
                <div className="flex justify-between items-center">
                  <label htmlFor="description" className="font-label-lg text-label-lg text-primary block">
                    Detailed Description <span className="text-error">*</span>
                  </label>
                  <span className={`font-label-sm text-label-sm ${description.length > DESC_MAX - 50 ? 'text-error' : 'text-on-surface-variant'}`}>
                    {description.length} / {DESC_MAX}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                  Describe the exact issue, how long it has persisted, and any safety concerns.
                </p>
                <textarea
                  id="description"
                  required
                  rows={5}
                  maxLength={DESC_MAX}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide specific details about the issue, its severity, and any impact on residents or traffic…"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md p-space-md rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all leading-relaxed resize-none"
                />
              </div>
            </section>

            {/* Section 2: Category */}
            <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">2</span>
                  <h2 className="font-headline-md text-headline-md text-primary">Category <span className="font-body-sm text-body-sm text-on-surface-variant">(optional — AI will suggest if not selected)</span></h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                {CATEGORIES.map(({ value, icon, label, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(category === value ? '' : value)}
                    className={`text-left p-space-md rounded-xl transition-all shadow-sm ${
                      category === value
                        ? 'bg-surface-container-high ring-2 ring-secondary shadow-md'
                        : 'bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-space-sm ${category === value ? 'bg-primary-container text-on-primary' : 'bg-surface-container-highest text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                    <div className="font-label-md text-label-md text-primary leading-tight">{label}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-tight">{sub}</div>
                    {category === value && (
                      <div className="mt-space-xs inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 3: Location */}
            <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">3</span>
                  <h2 className="font-headline-md text-headline-md text-primary">Location <span className="text-error">*</span></h2>
                </div>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={locating}
                  className="flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary/20 font-label-sm text-label-sm transition-all disabled:opacity-50"
                >
                  {locating
                    ? <><span className="w-4 h-4 rounded-full border-2 border-on-secondary-container border-t-transparent animate-spin"></span> Locating…</>
                    : <><span className="material-symbols-outlined text-[16px]">my_location</span> Use GPS</>
                  }
                </button>
              </div>

              {/* Leaflet map */}
              <div
                ref={mapRef}
                style={{ height: '320px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', zIndex: 1 }}
                className="shadow-sm bg-surface-container"
              ></div>

              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">drag_pan</span>
                Click on the map or drag the marker to pinpoint the exact location.
              </p>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="space-y-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={e => {
                      setLatitude(e.target.value);
                      if (leafletMapRef.current && markerRef.current && !isNaN(e.target.value) && !isNaN(longitude)) {
                        markerRef.current.setLatLng([parseFloat(e.target.value), parseFloat(longitude)]);
                        leafletMapRef.current.setView([parseFloat(e.target.value), parseFloat(longitude)], leafletMapRef.current.getZoom());
                      }
                    }}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all font-mono text-[13px]"
                  />
                </div>
                <div className="space-y-space-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={e => {
                      setLongitude(e.target.value);
                      if (leafletMapRef.current && markerRef.current && !isNaN(latitude) && !isNaN(e.target.value)) {
                        markerRef.current.setLatLng([parseFloat(latitude), parseFloat(e.target.value)]);
                        leafletMapRef.current.setView([parseFloat(latitude), parseFloat(e.target.value)], leafletMapRef.current.getZoom());
                      }
                    }}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all font-mono text-[13px]"
                  />
                </div>
              </div>

              <div className="space-y-space-xs">
                <label htmlFor="locationLabel" className="font-label-lg text-label-lg text-primary block">
                  Location Description <span className="font-body-sm text-body-sm text-on-surface-variant">(optional)</span>
                </label>
                <input
                  id="locationLabel"
                  type="text"
                  value={locationLabel}
                  onChange={e => setLocationLabel(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Near the main bus stop on MG Road"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </section>

            {/* Submit bar */}
            <section className="bg-primary text-on-primary p-space-lg rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shrink-0">
                  <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                </div>
                <div className="space-y-0.5">
                  <div className="font-headline-sm text-headline-sm font-bold text-white">Ready for Submission</div>
                  <div className="font-body-sm text-body-sm text-surface-variant">
                    AI analysis and priority scoring will run automatically after submission.
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-secondary text-white hover:bg-secondary-fixed font-label-lg text-label-lg shadow-md transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span> Submitting…</>
                ) : (
                  <><span>Submit Complaint</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                )}
              </button>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md space-y-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">batch_prediction</span>
                <span className="font-label-lg text-label-lg text-primary">What happens next?</span>
              </div>
              <div className="relative pl-6 space-y-space-md">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-container-high"></div>
                {[
                  { step: '1', title: 'Instant Storage', desc: 'Your complaint is saved immediately to the secure database.' },
                  { step: '2', title: 'AI Analysis', desc: 'Gemini categorises and summarises your complaint. A deterministic priority score is calculated.' },
                  { step: '3', title: 'Duplicate Check', desc: 'Similar nearby complaints are identified as possible duplicates.' },
                  { step: '4', title: 'Admin Review', desc: 'A municipal administrator reviews and updates the status.' }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="relative flex items-start gap-space-sm">
                    <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[11px] font-bold absolute -left-6 ring-4 ring-surface-container-lowest">{step}</span>
                    <div>
                      <div className="font-label-md text-label-md text-primary">{title}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-error-container/20 shadow-xs flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-error text-[24px]">crisis_alert</span>
              <div>
                <span className="font-label-sm text-label-sm text-error font-bold block">Immediate Emergency?</span>
                <span className="font-body-sm text-body-sm text-on-error-container">For life-threatening situations, dial 911 immediately.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
