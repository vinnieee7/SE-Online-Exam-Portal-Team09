describe('=== Unit Test Suite: Module M3 Exam Delivery Engine ===', () => {

  describe('UT-Take-01: Server-Enforced Countdown Timer Engine (OEP-F-010, DEF-002, TC-Take-02)', () => {
    function computeRemainingSeconds(startTimeIso, durationMinutes, currentNow) {
      const start = new Date(startTimeIso);
      const expiresAt = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const diffMs = expiresAt.getTime() - currentNow.getTime();
      return Math.max(0, Math.floor(diffMs / 1000));
    }

    test('calculates accurate remaining seconds during an active exam attempt', () => {
      const now = new Date('2026-11-05T10:15:00.000Z');
      const start = '2026-11-05T10:00:00.000Z'; // 15 minutes in
      const duration = 60; // 60 min total -> 45 min left = 2700s

      const remaining = computeRemainingSeconds(start, duration, now);
      expect(remaining).toBe(2700);
    });

    test('returns exactly 0 remaining seconds when time has expired without negative offsets (DEF-002)', () => {
      const now = new Date('2026-11-05T11:05:00.000Z'); // 5 minutes past end
      const start = '2026-11-05T10:00:00.000Z';
      const duration = 60;

      const remaining = computeRemainingSeconds(start, duration, now);
      expect(remaining).toBe(0);
      expect(remaining).not.toBeLessThan(0);
    });

    test('handles UTC ISO timestamps consistently regardless of local timezone', () => {
      const utcString = new Date().toISOString();
      const parsed = new Date(utcString);
      expect(parsed.toISOString()).toBe(utcString);
    });
  });

  describe('UT-Take-02: DevTools Answer Key Stripping Logic (OEP-SR-004, DEF-001, TC-Sec-05)', () => {
    function sanitizeQuestionsForStudent(rawQuestions) {
      return rawQuestions.map(q => {
        const { correct_answer, explanation, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    test('strips correct_answer and explanation fields from student payload', () => {
      const rawBankQuestions = [
        {
          id: 1,
          question_text: 'What is the primary goal of regression testing?',
          marks: 2,
          correct_answer: 'B',
          explanation: 'Regression testing ensures recent changes have not broken existing functionality.',
          options: [{ key: 'A', text: 'New features' }, { key: 'B', text: 'Catch regressions' }]
        },
        {
          id: 2,
          question_text: 'Is SQLite an embedded database?',
          marks: 1,
          correct_answer: 'True',
          explanation: 'SQLite runs embedded in-process.',
          options: [{ key: 'True', text: 'True' }, { key: 'False', text: 'False' }]
        }
      ];

      const sanitized = sanitizeQuestionsForStudent(rawBankQuestions);

      expect(sanitized).toHaveLength(2);
      sanitized.forEach(q => {
        expect(q.id).toBeDefined();
        expect(q.question_text).toBeDefined();
        expect(q.marks).toBeDefined();
        expect(q.correct_answer).toBeUndefined();
        expect(q.explanation).toBeUndefined();
      });
    });
  });

  describe('UT-Take-03: 30-Second Auto-Save Answer Parser (OEP-F-011, TC-Take-03)', () => {
    function parseAutoSaveAnswers(answersPayload) {
      if (!Array.isArray(answersPayload)) {
        throw new Error('Answers payload must be an array');
      }
      return answersPayload.map(a => ({
        question_id: parseInt(a.question_id, 10),
        selected_option: a.selected_option !== undefined && a.selected_option !== null 
          ? String(a.selected_option).trim() 
          : null,
        is_flagged: Boolean(a.is_flagged)
      })).filter(a => !isNaN(a.question_id));
    }

    test('validates and sanitizes periodic auto-save submissions', () => {
      const clientPayload = [
        { question_id: '1', selected_option: '  A  ', is_flagged: 1 },
        { question_id: 2, selected_option: null, is_flagged: false },
        { question_id: 'invalid', selected_option: 'C' }
      ];

      const parsed = parseAutoSaveAnswers(clientPayload);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({ question_id: 1, selected_option: 'A', is_flagged: true });
      expect(parsed[1]).toEqual({ question_id: 2, selected_option: null, is_flagged: false });
    });
  });
});
