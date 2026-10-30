/**
 * Priority Service Unit Tests
 * Tests deterministic priority scoring without any external dependencies.
 */
const { calculatePriority } = require('../src/services/priorityService');

describe('calculatePriority — baseline', () => {
  test('returns a valid priority object shape', () => {
    const result = calculatePriority({ title: 'Pothole', description: 'Small pothole', category: 'Roads and Potholes' });
    expect(result).toHaveProperty('priority');
    expect(result).toHaveProperty('priorityScore');
    expect(result).toHaveProperty('priorityReasons');
    expect(Array.isArray(result.priorityReasons)).toBe(true);
  });

  test('baseline routine complaint scores Low (< 20)', () => {
    const result = calculatePriority({ title: 'Minor crack', description: 'Small crack on footpath', category: 'Public Infrastructure' });
    expect(result.priorityScore).toBeLessThan(20);
    expect(result.priority).toBe('Low');
  });

  test('same input always produces same result (deterministic)', () => {
    const input = { title: 'Pothole on road', description: 'Deep pothole', category: 'Roads and Potholes' };
    const r1 = calculatePriority(input);
    const r2 = calculatePriority(input);
    expect(r1.priority).toBe(r2.priority);
    expect(r1.priorityScore).toBe(r2.priorityScore);
  });
});

describe('calculatePriority — safety escalation', () => {
  test('fallen electrical wire scores Critical (>= 60)', () => {
    const result = calculatePriority({
      title: 'Fallen electrical wire on road',
      description: 'A live wire has fallen across the main road near the school.',
      category: 'Streetlights and Electricity'
    });
    expect(result.priorityScore).toBeGreaterThanOrEqual(60);
    expect(result.priority).toBe('Critical');
  });

  test('severe flooding escalates to Critical', () => {
    const result = calculatePriority({
      title: 'Severe flash flooding',
      description: 'Severe flooding blocking main road near hospital junction',
      category: 'Drainage and Sewage'
    });
    expect(result.priorityScore).toBeGreaterThanOrEqual(60);
    expect(result.priority).toBe('Critical');
  });

  test('open manhole escalates to at least High (>= 40)', () => {
    const result = calculatePriority({
      title: 'Open manhole',
      description: 'An open manhole with no cover on a quiet side street.',
      category: 'Drainage and Sewage'
    });
    expect(result.priorityScore).toBeGreaterThanOrEqual(40);
    expect(['High', 'Critical']).toContain(result.priority);
  });

  test('accident mention raises score by safety risk bonus', () => {
    const withAccident = calculatePriority({ title: 'Pothole accident', description: 'Accident happened due to pothole injury', category: 'Roads and Potholes' });
    const without = calculatePriority({ title: 'Pothole', description: 'Small pothole on road', category: 'Roads and Potholes' });
    expect(withAccident.priorityScore).toBeGreaterThan(without.priorityScore);
  });
});

describe('calculatePriority — public location bonus', () => {
  test('complaint near school gets public location bonus', () => {
    const withSchool = calculatePriority({ title: 'Road damage near school', description: 'Road broken near school entrance', category: 'Roads and Potholes' });
    const without = calculatePriority({ title: 'Road damage', description: 'Road broken on quiet lane', category: 'Roads and Potholes' });
    expect(withSchool.priorityScore).toBeGreaterThan(without.priorityScore);
  });

  test('main road complaint gets disruption bonus', () => {
    const result = calculatePriority({ title: 'Pothole on main road', description: 'Traffic jam on main road due to pothole', category: 'Roads and Potholes' });
    expect(result.priorityScore).toBeGreaterThan(5);
  });
});

describe('calculatePriority — score bands', () => {
  test('score 0–19 → Low', () => {
    const r = calculatePriority({ title: 'Bin lid missing', description: 'Bin lid is missing', category: 'Garbage and Waste Management' });
    if (r.priorityScore < 20) expect(r.priority).toBe('Low');
  });

  test('score stays within 0–100', () => {
    const extreme = calculatePriority({
      title: 'Live exposed electrical wire fallen near school',
      description: 'Severe flash flooding and live wire near hospital main road accident injury hazard',
      category: 'Streetlights and Electricity'
    });
    expect(extreme.priorityScore).toBeGreaterThanOrEqual(0);
    expect(extreme.priorityScore).toBeLessThanOrEqual(100);
  });
});
