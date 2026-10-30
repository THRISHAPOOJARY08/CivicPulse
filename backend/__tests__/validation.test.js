/**
 * Validation Middleware Unit Tests
 * Tests complaint submission and status update validation — no DB, no network.
 */
const { validateComplaintSubmission, validateStatusUpdate } = require('../src/middleware/validateComplaint');

// Helper: mock Express req/res/next
function mockReqRes(body = {}) {
  const req = { body };
  const res = {
    _status: null,
    _json: null,
    status(code) { this._status = code; return this; },
    json(data) { this._json = data; return this; }
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('validateComplaintSubmission', () => {
  const validBody = {
    title: 'Pothole on main road',
    description: 'There is a large pothole causing accidents.',
    latitude: 12.9352,
    longitude: 77.6245
  };

  test('valid complaint passes through to next()', () => {
    const { req, res, next } = mockReqRes(validBody);
    validateComplaintSubmission(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res._status).toBeNull();
  });

  test('missing title → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, title: '' });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('missing description → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, description: '' });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('title over 120 chars → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, title: 'A'.repeat(121) });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
    expect(res._json.error.code).toBe('VALIDATION_ERROR');
  });

  test('description over 1000 chars → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, description: 'D'.repeat(1001) });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('invalid latitude (> 90) → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, latitude: 91 });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('invalid latitude (< -90) → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, latitude: -91 });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('invalid longitude (> 180) → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, longitude: 181 });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('invalid category → 400', () => {
    const { req, res, next } = mockReqRes({ ...validBody, category: 'NotACategory' });
    validateComplaintSubmission(req, res, next);
    expect(res._status).toBe(400);
  });

  test('valid optional category passes', () => {
    const { req, res, next } = mockReqRes({ ...validBody, category: 'Roads and Potholes' });
    validateComplaintSubmission(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('sets req.validatedComplaint with trimmed values', () => {
    const { req, res, next } = mockReqRes({ ...validBody, title: '  Pothole  ', description: '  Big issue  ' });
    validateComplaintSubmission(req, res, next);
    expect(req.validatedComplaint.title).toBe('Pothole');
    expect(req.validatedComplaint.description).toBe('Big issue');
  });
});

describe('validateStatusUpdate', () => {
  test('valid status passes', () => {
    const { req, res, next } = mockReqRes({ status: 'In Progress', note: 'Working on it' });
    validateStatusUpdate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('missing status → 400', () => {
    const { req, res, next } = mockReqRes({ note: 'some note' });
    validateStatusUpdate(req, res, next);
    expect(res._status).toBe(400);
  });

  test('invalid status enum → 400', () => {
    const { req, res, next } = mockReqRes({ status: 'Pending' });
    validateStatusUpdate(req, res, next);
    expect(res._status).toBe(400);
  });

  test('Rejected without note → 400', () => {
    const { req, res, next } = mockReqRes({ status: 'Rejected', note: '' });
    validateStatusUpdate(req, res, next);
    expect(res._status).toBe(400);
    expect(res._json.error.message).toMatch(/rejection reason/i);
  });

  test('Rejected with note → passes', () => {
    const { req, res, next } = mockReqRes({ status: 'Rejected', note: 'Duplicate complaint' });
    validateStatusUpdate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('all valid statuses are accepted', () => {
    const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    statuses.forEach(status => {
      const { req, res, next } = mockReqRes({
        status,
        note: status === 'Rejected' ? 'Reason required' : ''
      });
      validateStatusUpdate(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Constants', () => {
  const { ALLOWED_CATEGORIES, STATUS_LIFECYCLE, LIMITS } = require('../src/config/constants');

  test('8 allowed categories defined', () => {
    expect(ALLOWED_CATEGORIES).toHaveLength(8);
  });

  test('STATUS_LIFECYCLE has 6 states including Rejected', () => {
    expect(STATUS_LIFECYCLE).toContain('Submitted');
    expect(STATUS_LIFECYCLE).toContain('Resolved');
    expect(STATUS_LIFECYCLE).toContain('Rejected');
    expect(STATUS_LIFECYCLE).toHaveLength(6);
  });

  test('TITLE_MAX_LENGTH is 120', () => {
    expect(LIMITS.TITLE_MAX_LENGTH).toBe(120);
  });

  test('DESCRIPTION_MAX_LENGTH is 1000', () => {
    expect(LIMITS.DESCRIPTION_MAX_LENGTH).toBe(1000);
  });

  test('HOTSPOT_MIN_COMPLAINTS is 3', () => {
    expect(LIMITS.HOTSPOT_MIN_COMPLAINTS).toBe(3);
  });

  test('HOTSPOT_GRID_SIZE_DEGREES is 0.01', () => {
    expect(LIMITS.HOTSPOT_GRID_SIZE_DEGREES).toBe(0.01);
  });
});
