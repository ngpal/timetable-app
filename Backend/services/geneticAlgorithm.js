import Chromosome from './chromosome.js';
import { validateHardConstraints, calculateSoftConstraintScore } from './constraintValidator.js';

/**
 * Genetic Algorithm Service for Timetable Generation
 */

export class GeneticAlgorithm {
  constructor(config) {
    this.courses = config.courses;
    this.faculty = config.faculty;
    this.rooms = config.rooms;
    this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    this.slots = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 slots per day
    
    // GA Parameters
    this.populationSize = config.populationSize || 50;
    this.mutationRate = config.mutationRate || 0.1;
    this.crossoverRate = config.crossoverRate || 0.8;
    this.eliteSize = config.eliteSize || 5;
    this.maxGenerations = config.maxGenerations || 100;
    
    // Constraint Configuration
    this.constraints = config.constraints || {}; 
  }

  /**
   * Main function to run the genetic algorithm
   */
  run() {
    let population = this.initializePopulation();
    let bestChromosome = null;
    let bestFitness = -Infinity;

    for (let generation = 0; generation < this.maxGenerations; generation++) {
      //  Evaluate fitness
      population.forEach(chromosome => this.evaluateFitness(chromosome));

      // Sort by fitness
      population.sort((a, b) => b.fitness - a.fitness);

      //  Track best solution
      if (population[0].fitness > bestFitness) {
        bestFitness = population[0].fitness;
        bestChromosome = population[0];
        console.log(`Generation ${generation}: New Best Fitness = ${bestFitness}`);
      }

      // Check termination condition (perfect hard constraints + high soft score)
      // If fitness is > 0 (meaning no hard violations) and sufficiently high
      if (bestFitness > 90) { 
        console.log(`Target fitness reached at generation ${generation}`);
        break;
      }

      // Create new population
      const newPopulation = [];

     
      newPopulation.push(...population.slice(0, this.eliteSize));

      // Fill rest with offspring
      while (newPopulation.length < this.populationSize) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);
        
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    // Return best solution
    const resultTimetable = bestChromosome.toTimetable();
    resultTimetable.hardViolations = bestChromosome.hardViolations;
    
    return {
      bestTimetable: resultTimetable,
      fitness: bestFitness,
      generations: this.maxGenerations
    };
  }

  /**
   * Initialize random population
   */
  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.createRandomChromosome());
    }
    return population;
  }

  /**
   * Create a single random chromosome
   */
  createRandomChromosome() {
    const assignments = [];

    // For each course, assign required sessions
    this.courses.forEach(course => {
      // Handle faculty extraction from CourseAssignment structure (array of objects)
      // We prioritize the 'Incharge' faculty, or take the first one available
      let primaryFaculty = null;
      if (Array.isArray(course.faculty) && course.faculty.length > 0) {
          primaryFaculty = course.faculty.find(f => f.role === 'Incharge') || course.faculty[0];
      }
      
      const facultyId = primaryFaculty?.facultyId?._id || primaryFaculty?.facultyId; // Handle if populated or ID
      const facultyName = primaryFaculty?.facultyId?.name || primaryFaculty?.name || 'Unknown';
      
      const sessions = this.getRequiredSessions(course);
      
      sessions.forEach(session => {
        // Find random slot
        let slot = this.getRandomSlot();
        
        assignments.push({
            courseId: course._id,
            courseCode: course.courseCode || course.code, 
            courseName: course.courseName || course.name,
            
            // Correctly mapped faculty data
            facultyId: facultyId, 
            facultyName: facultyName, 
            faculty: facultyId ? [facultyId] : [], 
            
            day: slot.day,
            slotNumber: slot.slotNumber,
            venue: this.getRandomRoom().fullRoomId || this.getRandomRoom().roomId,
            sessionType: session.type, // 'Theory' or 'Lab'
            spanSlots: session.duration || 1
        });
      });
    });

    return new Chromosome(assignments);
  }

  getRequiredSessions(course) {
    
    if (course.sessionType === 'Lab') {
      
        return [{ type: 'Lab', duration: 3 }];
    }
    
    
    const hours = course.credits || 3;
    const sessions = [];
    for(let i=0; i<hours; i++) {
        sessions.push({ type: 'Theory', duration: 1 });
    }
    return sessions;
  }

  getRandomSlot() {
    const day = this.days[Math.floor(Math.random() * this.days.length)];
    const slotNumber = this.slots[Math.floor(Math.random() * this.slots.length)];
    return { day, slotNumber };
  }
  
  getRandomRoom() {
      return this.rooms[Math.floor(Math.random() * this.rooms.length)];
  }

  /**
   * Evaluate fitness of a chromosome
   */
  evaluateFitness(chromosome) {
    const timetable = chromosome.toTimetable();
    

    const hardViolations = validateHardConstraints(timetable, [], this.constraints);
    
    // Store for debugging/reporting
    chromosome.hardViolations = hardViolations;
    
    if (hardViolations.length > 0) {
      // Penalty: -100 per violation
      chromosome.fitness = -100 * hardViolations.length;
      return;
    }

    //  Soft Constraints
    const softScore = calculateSoftConstraintScore(timetable, this.faculty);
    chromosome.fitness = softScore.totalScore;
  }

  /**
   * Select parent using Tournament Selection
   */
  tournamentSelection(population) {
    const tournamentSize = 5;
    let best = null;
    
    for (let i = 0; i < tournamentSize; i++) {
      const ind = population[Math.floor(Math.random() * population.length)];
      if (best === null || ind.fitness > best.fitness) {
        best = ind;
      }
    }
    return best;
  }

  /**
   * Crossover two parents
   */
  crossover(parent1, parent2) {
    // Single point crossover
    // This is naive and might separate multi-session courses or lose sessions.
    // A better approach for timetabling is often "Uniform Crossover" based on courses.
    
    if (Math.random() > this.crossoverRate) {
        return parent1.clone();
    }

    const childSlots = [];
    const split = Math.floor(Math.random() * parent1.slots.length);
    
    // Take first part from parent 1
    for (let i = 0; i < split; i++) {
        childSlots.push({...parent1.slots[i]});
    }
    // Take rest from parent 2
    for (let i = split; i < parent2.slots.length; i++) {
        childSlots.push({...parent2.slots[i]});
    }

    return new Chromosome(childSlots);
  }

  /**
   * Mutate a chromosome
   */
  mutate(chromosome) {
    if (Math.random() > this.mutationRate) return chromosome;

    // Mutate a random gene (assignment)
    const index = Math.floor(Math.random() * chromosome.slots.length);
    const gene = chromosome.slots[index];

    // Randomly change day/slot OR room
    if (Math.random() < 0.5) {
        const newSlot = this.getRandomSlot();
        gene.day = newSlot.day;
        gene.slotNumber = newSlot.slotNumber;
    } else {
        const room = this.getRandomRoom();
        gene.venue = room.fullRoomId || room.roomId;
    }

    return chromosome;
  }
}

export default GeneticAlgorithm;
