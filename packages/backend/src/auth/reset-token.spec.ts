import { buildResetToken, hashResetToken, parseResetToken } from './reset-token';

describe('reset-token', () => {
  describe('hashResetToken', () => {
    it('should produce a sha256 hex digest', () => {
      expect(hashResetToken('abc')).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('buildResetToken', () => {
    it('should produce a presentation and its digest', () => {
      const { presentation, digest } = buildResetToken();

      expect(presentation).toMatch(/^[a-f0-9]+\.[0-9]+$/);
      expect(digest).toBe(hashResetToken(presentation));
    });
  });

  describe('parseResetToken', () => {
    it('should parse a valid token', () => {
      const { presentation, digest } = buildResetToken();
      const parsed = parseResetToken(presentation);

      expect(parsed?.digest).toBe(digest);
      expect(parsed?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should return null for a token without an expiry separator', () => {
      expect(parseResetToken('abc')).toBeNull();
    });

    it('should return null for a non-numeric expiry', () => {
      expect(parseResetToken('abc.xyz')).toBeNull();
    });
  });
});
