/**
 * Test Genetic Algorithm Script
 * 
 This script simulates the timetable generation process by:
 * 1. Connecting to MongoDB
 * 2. Fetching a CourseAssignment
 * 3. Running the Genetic Algorithm
 * 4. Displaying the results
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import CourseAssignment from '../models/courseAssignment.js';
import Faculty from '../models/faculty.js';
import Classroom from '../models/classroom.js';
import GeneticAlgorithm from '../services/geneticAlgorithm.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import fs from 'fs';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_log.txt', msg + '\n');
};

const runTest = async () => {
  try {
    fs.writeFileSync('debug_log.txt', 'Starting Test...\n');
    
    //  Connect to Database
    log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected!');

    // Fetch a CourseAssignment
    log('Fetching CourseAssignment...');
    const assignment = await CourseAssignment.findOne({
        department: 'CSE',
        section: 'A'
    }).populate('courses.faculty.facultyId');

    if (!assignment) {
      log('No CourseAssignment found for CSE Section A');
      process.exit(1);
    }
    log(`Found assignment: ${assignment.department} - ${assignment.section} (${assignment.courses.length} courses)`);
    
    if (assignment.courses.length > 0) {
        log('Sample course: ' + JSON.stringify(assignment.courses[0], null, 2));
    } else {
        log('WARNING: No courses found in assignment!');
    }

    //  Fetch Resources
    const allFaculty = await Faculty.find({});
    const rooms = await Classroom.find({});
    log(`Resources: ${allFaculty.length} faculty, ${rooms.length} rooms`);

    // 4. Configure GA
    const config = {
      courses: assignment.courses,
      faculty: allFaculty,
      rooms: rooms,
      populationSize: 50,
      maxGenerations: 50, // Short run for testing
      mutationRate: 0.1,
      eliteSize: 5
    };

    log('Initializing Genetic Algorithm...');
    const ga = new GeneticAlgorithm(config);

    //  Run GA
    log('Running GA...');
    const startTime = Date.now();
    const result = ga.run();
    const duration = (Date.now() - startTime) / 1000;

    //  Report Results
    log('\n=============================================');
    log(`GA Completed in ${duration.toFixed(2)}s`);
    log(`Generations: ${result.generations}`);
    log(`Final Fitness: ${result.fitness.toFixed(2)}`);
    
    // Analyze Result
    const timetable = result.bestTimetable;
    const slots = timetable.timetableSlots;
    log(`Total Slots Scheduled: ${slots ? slots.length : 'UNDEFINED'}`);
    
    if (result.fitness < 0) {
        log(`❌ Result has ${result.bestTimetable.hardViolations?.length || 'some'} hard constraint violations!`);
        // Log the violations if available
        if (result.bestTimetable.hardViolations) {
            result.bestTimetable.hardViolations.forEach((v, i) => {
                log(`   ${i+1}. [${v.constraintId}] ${v.description} (${JSON.stringify(v.details)})`);
            });
        }
    } else {
        log('✅ Result is valid!');
        // Print sample slots
        log('\nSample Schedule:');
        if (slots && slots.length > 0) {
            slots.slice(0, 5).forEach(slot => {
                log(`${slot.day} Slot ${slot.slotNumber}: ${slot.courseCode} (${slot.sessionType}) - ${slot.venue}`);
            });
        }
    }
    log('=============================================\n');

  } catch (error) {
    log('Test Failed: ' + error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTest();
