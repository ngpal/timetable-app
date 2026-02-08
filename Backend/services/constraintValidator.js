/**
 * Constraint Validator Service
 * 
 * Validates timetables against hard and soft constraints
 * Used by genetic algorithm fitness function and manual validation
 */

import { HARD_CONSTRAINTS, SOFT_CONSTRAINTS, DAYS_OF_WEEK, normalizeSoftScore } from '../models/constraint.js';

/**
 * Validate all hard constraints
 * @param {Object} courseAssignment - Course assignment with timetableSlots
 * @param {Array} allAssignments - All course assignments (for cross-section conflicts)
 * @returns {Array} - Array of violations { constraintId, description, details }
 */
export function validateHardConstraints(courseAssignment, allAssignments = []) {
  const violations = [];
  const slots = courseAssignment.timetableSlots || [];

  // Check faculty conflicts
  const facultyConflicts = checkFacultyConflicts(slots, allAssignments);
  violations.push(...facultyConflicts);

  // Check room conflicts
  const roomConflicts = checkRoomConflicts(slots, allAssignments);
  violations.push(...roomConflicts);

  // Check section conflicts (overlapping slots)
  const sectionConflicts = checkSectionConflicts(slots);
  violations.push(...sectionConflicts);

  // Check course hours requirements
  const hoursViolations = checkCourseHoursRequirement(courseAssignment);
  violations.push(...hoursViolations);

  // Check lab room requirements
  const labRoomViolations = checkLabRoomRequirement(slots);
  violations.push(...labRoomViolations);

  // Check span slot continuity
  const spanViolations = checkSpanSlotContinuity(slots);
  violations.push(...spanViolations);

  return violations;
}

/**
 * Calculate soft constraint score (0-100, higher is better)
 * @param {Object} courseAssignment - Course assignment with timetableSlots
 * @param {Array} allFaculty - All faculty members
 * @returns {Object} - { totalScore, breakdown: {...} }
 */
export function calculateSoftConstraintScore(courseAssignment, allFaculty = []) {
  const scores = {};
  let weightedSum = 0;

  // Workload balance
  const workloadScore = scoreWorkloadBalance(courseAssignment, allFaculty);
  scores[SOFT_CONSTRAINTS.WORKLOAD_BALANCE.id] = workloadScore;
  weightedSum += workloadScore * SOFT_CONSTRAINTS.WORKLOAD_BALANCE.weight;

  // No back-to-back 3+ hours
  const backToBackScore = scoreBackToBackHours(courseAssignment.timetableSlots);
  scores[SOFT_CONSTRAINTS.NO_BACK_TO_BACK_3HR.id] = backToBackScore;
  weightedSum += backToBackScore * SOFT_CONSTRAINTS.NO_BACK_TO_BACK_3HR.weight;

  // Lunch break preservation
  const lunchScore = scoreLunchBreak(courseAssignment.timetableSlots);
  scores[SOFT_CONSTRAINTS.LUNCH_BREAK.id] = lunchScore;
  weightedSum += lunchScore * SOFT_CONSTRAINTS.LUNCH_BREAK.weight;

  // Minimize room changes
  const roomChangeScore = scoreRoomChanges(courseAssignment.timetableSlots);
  scores[SOFT_CONSTRAINTS.MINIMIZE_ROOM_CHANGES.id] = roomChangeScore;
  weightedSum += roomChangeScore * SOFT_CONSTRAINTS.MINIMIZE_ROOM_CHANGES.weight;

  // Daily balance
  const dailyBalanceScore = scoreDailyBalance(courseAssignment.timetableSlots);
  scores[SOFT_CONSTRAINTS.DAILY_BALANCE.id] = dailyBalanceScore;
  weightedSum += dailyBalanceScore * SOFT_CONSTRAINTS.DAILY_BALANCE.weight;

  // Avoid single hour gaps
  const gapScore = scoreSingleHourGaps(courseAssignment.timetableSlots);
  scores[SOFT_CONSTRAINTS.AVOID_SINGLE_HOUR_GAPS.id] = gapScore;
  weightedSum += gapScore * SOFT_CONSTRAINTS.AVOID_SINGLE_HOUR_GAPS.weight;

  const totalScore = normalizeSoftScore(weightedSum);

  return {
    totalScore: Math.round(totalScore),
    breakdown: scores
  };
}



function checkFacultyConflicts(slots, allAssignments) {
  const violations = [];
  const facultySchedule = {};

  // Build faculty schedule map
  slots.forEach(slot => {
    if (slot.isSpanContinuation) return; // Skip continuation slots

    const key = `${slot.day}-${slot.slotNumber}`;
    if (!facultySchedule[slot.facultyName]) {
      facultySchedule[slot.facultyName] = [];
    }
    facultySchedule[slot.facultyName].push({ ...slot, key });
  });

  // Check for conflicts
  Object.entries(facultySchedule).forEach(([faculty, schedule]) => {
    const timeSlots = {};
    schedule.forEach(slot => {
      if (timeSlots[slot.key]) {
        violations.push({
          constraintId: HARD_CONSTRAINTS.NO_FACULTY_CONFLICT.id,
          description: `Faculty ${faculty} is scheduled in multiple places`,
          details: {
            faculty,
            day: slot.day,
            slotNumber: slot.slotNumber,
            courses: [timeSlots[slot.key].courseName, slot.courseName]
          }
        });
      }
      timeSlots[slot.key] = slot;
    });
  });

  return violations;
}

function checkRoomConflicts(slots, allAssignments) {
  const violations = [];
  const roomSchedule = {};

  slots.forEach(slot => {
    if (slot.isSpanContinuation) return;

    const key = `${slot.day}-${slot.slotNumber}`;
    if (!roomSchedule[slot.venue]) {
      roomSchedule[slot.venue] = [];
    }
    roomSchedule[slot.venue].push({ ...slot, key });
  });

  Object.entries(roomSchedule).forEach(([room, schedule]) => {
    const timeSlots = {};
    schedule.forEach(slot => {
      if (timeSlots[slot.key]) {
        violations.push({
          constraintId: HARD_CONSTRAINTS.NO_ROOM_CONFLICT.id,
          description: `Room ${room} is double-booked`,
          details: {
            room,
            day: slot.day,
            slotNumber: slot.slotNumber,
            courses: [timeSlots[slot.key].courseName, slot.courseName]
          }
        });
      }
      timeSlots[slot.key] = slot;
    });
  });

  return violations;
}

function checkSectionConflicts(slots) {
  const violations = [];
  const schedule = {};

  slots.forEach(slot => {
    if (slot.isSpanContinuation) return;

    const key = `${slot.day}-${slot.slotNumber}`;
    if (schedule[key]) {
      violations.push({
        constraintId: HARD_CONSTRAINTS.NO_SECTION_CONFLICT.id,
        description: 'Section has overlapping classes',
        details: {
          day: slot.day,
          slotNumber: slot.slotNumber,
          courses: [schedule[key].courseName, slot.courseName]
        }
      });
    }
    schedule[key] = slot;
  });

  return violations;
}

function checkCourseHoursRequirement(courseAssignment) {
  const violations = [];
  const courseHours = {};

  // Count scheduled hours per course-session type
  courseAssignment.timetableSlots?.forEach(slot => {
    if (slot.isSpanContinuation) return;

    const key = `${slot.courseCode}-${slot.sessionType}`;
    courseHours[key] = (courseHours[key] || 0) + (slot.spanSlots || 1);
  });

  // Compare with required hours (from courses array)
  courseAssignment.courses?.forEach(course => {
    const key = `${course.courseCode}-${course.sessionType || 'Theory'}`;
    const scheduled = courseHours[key] || 0;
 
  });

  return violations;
}

function checkLabRoomRequirement(slots) {
  const violations = [];

  slots.forEach(slot => {
    if (slot.sessionType === 'Lab' && slot.venue) {
      // Check if venue contains 'LAB' or 'Lab' in name
      if (!slot.venue.toUpperCase().includes('LAB')) {
        violations.push({
          constraintId: HARD_CONSTRAINTS.LAB_NEEDS_LAB_ROOM.id,
          description: 'Lab session not assigned to lab room',
          details: {
            course: slot.courseName,
            sessionType: slot.sessionType,
            venue: slot.venue,
            day: slot.day,
            slotNumber: slot.slotNumber
          }
        });
      }
    }
  });

  return violations;
}

function checkSpanSlotContinuity(slots) {
  const violations = [];

  slots.forEach(slot => {
    if (slot.spanSlots > 1 && !slot.isSpanContinuation) {
      // Check if continuation slots exist
      for (let i = 1; i < slot.spanSlots; i++) {
        const nextSlot = slots.find(s => 
          s.day === slot.day && 
          s.slotNumber === slot.slotNumber + i &&
          s.isSpanContinuation &&
          s.spanStartSlot === slot.slotNumber
        );

        if (!nextSlot) {
          violations.push({
            constraintId: HARD_CONSTRAINTS.NO_SPAN_GAPS.id,
            description: 'Span slot has gaps',
            details: {
              course: slot.courseName,
              day: slot.day,
              startSlot: slot.slotNumber,
              spanSlots: slot.spanSlots,
              missingSlot: slot.slotNumber + i
            }
          });
        }
      }
    }
  });

  return violations;
}



function scoreWorkloadBalance(courseAssignment, allFaculty) {
  // Calculate variance in faculty workload
  const facultyHours = {};
  
  courseAssignment.timetableSlots?.forEach(slot => {
    if (slot.isSpanContinuation) return;
    const hours = slot.spanSlots || 1;
    facultyHours[slot.facultyName] = (facultyHours[slot.facultyName] || 0) + hours;
  });

  const hours = Object.values(facultyHours);
  if (hours.length === 0) return 100;

  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
  
  // Lower variance = better score (max variance assumed to be 25)
  const score = Math.max(0, 100 - (variance / 25) * 100);
  return Math.round(score);
}

function scoreBackToBackHours(slots) {
  let violations = 0;
  const schedule = {};

  // Group by day and faculty
  slots.forEach(slot => {
    if (slot.isSpanContinuation) return;
    const key = `${slot.day}-${slot.facultyName}`;
    if (!schedule[key]) schedule[key] = [];
    schedule[key].push(slot.slotNumber);
  });

  // Check for 3+ consecutive hours
  Object.values(schedule).forEach(slotNumbers => {
    slotNumbers.sort((a, b) => a - b);
    let consecutive = 1;
    for (let i = 1; i < slotNumbers.length; i++) {
      if (slotNumbers[i] === slotNumbers[i-1] + 1) {
        consecutive++;
        if (consecutive >= 3) violations++;
      } else {
        consecutive = 1;
      }
    }
  });

  // Fewer violations = better score
  const score = Math.max(0, 100 - violations * 20);
  return Math.round(score);
}

function scoreLunchBreak(slots) {
  const lunchSlots = slots.filter(s => s.slotNumber === 5 && !s.isSpanContinuation);
  const violations = lunchSlots.length;
  
  // Fewer lunch slot violations = better score
  const score = Math.max(0, 100 - violations * 10);
  return Math.round(score);
}

function scoreRoomChanges(slots) {
  const courseRooms = {};
  
  slots.forEach(slot => {
    if (slot.isSpanContinuation) return;
    const key = `${slot.courseCode}-${slot.sessionType}`;
    if (!courseRooms[key]) courseRooms[key] = new Set();
    courseRooms[key].add(slot.venue);
  });

  let changes = 0;
  Object.values(courseRooms).forEach(rooms => {
    changes += rooms.size - 1; // Number of different rooms - 1
  });

  const score = Math.max(0, 100 - changes * 15);
  return Math.round(score);
}

function scoreDailyBalance(slots) {
  const dailyHours = {};
  
  DAYS_OF_WEEK.forEach(day => dailyHours[day] = 0);
  
  slots.forEach(slot => {
    if (slot.isSpanContinuation) return;
    const hours = slot.spanSlots || 1;
    dailyHours[slot.day] = (dailyHours[slot.day] || 0) + hours;
  });

  const hours = Object.values(dailyHours);
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
  
  const score = Math.max(0, 100 - (variance / 10) * 100);
  return Math.round(score);
}

function scoreSingleHourGaps(slots) {
  let gaps = 0;
  const schedule = {};

  // Group by day
  DAYS_OF_WEEK.forEach(day => {
    const daySlots = slots
      .filter(s => s.day === day && !s.isSpanContinuation)
      .map(s => s.slotNumber)
      .sort((a, b) => a - b);

    for (let i = 1; i < daySlots.length; i++) {
      const gap = daySlots[i] - daySlots[i-1];
      if (gap === 2) gaps++; // Single hour gap
    }
  });

  const score = Math.max(0, 100 - gaps * 10);
  return Math.round(score);
}


/**
 * Check if a specific faculty has conflict at given time
 */
export function hasFacultyConflict(slots, facultyName, day, slotNumber) {
  return slots.some(slot => 
    slot.facultyName === facultyName &&
    slot.day === day &&
    slot.slotNumber === slotNumber &&
    !slot.isSpanContinuation
  );
}

/**
 * Check if a specific room has conflict at given time
 */
export function hasRoomConflict(slots, venue, day, slotNumber) {
  return slots.some(slot =>
    slot.venue === venue &&
    slot.day === day &&
    slot.slotNumber === slotNumber &&
    !slot.isSpanContinuation
  );
}

/**
 * Calculate total teaching hours for a faculty
 */
export function calculateFacultyWorkload(slots, facultyName) {
  return slots
    .filter(slot => slot.facultyName === facultyName && !slot.isSpanContinuation)
    .reduce((total, slot) => total + (slot.spanSlots || 1), 0);
}

export default {
  validateHardConstraints,
  calculateSoftConstraintScore,
  hasFacultyConflict,
  hasRoomConflict,
  calculateFacultyWorkload
};
