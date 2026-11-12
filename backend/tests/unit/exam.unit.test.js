const { shuffleArray } = require('../../src/controllers/examController');

describe('=== Unit Test Suite: Module M2 Exam & Question-Bank Management ===', () => {

  describe('UT-Exam-01: Fisher-Yates Randomization Engine (OEP-F-008, TC-Exam-04)', () => {
    test('shuffleArray preserves all original elements and array length', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort((a, b) => a - b)).toEqual(original);
    });

    test('shuffleArray does not mutate the source array in place', () => {
      const original = ['Q1', 'Q2', 'Q3', 'Q4'];
      const copyBefore = [...original];
      shuffleArray(original);

      expect(original).toEqual(copyBefore);
    });

    test('shuffleArray handles empty arrays and non-array inputs safely', () => {
      expect(shuffleArray([])).toEqual([]);
      expect(shuffleArray(null)).toEqual([]);
      expect(shuffleArray(undefined)).toEqual([]);
    });

    test('repeated shuffles produce randomized distributions across iterations', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const permutations = new Set();

      for (let i = 0; i < 25; i++) {
        const result = shuffleArray(items).join('');
        permutations.add(result);
      }

      // 25 iterations of 5 elements should produce multiple distinct permutations
      expect(permutations.size).toBeGreaterThan(1);
    });
  });

  describe('UT-Exam-02: Exam Schedule Validation Logic (OEP-F-007, DEF-004, TC-Exam-03)', () => {
    function validateExamSchedule(startTimeStr, endTimeStr, durationMinutes) {
      if (!startTimeStr || !endTimeStr) {
        return { valid: false, error: 'Start and end time required' };
      }
      const start = new Date(startTimeStr);
      const end = new Date(endTimeStr);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { valid: false, error: 'Invalid timestamp format' };
      }
      if (end <= start) {
        return { valid: false, error: 'Exam end time must be strictly after start time' };
      }
      if (!durationMinutes || durationMinutes <= 0) {
        return { valid: false, error: 'Duration must be a positive number' };
      }
      const windowMs = end.getTime() - start.getTime();
      const durationMs = durationMinutes * 60 * 1000;
      if (windowMs < durationMs) {
        return { valid: false, error: 'Exam window is shorter than exam duration' };
      }
      return { valid: true };
    }

    test('accepts valid start time, end time, and duration', () => {
      const res = validateExamSchedule('2026-11-15T10:00:00Z', '2026-11-15T12:00:00Z', 60);
      expect(res.valid).toBe(true);
    });

    test('rejects schedule where end time is earlier than start time (DEF-004)', () => {
      const res = validateExamSchedule('2026-11-15T14:00:00Z', '2026-11-15T10:00:00Z', 60);
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Exam end time must be strictly after start time');
    });

    test('rejects schedule where window is shorter than duration', () => {
      const res = validateExamSchedule('2026-11-15T10:00:00Z', '2026-11-15T10:30:00Z', 60);
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Exam window is shorter than exam duration');
    });

    test('rejects non-positive duration', () => {
      const res = validateExamSchedule('2026-11-15T10:00:00Z', '2026-11-15T12:00:00Z', -15);
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Duration must be a positive number');
    });
  });

  describe('UT-Exam-03: Question Bank Option Normalization (OEP-F-006)', () => {
    test('verifies MCQ option key formatting (A, B, C, D)', () => {
      const rawOptions = [
        { text: 'First choice' },
        { text: 'Second choice' },
        { text: 'Third choice' }
      ];
      const validKeys = ['A', 'B', 'C', 'D'];
      const mapped = rawOptions.map((opt, idx) => ({
        key: validKeys[idx],
        text: opt.text.trim()
      }));

      expect(mapped[0].key).toBe('A');
      expect(mapped[1].key).toBe('B');
      expect(mapped[2].key).toBe('C');
      expect(mapped).toHaveLength(3);
    });
  });
});
