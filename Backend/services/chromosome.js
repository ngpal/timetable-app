/**
 * Chromosome Class
 * Represents a single individual (timetable solution) in the genetic algorithm population.
 */
class Chromosome {
    constructor(slots = []) {
      this.slots = slots; 
      this.fitness = 0;
    }
  
    /**
     * Convert chromosome to standard timetable format for validation
     */
    toTimetable() {
      // Expand span slots into individual slot entries for validation
      const expandedSlots = [];

      this.slots.forEach(slot => {
        // Add the main slot
        expandedSlots.push(slot);

        // Add continuation slots if it's a multi-hour session
        if (slot.spanSlots > 1) {
            for (let i = 1; i < slot.spanSlots; i++) {
                // Create continuation slot
                const continuationSlot = {
                    ...slot, // Copy all properties (course, faculty, venue)
                    slotNumber: slot.slotNumber + i,
                    isSpanContinuation: true,
                    spanStartSlot: slot.slotNumber,
                    // Remove spanSlots from continuation or keep it? 
                    // Validator checks strict equality, let's keep it safe.
                };
                expandedSlots.push(continuationSlot);
            }
        }
      });

      return {
        timetableSlots: expandedSlots,
        courses: [] 
      };
    }

    /**
     * Create a deep copy of the chromosome
     */
    clone() {
        // Deep copy the slots array to avoid reference issues
        const newSlots = JSON.parse(JSON.stringify(this.slots));
        const newChromosome = new Chromosome(newSlots);
        newChromosome.fitness = this.fitness;
        return newChromosome;
    }
  }
  
  export default Chromosome;
