/*
 Constraint Definitions for Timetable Generation
  Hard Constraints: MUST be satisfied (violations = invalid timetable)
  Soft Constraints: Preferred but flexible (violations reduce quality score)
 */

// Hard Constraints - Must be satisfied
export const HARD_CONSTRAINTS = {
  NO_FACULTY_CONFLICT: {
    id: 'NO_FACULTY_CONFLICT',
    name: 'No Faculty Conflict',
    description: 'Faculty cannot be scheduled in two places at the same time',
    priority: 10
  },
  NO_ROOM_CONFLICT: {
    id: 'NO_ROOM_CONFLICT',
    name: 'No Room Conflict',
    description: 'Room cannot be double-booked at the same time',
    priority: 10
  },
  NO_SECTION_CONFLICT: {
    id: 'NO_SECTION_CONFLICT',
    name: 'No Section Conflict',
    description: 'Section cannot have overlapping classes',
    priority: 10
  },
  COURSE_HOURS_MET: {
    id: 'COURSE_HOURS_MET',
    name: 'Course Hours Requirement',
    description: 'All course session hours must be scheduled',
    priority: 9
  },
  LAB_NEEDS_LAB_ROOM: {
    id: 'LAB_NEEDS_LAB_ROOM',
    name: 'Lab Room Requirement',
    description: 'Lab sessions must be assigned to lab rooms',
    priority: 8
  },
  NO_SPAN_GAPS: {
    id: 'NO_SPAN_GAPS',
    name: 'No Gaps in Span Slots',
    description: 'Multi-slot sessions must be consecutive',
    priority: 8
  }
};

// Soft Constraints - Scored and weighted
export const SOFT_CONSTRAINTS = {
  WORKLOAD_BALANCE: {
    id: 'WORKLOAD_BALANCE',
    name: 'Faculty Workload Balance',
    description: 'Distribute teaching hours evenly across faculty',
    weight: 10,
    maxScore: 100
  },
  NO_BACK_TO_BACK_3HR: {
    id: 'NO_BACK_TO_BACK_3HR',
    name: 'Avoid Long Continuous Sessions',
    description: 'Avoid 3+ consecutive hours for same faculty/section',
    weight: 5,
    maxScore: 100
  },
  LUNCH_BREAK: {
    id: 'LUNCH_BREAK',
    name: 'Preserve Lunch Break',
    description: 'Keep slot 5 (12:00-1:00 PM) free when possible',
    weight: 8,
    maxScore: 100
  },
  MINIMIZE_ROOM_CHANGES: {
    id: 'MINIMIZE_ROOM_CHANGES',
    name: 'Minimize Room Changes',
    description: 'Same course should use same room across sessions',
    weight: 3,
    maxScore: 100
  },
  FACULTY_PREFERENCES: {
    id: 'FACULTY_PREFERENCES',
    name: 'Faculty Time Preferences',
    description: 'Respect faculty preferred time slots',
    weight: 7,
    maxScore: 100
  },
  DAILY_BALANCE: {
    id: 'DAILY_BALANCE',
    name: 'Daily Hour Balance',
    description: 'Balance teaching hours across days of the week',
    weight: 4,
    maxScore: 100
  },
  AVOID_SINGLE_HOUR_GAPS: {
    id: 'AVOID_SINGLE_HOUR_GAPS',
    name: 'Avoid Single Hour Gaps',
    description: 'Minimize single-hour gaps in faculty/section schedules',
    weight: 6,
    maxScore: 100
  }
};

// Time slot definitions
export const TIME_SLOTS = {
  1: { start: '08:00', end: '09:00', label: '8:00-9:00 AM' },
  2: { start: '09:00', end: '10:00', label: '9:00-10:00 AM' },
  3: { start: '10:00', end: '11:00', label: '10:00-11:00 AM' },
  4: { start: '11:00', end: '12:00', label: '11:00 AM-12:00 PM' },
  5: { start: '12:00', end: '13:00', label: '12:00-1:00 PM (Lunch)' },
  6: { start: '13:00', end: '14:00', label: '1:00-2:00 PM' },
  7: { start: '14:00', end: '15:00', label: '2:00-3:00 PM' },
  8: { start: '15:00', end: '16:00', label: '3:00-4:00 PM' },
  9: { start: '16:00', end: '17:00', label: '4:00-5:00 PM' }
};

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper function to get total soft constraint weight
export function getTotalSoftConstraintWeight() {
  return Object.values(SOFT_CONSTRAINTS).reduce((sum, constraint) => sum + constraint.weight, 0);
}

// Helper function to normalize soft constraint score (0-100)
export function normalizeSoftScore(weightedScore) {
  const totalWeight = getTotalSoftConstraintWeight();
  // Individual scores are already 0-100, so we just divide by total weight to average them
  return weightedScore / totalWeight;
}

export default {
  HARD_CONSTRAINTS,
  SOFT_CONSTRAINTS,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  getTotalSoftConstraintWeight,
  normalizeSoftScore
};
