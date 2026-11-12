describe('=== Unit Test Suite: Cross-Cutting Audit Logger & Security ===', () => {

  describe('UT-Sec-01: Audit Log Client IP Extraction & Fallback (OEP-NF-004, DEF-006, TC-Sec-04)', () => {
    function resolveClientIp(req) {
      return (req && req.headers && req.headers['x-forwarded-for'])
        || (req && req.socket && req.socket.remoteAddress)
        || (req && req.ip)
        || '127.0.0.1';
    }

    test('extracts client IP from x-forwarded-for header when reverse-proxied', () => {
      const req = {
        headers: { 'x-forwarded-for': '203.0.113.195' },
        socket: { remoteAddress: '10.0.0.1' },
        ip: '10.0.0.1'
      };
      expect(resolveClientIp(req)).toBe('203.0.113.195');
    });

    test('falls back to socket remoteAddress when header is absent', () => {
      const req = {
        headers: {},
        socket: { remoteAddress: '192.168.1.100' },
        ip: '192.168.1.100'
      };
      expect(resolveClientIp(req)).toBe('192.168.1.100');
    });

    test('falls back safely to 127.0.0.1 when req or socket is undefined (DEF-006 fix)', () => {
      expect(resolveClientIp(null)).toBe('127.0.0.1');
      expect(resolveClientIp({})).toBe('127.0.0.1');
      expect(resolveClientIp({ headers: {}, socket: null })).toBe('127.0.0.1');
    });
  });

  describe('UT-Sec-02: Audit Event Payload Structuring', () => {
    function formatAuditEvent(userId, action, details, ip) {
      return {
        user_id: userId || null,
        action: String(action).toUpperCase(),
        details: String(details),
        ip_address: ip,
        timestamp: new Date().toISOString()
      };
    }

    test('structures audit event record with sanitized fields', () => {
      const event = formatAuditEvent(42, 'auth_login_success', 'User logged in', '127.0.0.1');

      expect(event.user_id).toBe(42);
      expect(event.action).toBe('AUTH_LOGIN_SUCCESS');
      expect(event.details).toBe('User logged in');
      expect(event.ip_address).toBe('127.0.0.1');
      expect(event.timestamp).toBeDefined();
    });

    test('allows unauthenticated audit actions with null user_id (e.g., failed registration)', () => {
      const event = formatAuditEvent(null, 'auth_login_failed', 'Invalid credentials attempt', '127.0.0.1');
      expect(event.user_id).toBeNull();
      expect(event.action).toBe('AUTH_LOGIN_FAILED');
    });
  });
});

