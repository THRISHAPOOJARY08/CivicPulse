const { LIMITS } = require('../config/constants');

const GRID_SIZE = LIMITS.HOTSPOT_GRID_SIZE_DEGREES || 0.01;
const MIN_COMPLAINTS_THRESHOLD = LIMITS.HOTSPOT_MIN_COMPLAINTS || 3;

/**
 * Normalizes floating point numbers to avoid precision discrepancies.
 */
const roundCoord = (val, decimals = 4) => {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
};

/**
 * Calculates in-memory geographic hotspots from a list of complaints.
 * 
 * Logic:
 * 1. Filters complaints with valid latitude (-90 to 90) and longitude (-180 to 180).
 * 2. Quantizes coordinates into fixed grid cells of size 0.01 degrees (~1km x 1km).
 * 3. Aggregates complaint count, category breakdown, status, and priority breakdown per cell.
 * 4. Identifies cells containing >= 3 complaints (threshold).
 * 5. Returns center coordinates, bounding boxes, and metrics.
 * 
 * Never writes or persists results to Firestore.
 * 
 * @param {Array<Object>} complaints - List of complaint documents
 * @returns {Array<Object>} Hotspots sorted by complaint count descending
 */
const calculateHotspots = (complaints = []) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    return [];
  }

  const cells = new Map();

  for (const complaint of complaints) {
    const lat = Number(complaint.latitude);
    const lon = Number(complaint.longitude);

    // Skip invalid coordinates
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      continue;
    }

    // Quantize into grid coordinates
    const gridLat = roundCoord(Math.floor(lat / GRID_SIZE) * GRID_SIZE);
    const gridLon = roundCoord(Math.floor(lon / GRID_SIZE) * GRID_SIZE);
    const cellKey = `${gridLat.toFixed(4)},${gridLon.toFixed(4)}`;

    if (!cells.has(cellKey)) {
      cells.set(cellKey, {
        cellKey,
        gridLat,
        gridLon,
        centerLatitude: roundCoord(gridLat + (GRID_SIZE / 2)),
        centerLongitude: roundCoord(gridLon + (GRID_SIZE / 2)),
        bounds: {
          south: gridLat,
          north: roundCoord(gridLat + GRID_SIZE),
          west: gridLon,
          east: roundCoord(gridLon + GRID_SIZE)
        },
        complaintCount: 0,
        categoryBreakdown: {},
        statusBreakdown: {},
        priorityBreakdown: {},
        complaintIds: []
      });
    }

    const cell = cells.get(cellKey);
    cell.complaintCount += 1;
    cell.complaintIds.push(complaint.id);

    // Category breakdown
    const category = complaint.category || 'Other';
    cell.categoryBreakdown[category] = (cell.categoryBreakdown[category] || 0) + 1;

    // Status breakdown
    const status = complaint.status || 'Submitted';
    cell.statusBreakdown[status] = (cell.statusBreakdown[status] || 0) + 1;

    // Priority breakdown
    const priority = complaint.priority || 'Medium';
    cell.priorityBreakdown[priority] = (cell.priorityBreakdown[priority] || 0) + 1;
  }

  // Filter only cells meeting or exceeding the minimum complaint threshold
  const hotspots = [];
  for (const cell of cells.values()) {
    if (cell.complaintCount >= MIN_COMPLAINTS_THRESHOLD) {
      hotspots.push(cell);
    }
  }

  // Sort descending by density / complaint count
  hotspots.sort((a, b) => b.complaintCount - a.complaintCount);

  return hotspots;
};

module.exports = {
  calculateHotspots,
  GRID_SIZE,
  MIN_COMPLAINTS_THRESHOLD
};
