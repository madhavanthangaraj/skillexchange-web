// utils/matchingEngine.js
// LMS-based Skill Matching Logic
// Simple scoring system — suitable for hackathon MVP

/**
 * Calculate match score between two users.
 * Score is based on how well their teach/learn skills overlap.
 *
 * Logic:
 * - For each skill A can teach that B wants to learn → +10 points
 * - For each skill B can teach that A wants to learn → +10 points
 * - A perfect bidirectional match scores higher
 * - Partial match still scores something (good for discovery)
 *
 * @param {Object} userA - User who initiates
 * @param {Object} userB - Potential match
 * @returns {number} matchScore (0–100+)
 */
const calculateMatchScore = (userA, userB) => {
  let score = 0;

  const teachA = userA.skillsToTeach.map((s) => s.toLowerCase().trim());
  const learnA = userA.skillsToLearn.map((s) => s.toLowerCase().trim());
  const teachB = userB.skillsToTeach.map((s) => s.toLowerCase().trim());
  const learnB = userB.skillsToLearn.map((s) => s.toLowerCase().trim());

  // A teaches what B wants to learn
  for (const skill of teachA) {
    if (learnB.includes(skill)) {
      score += 10;
    }
  }

  // B teaches what A wants to learn
  for (const skill of teachB) {
    if (learnA.includes(skill)) {
      score += 10;
    }
  }

  // Bonus: Both sides benefit — mutual exchange
  const mutualTeach = teachA.filter((s) => learnB.includes(s));
  const mutualLearn = teachB.filter((s) => learnA.includes(s));

  if (mutualTeach.length > 0 && mutualLearn.length > 0) {
    score += 20; // Bonus for full bidirectional match
  }

  return score;
};

/**
 * Find and rank matches for a given user from a list of candidates.
 *
 * @param {Object} currentUser - The logged-in user
 * @param {Array} allUsers - All other users
 * @returns {Array} Sorted list of matches with scores
 */
const findMatches = (currentUser, allUsers) => {
  const matches = [];

  for (const candidate of allUsers) {
    // Skip self
    if (candidate._id.toString() === currentUser._id.toString()) continue;

    const score = calculateMatchScore(currentUser, candidate);

    // Only include users with at least some match
    if (score > 0) {
      matches.push({
        user: candidate,
        matchScore: score,
      });
    }
  }

  // Sort by highest match score first (LMS ranking)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
};

module.exports = { calculateMatchScore, findMatches };
