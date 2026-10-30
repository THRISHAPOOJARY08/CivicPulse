/**
 * Hotspot Service Unit Tests
 * Tests in-memory grid-based hotspot calculation — no DB, no network.
 */
const { calculateHotspots, GRID_SIZE, MIN_COMPLAINTS_THRESHOLD } = require('../src/services/hotspotService');

// Helper: generate N complaints all within the same 0.01° grid cell
function makeCluster(lat, lng, count, category = 'Roads and Potholes') {
  return Array.from({ length: count }, (_, i) => ({
    id: `complaint-${i}`,
    latitude: lat + (i * 0.0001), // tiny offsets stay in same cell
    longitude: lng + (i * 0.0001),
    category,
    status: 'Submitted',
    priority: 'Medium'
  }));
}

describe('calculateHotspots — basic', () => {
  test('returns empty array for empty input', () => {
    expect(calculateHotspots([])).toEqual([]);
  });

  test('returns empty array for non-array input', () => {
    expect(calculateHotspots(null)).toEqual([]);
    expect(calculateHotspots(undefined)).toEqual([]);
  });

  test('returns empty array when all complaints have invalid coordinates', () => {
    const complaints = [
      { id: '1', latitude: NaN, longitude: 77.0 },
      { id: '2', latitude: 200, longitude: 77.0 }, // invalid lat
      { id: '3', latitude: 12.9, longitude: 200 }  // invalid lng
    ];
    expect(calculateHotspots(complaints)).toEqual([]);
  });
});

describe('calculateHotspots — threshold', () => {
  test(`${MIN_COMPLAINTS_THRESHOLD} complaints in one cell → 1 hotspot`, () => {
    const complaints = makeCluster(12.9352, 77.6245, MIN_COMPLAINTS_THRESHOLD);
    const hotspots = calculateHotspots(complaints);
    expect(hotspots).toHaveLength(1);
    expect(hotspots[0].complaintCount).toBe(MIN_COMPLAINTS_THRESHOLD);
  });

  test(`${MIN_COMPLAINTS_THRESHOLD - 1} complaints in one cell → 0 hotspots (below threshold)`, () => {
    const complaints = makeCluster(12.9352, 77.6245, MIN_COMPLAINTS_THRESHOLD - 1);
    const hotspots = calculateHotspots(complaints);
    expect(hotspots).toHaveLength(0);
  });

  test('1 complaint → no hotspot', () => {
    expect(calculateHotspots([{ id: '1', latitude: 12.9, longitude: 77.6, category: 'Other', status: 'Submitted', priority: 'Low' }])).toHaveLength(0);
  });
});

describe('calculateHotspots — multiple clusters', () => {
  test('two separate clusters each with 3+ complaints → 2 hotspots', () => {
    const clusterA = makeCluster(12.9352, 77.6245, 3); // Koramangala
    const clusterB = makeCluster(12.9784, 77.6408, 4); // Indiranagar (different grid cell)
    const hotspots = calculateHotspots([...clusterA, ...clusterB]);
    expect(hotspots).toHaveLength(2);
  });

  test('hotspots are sorted by complaint count descending', () => {
    const bigCluster = makeCluster(12.9352, 77.6245, 6);
    const smallCluster = makeCluster(12.9784, 77.6408, 3);
    const hotspots = calculateHotspots([...smallCluster, ...bigCluster]);
    expect(hotspots[0].complaintCount).toBeGreaterThanOrEqual(hotspots[1].complaintCount);
  });

  test('complaints spread across many cells → only dense cells are hotspots', () => {
    // 10 complaints spread across 10 different cells — no hotspot
    const spread = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      latitude: 12.90 + i * 0.05, // each 0.05° apart = different grid cells
      longitude: 77.60,
      category: 'Other', status: 'Submitted', priority: 'Low'
    }));
    expect(calculateHotspots(spread)).toHaveLength(0);
  });
});

describe('calculateHotspots — output shape', () => {
  test('hotspot has required fields', () => {
    const complaints = makeCluster(12.9352, 77.6245, 3);
    const hotspots = calculateHotspots(complaints);
    const h = hotspots[0];
    expect(h).toHaveProperty('complaintCount');
    expect(h).toHaveProperty('centerLatitude');
    expect(h).toHaveProperty('centerLongitude');
    expect(h).toHaveProperty('categoryBreakdown');
    expect(h).toHaveProperty('complaintIds');
    expect(Array.isArray(h.complaintIds)).toBe(true);
  });

  test('grid constants match expected values', () => {
    expect(GRID_SIZE).toBe(0.01);
    expect(MIN_COMPLAINTS_THRESHOLD).toBe(3);
  });
});
