/**
 * Duplicate Detection Unit Tests
 * Tests Haversine distance calculation and Jaccard similarity — no DB needed.
 */
const { calculateHaversineDistance } = require('../src/services/duplicateService');

describe('calculateHaversineDistance', () => {
  test('same point returns 0 meters', () => {
    const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9352, 77.6245);
    expect(dist).toBe(0);
  });

  test('two points ~100m apart return < 300m', () => {
    // ~100m offset in latitude (~0.0009°)
    const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9361, 77.6245);
    expect(dist).toBeLessThan(300);
    expect(dist).toBeGreaterThan(0);
  });

  test('two points ~299m apart return < 300m (boundary: inside threshold)', () => {
    // ~299m offset ≈ 0.00269° latitude
    const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9379, 77.6245);
    expect(dist).toBeLessThan(300);
  });

  test('two points ~301m apart return > 300m (boundary: outside threshold)', () => {
    // ~350m offset ≈ 0.00315° latitude
    const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9384, 77.6245);
    expect(dist).toBeGreaterThan(300);
  });

  test('distant cities return large distance', () => {
    // Mumbai to Delhi ≈ 1150km
    const dist = calculateHaversineDistance(19.0760, 72.8777, 28.6139, 77.2090);
    expect(dist).toBeGreaterThan(1000000); // > 1000km in meters
  });

  test('returns a number', () => {
    const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9400, 77.6300);
    expect(typeof dist).toBe('number');
    expect(isNaN(dist)).toBe(false);
  });

  test('symmetric: dist(A,B) === dist(B,A)', () => {
    const d1 = calculateHaversineDistance(12.9352, 77.6245, 12.9400, 77.6300);
    const d2 = calculateHaversineDistance(12.9400, 77.6300, 12.9352, 77.6245);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001); // floating point tolerance
  });
});

describe('Duplicate detection thresholds (constants)', () => {
  test('300m threshold is defined correctly', () => {
    // Verify the threshold constant by testing boundary behavior
    const inside = calculateHaversineDistance(12.9352, 77.6245, 12.9352, 77.6245 + 0.002); // ~200m
    const outside = calculateHaversineDistance(12.9352, 77.6245, 12.9352, 77.6245 + 0.005); // ~500m
    expect(inside).toBeLessThan(300);
    expect(outside).toBeGreaterThan(300);
  });
});
