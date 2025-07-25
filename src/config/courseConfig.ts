// Course configuration for Courses page and related components

const courseConfig = {
  monthsForRewatch: 3, // Change to 4 for 4 months, etc.
  daysPerLevel: 3,
  //   dayGapMs: 24 * 60 * 60 * 1000, // Time gap between days in ms (default: 24 hours)
  dayGapMs: 10 * 1000,
  testQuestions: [
    {
      q: 'What is the main benefit of meditation in this course?',
      options: ['Relaxation', 'Self-realization', 'Entertainment', 'Physical strength'],
      answer: 'Self-realization',
    },
    {
      q: 'How many days are there in each level?',
      options: ['2', '3', '5', '7'],
      answer: '3',
    },
  ],
  // Meditation test pass criteria
  meditationTestMinMinutes: 30, // Minimum minutes required to pass
  meditationTestMinClosedPct: 90, // Minimum % eyes closed
  meditationTestMaxHeadMoveFactor: 0.05, // Max head movement factor (per min)
  meditationTestMaxHandMoveFactor: 0.05, // Max hand movement factor (per min)
  meditationTestMinHandStability: 0.5, // Minimum hand stability
};

export default courseConfig;
