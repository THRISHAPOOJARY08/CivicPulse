/**
 * CivicPulse — Synthetic Demo Dataset Seed Script
 *
 * Inserts 40 synthetic complaints into Supabase for testing and demonstration.
 * Includes geographic clusters for hotspot detection, duplicate pairs, and
 * all complaint categories.
 *
 * Usage (from project root):
 *   node scripts/seed-demo-data.js <CITIZEN_USER_ID>
 *
 * The CITIZEN_USER_ID must be an existing user UUID from Supabase Auth.
 * Run AFTER the user has registered at http://localhost:5173/register.
 *
 * Requirements: backend/.env must be populated with Supabase credentials.
 */

const path = require('path');
// Require dotenv from backend/node_modules so this script works from any cwd
require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../backend/.env')
});
const { getSupabaseAdmin, isConfigured } = require('../backend/src/config/supabase');

if (!isConfigured()) {
  console.error('Error: Supabase is not configured. Populate backend/.env first.');
  process.exit(1);
}

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/seed-demo-data.js <CITIZEN_USER_ID>');
  console.error('Example: node scripts/seed-demo-data.js xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  process.exit(1);
}

// ─── Geographic clusters ───────────────────────────────────────────────────────
// Cluster A — Koramangala, Bengaluru (pothole hotspot — 6 complaints within 0.01° grid)
const CLUSTER_A = { lat: 12.9352, lng: 77.6245 };
// Cluster B — Indiranagar, Bengaluru (water/drainage hotspot — 5 complaints)
const CLUSTER_B = { lat: 12.9784, lng: 77.6408 };
// Cluster C — Whitefield, Bengaluru (garbage hotspot — 4 complaints)
const CLUSTER_C = { lat: 12.9698, lng: 77.7500 };

function jitter(base, maxDegrees = 0.003) {
  return base + (Math.random() - 0.5) * maxDegrees * 2;
}

const NOW = new Date();
function daysAgo(n) {
  return new Date(NOW - n * 86400000).toISOString();
}

// ─── Complaint definitions ─────────────────────────────────────────────────────
const COMPLAINTS = [
  // CLUSTER A — Roads and Potholes (6 near-identical location, hotspot trigger)
  {
    title: 'Large pothole on main road near bus stop',
    description: 'There is a massive pothole approximately 2 feet wide and 8 inches deep on the main road near the bus stand. Vehicles swerve dangerously and two accidents have already occurred this week.',
    category: 'Roads and Potholes',
    lat: CLUSTER_A.lat, lng: CLUSTER_A.lng,
    status: 'In Progress', created_at: daysAgo(5)
  },
  {
    title: 'Road depression causing vehicle damage',
    description: 'A severe road depression has developed outside the apartment complex. Multiple vehicles have suffered tyre and suspension damage. Immediate repair required.',
    category: 'Roads and Potholes',
    lat: jitter(CLUSTER_A.lat), lng: jitter(CLUSTER_A.lng),
    status: 'Assigned', created_at: daysAgo(4)
  },
  {
    title: 'Multiple potholes on arterial road',
    description: 'The stretch from the signal to the flyover has at least 7 potholes. During rain, they fill with water making them invisible and very dangerous for two-wheelers.',
    category: 'Roads and Potholes',
    lat: jitter(CLUSTER_A.lat), lng: jitter(CLUSTER_A.lng),
    status: 'Under Review', created_at: daysAgo(3)
  },
  {
    title: 'Pothole near school zone — safety hazard',
    description: 'A deep pothole near the school entrance poses a serious risk to children crossing the road. School buses have been swerving onto the footpath to avoid it.',
    category: 'Roads and Potholes',
    lat: jitter(CLUSTER_A.lat), lng: jitter(CLUSTER_A.lng),
    status: 'Submitted', created_at: daysAgo(2)
  },
  {
    title: 'Road surface crumbling after last monsoon',
    description: 'The road surface has completely broken down after the monsoon. Loose gravel and sharp edges are causing punctures. The entire 200-metre stretch needs resurfacing.',
    category: 'Roads and Potholes',
    lat: jitter(CLUSTER_A.lat), lng: jitter(CLUSTER_A.lng),
    status: 'Submitted', created_at: daysAgo(1)
  },
  {
    title: 'Sunken manhole cover creating road hazard',
    description: 'The manhole cover has sunk about 6 inches below road level creating a sudden drop. A motorcyclist fell yesterday. Needs urgent attention.',
    category: 'Roads and Potholes',
    lat: jitter(CLUSTER_A.lat), lng: jitter(CLUSTER_A.lng),
    status: 'Submitted', created_at: daysAgo(0)
  },

  // CLUSTER B — Water Supply and Drainage (5 complaints)
  {
    title: 'Burst water main flooding street',
    description: 'A water main has burst near the junction and water has been flowing onto the road for two days. The road is now flooded and impassable. Urgent repair needed.',
    category: 'Water Supply',
    lat: CLUSTER_B.lat, lng: CLUSTER_B.lng,
    status: 'In Progress', created_at: daysAgo(6)
  },
  {
    title: 'No water supply for three days',
    description: 'Our area has had no piped water supply for three consecutive days. There is no prior notice from the authority. Residents are buying expensive water from tankers.',
    category: 'Water Supply',
    lat: jitter(CLUSTER_B.lat), lng: jitter(CLUSTER_B.lng),
    status: 'Resolved', created_at: daysAgo(10)
  },
  {
    title: 'Storm drain completely blocked',
    description: 'The storm water drain on the main road is completely choked with debris and plastic waste. Even light rain causes waterlogging that lasts for hours.',
    category: 'Drainage and Sewage',
    lat: jitter(CLUSTER_B.lat), lng: jitter(CLUSTER_B.lng),
    status: 'Under Review', created_at: daysAgo(3)
  },
  {
    title: 'Sewage overflow onto footpath',
    description: 'The sewage drain is overflowing and raw sewage is spilling onto the footpath and road. The smell is unbearable and poses a serious health hazard to residents.',
    category: 'Drainage and Sewage',
    lat: jitter(CLUSTER_B.lat), lng: jitter(CLUSTER_B.lng),
    status: 'Assigned', created_at: daysAgo(2)
  },
  {
    title: 'Waterlogging after every rain event',
    description: 'The area floods within minutes of any rainfall due to inadequate drainage. Shops and homes are affected. This has been an ongoing problem for two monsoon seasons.',
    category: 'Drainage and Sewage',
    lat: jitter(CLUSTER_B.lat), lng: jitter(CLUSTER_B.lng),
    status: 'Submitted', created_at: daysAgo(1)
  },

  // CLUSTER C — Garbage and Waste Management (4 complaints)
  {
    title: 'Garbage not collected for a week',
    description: 'BBMP collection has not visited our area for 7 days. Waste is piling up outside homes and attracting dogs and insects. Residents are extremely concerned about hygiene.',
    category: 'Garbage and Waste Management',
    lat: CLUSTER_C.lat, lng: CLUSTER_C.lng,
    status: 'Resolved', created_at: daysAgo(8)
  },
  {
    title: 'Overflowing garbage bin near market',
    description: 'The large community bin near the market is overflowing. Garbage is spilling onto the road. Vehicles are running over waste and spreading it further. Requires immediate clearance.',
    category: 'Garbage and Waste Management',
    lat: jitter(CLUSTER_C.lat), lng: jitter(CLUSTER_C.lng),
    status: 'Submitted', created_at: daysAgo(1)
  },
  {
    title: 'Illegal dumping at vacant plot',
    description: 'Residents and contractors are illegally dumping construction waste and household garbage at the vacant plot on the corner. The pile is growing daily and attracting vermin.',
    category: 'Garbage and Waste Management',
    lat: jitter(CLUSTER_C.lat), lng: jitter(CLUSTER_C.lng),
    status: 'Under Review', created_at: daysAgo(4)
  },
  {
    title: 'Wet and dry waste not being segregated by collector',
    description: 'The garbage collection vehicle is mixing wet and dry waste despite residents segregating carefully. This defeats the purpose of segregation. Please take action.',
    category: 'Garbage and Waste Management',
    lat: jitter(CLUSTER_C.lat), lng: jitter(CLUSTER_C.lng),
    status: 'Submitted', created_at: daysAgo(0)
  },

  // Standalone — Streetlights and Electricity
  { title: 'Street light not working for a month', description: 'The street light at the intersection near the park has been out for over a month. The area is completely dark at night and there have been incidents of chain snatching. Please fix urgently.', category: 'Streetlights and Electricity', lat: 12.9610, lng: 77.6387, status: 'Assigned', created_at: daysAgo(12) },
  { title: 'Multiple street lights flickering', description: 'Five consecutive street lights on the main avenue are flickering on and off through the night. This disturbs residents and is also a safety concern for pedestrians and drivers.', category: 'Streetlights and Electricity', lat: 12.9550, lng: 77.6510, status: 'Submitted', created_at: daysAgo(2) },
  { title: 'Fallen electrical wire across footpath', description: 'A low-hanging electrical wire has fallen across the footpath after last night\'s storm. It appears to be live. This is an extremely urgent safety emergency. Please respond immediately.', category: 'Streetlights and Electricity', lat: 12.9480, lng: 77.6720, status: 'In Progress', created_at: daysAgo(0) },

  // Standalone — Public Sanitation
  { title: 'Public toilet in deplorable condition', description: 'The public toilet near the bus stand has not been cleaned in weeks. It is overflowing and unusable. Women and elderly citizens are particularly affected. Immediate cleaning required.', category: 'Public Sanitation', lat: 12.9760, lng: 77.5900, status: 'Under Review', created_at: daysAgo(5) },
  { title: 'Open defecation near railway line', description: 'There is open defecation occurring near the railway embankment every morning. This is a serious public health issue. More toilet facilities or enforcement action required.', category: 'Public Sanitation', lat: 12.9900, lng: 77.5750, status: 'Submitted', created_at: daysAgo(3) },

  // Standalone — Public Infrastructure
  { title: 'Broken footpath tiles causing injuries', description: 'Several footpath tiles near the hospital entrance have broken and created sharp edges. An elderly pedestrian fell and was injured last week. Urgent repair needed.', category: 'Public Infrastructure', lat: 12.9310, lng: 77.6800, status: 'Submitted', created_at: daysAgo(7) },
  { title: 'Bus shelter roof collapsed', description: 'The roof of the bus shelter near the school has collapsed. Commuters, including school children, are standing in the sun and rain with no shelter. Needs immediate repair.', category: 'Public Infrastructure', lat: 12.9420, lng: 77.6600, status: 'Assigned', created_at: daysAgo(9) },
  { title: 'Park boundary wall crumbling', description: 'The boundary wall of the public park is crumbling and sections have collapsed. Children using the park are at risk. The collapsed section also allows unauthorised access.', category: 'Public Infrastructure', lat: 12.9650, lng: 77.7100, status: 'Under Review', created_at: daysAgo(4) },
  { title: 'Traffic signal non-functional at busy intersection', description: 'The traffic signal at the main crossroads has been malfunctioning for 3 days. Traffic is chaotic and near-miss accidents are occurring. Police management alone is not sufficient.', category: 'Public Infrastructure', lat: 12.9530, lng: 77.6950, status: 'Resolved', created_at: daysAgo(14) },

  // Other / Edge cases
  { title: 'Stray dogs attacking pedestrians', description: 'A pack of aggressive stray dogs near the colony entrance has attacked three pedestrians in the past week. Children are afraid to walk to school. Request for animal control intervention.', category: 'Other', lat: 12.9200, lng: 77.6150, status: 'Submitted', created_at: daysAgo(2) },
  { title: 'Noise pollution from construction site at night', description: 'A construction site is running heavy machinery from 11 PM to 4 AM violating noise pollution norms. Residents cannot sleep. Please take regulatory action against the contractor.', category: 'Other', lat: 12.9850, lng: 77.7200, status: 'Submitted', created_at: daysAgo(1) },
];

async function seed() {
  const supabase = getSupabaseAdmin();
  console.log(`Seeding ${COMPLAINTS.length} synthetic complaints for user: ${userId}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const c of COMPLAINTS) {
    const row = {
      user_id: userId,
      title: c.title,
      description: c.description,
      category: c.category,
      latitude: c.lat,
      longitude: c.lng,
      location_description: `Near ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`,
      status: c.status || 'Submitted',
      priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      ai_status: 'pending',
      status_history: [{ status: c.status || 'Submitted', note: 'Seeded complaint', updatedBy: userId, timestamp: c.created_at }],
      created_at: c.created_at,
      updated_at: c.created_at,
    };

    const { error } = await supabase.from('complaints').insert(row);
    if (error) {
      console.error(`  ✗ "${c.title.slice(0, 50)}" → ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ "${c.title.slice(0, 60)}"`);
      successCount++;
    }
  }

  console.log('');
  console.log(`Done: ${successCount} inserted, ${errorCount} failed.`);
  console.log('');
  console.log('Hotspot clusters seeded:');
  console.log(`  Cluster A (Roads)    — ${CLUSTER_A.lat}, ${CLUSTER_A.lng} — 6 complaints`);
  console.log(`  Cluster B (Water)    — ${CLUSTER_B.lat}, ${CLUSTER_B.lng} — 5 complaints`);
  console.log(`  Cluster C (Garbage)  — ${CLUSTER_C.lat}, ${CLUSTER_C.lng} — 4 complaints`);
  console.log('');
  console.log('Next step: Go to http://localhost:5173/map to verify markers and hotspot circles appear.');
}

seed().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
