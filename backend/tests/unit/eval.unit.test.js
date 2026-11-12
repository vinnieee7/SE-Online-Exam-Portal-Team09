describe('=== Unit Test Suite: Module M4 Evaluation, Results & Analytics ===', () => {

  describe('UT-Eval-01: Objective Auto-Grading Engine (OEP-F-013, TC-Eval-01)', () => {
    function computeAutoGrade(questionsWithAnswers) {
      let totalScore = 0;
      let hasSubjective = false;

      for (const item of questionsWithAnswers) {
        if (item.question_type === 'MCQ' || item.question_type === 'TrueFalse') {
          const studentAns = String(item.selected_option || '').trim().toLowerCase();
          const correctAns = String(item.correct_answer || '').trim().toLowerCase();
          if (studentAns === correctAns && studentAns !== '') {
            totalScore += item.marks;
          }
        } else if (item.question_type === 'ShortAnswer') {
          hasSubjective = true;
        }
      }

      return { totalScore, hasSubjective, status: hasSubjective ? 'submitted' : 'graded' };
    }

    test('correctly scores objective MCQ and True/False questions case-insensitively', () => {
      const mockAnswers = [
        { question_type: 'MCQ', marks: 2, selected_option: 'b', correct_answer: 'B' },
        { question_type: 'MCQ', marks: 3, selected_option: 'C', correct_answer: 'A' },
        { question_type: 'TrueFalse', marks: 1, selected_option: 'True', correct_answer: 'true' }
      ];

      const res = computeAutoGrade(mockAnswers);
      expect(res.totalScore).toBe(3); // 2 (Q1) + 0 (Q2) + 1 (Q3)
      expect(res.hasSubjective).toBe(false);
      expect(res.status).toBe('graded');
    });

    test('flags attempt as pending instructor review when subjective questions exist', () => {
      const mockAnswers = [
        { question_type: 'MCQ', marks: 2, selected_option: 'A', correct_answer: 'A' },
        { question_type: 'ShortAnswer', marks: 5, selected_option: 'Agile focuses on iterative development.' }
      ];

      const res = computeAutoGrade(mockAnswers);
      expect(res.totalScore).toBe(2);
      expect(res.hasSubjective).toBe(true);
      expect(res.status).toBe('submitted');
    });
  });

  describe('UT-Eval-02: Item Difficulty Index & Analytics Engine (OEP-F-016, TC-Eval-04)', () => {
    function calculateDifficultyMetrics(totalResponses, correctResponses) {
      if (!totalResponses || totalResponses === 0) {
        return { difficultyIndex: 0, difficultyLabel: 'N/A', accuracyRate: 0 };
      }
      const difficultyIndex = correctResponses / totalResponses;
      let difficultyLabel = 'Moderate';
      if (difficultyIndex >= 0.70) {
        difficultyLabel = 'Easy';
      } else if (difficultyIndex < 0.30) {
        difficultyLabel = 'Difficult';
      }
      return {
        difficultyIndex: parseFloat(difficultyIndex.toFixed(2)),
        difficultyLabel,
        accuracyRate: parseFloat((difficultyIndex * 100).toFixed(1))
      };
    }

    test('classifies high-success questions as Easy (P >= 0.70)', () => {
      const metrics = calculateDifficultyMetrics(50, 42); // 84%
      expect(metrics.difficultyIndex).toBe(0.84);
      expect(metrics.difficultyLabel).toBe('Easy');
      expect(metrics.accuracyRate).toBe(84.0);
    });

    test('classifies moderate-success questions as Moderate (0.30 <= P < 0.70)', () => {
      const metrics = calculateDifficultyMetrics(50, 25); // 50%
      expect(metrics.difficultyIndex).toBe(0.50);
      expect(metrics.difficultyLabel).toBe('Moderate');
    });

    test('classifies low-success questions as Difficult (P < 0.30)', () => {
      const metrics = calculateDifficultyMetrics(50, 10); // 20%
      expect(metrics.difficultyIndex).toBe(0.20);
      expect(metrics.difficultyLabel).toBe('Difficult');
    });
  });

  describe('UT-Eval-03: Scorecard Privacy & IDOR Safeguard (OEP-SR-005, DEF-005, TC-Sec-06)', () => {
    function verifyScorecardAccess(requestingUser, attemptStudentId) {
      if (!requestingUser) return { allowed: false, status: 401 };
      if (requestingUser.role === 'Admin' || requestingUser.role === 'Instructor') {
        return { allowed: true, status: 200 };
      }
      if (requestingUser.role === 'Student' && requestingUser.id === attemptStudentId) {
        return { allowed: true, status: 200 };
      }
      return { allowed: false, status: 403, error: 'Forbidden: You can only view your own scorecard' };
    }

    test('permits student to view their own scorecard', () => {
      const student = { id: 10, role: 'Student' };
      const res = verifyScorecardAccess(student, 10);
      expect(res.allowed).toBe(true);
      expect(res.status).toBe(200);
    });

    test('blocks student from viewing another student scorecard (IDOR protection)', () => {
      const candidateA = { id: 10, role: 'Student' };
      const candidateB_AttemptStudentId = 20;

      const res = verifyScorecardAccess(candidateA, candidateB_AttemptStudentId);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    test('permits instructors and administrators to inspect candidate scorecards', () => {
      const instructor = { id: 2, role: 'Instructor' };
      const admin = { id: 1, role: 'Admin' };

      expect(verifyScorecardAccess(instructor, 10).allowed).toBe(true);
      expect(verifyScorecardAccess(admin, 10).allowed).toBe(true);
    });
  });
});

