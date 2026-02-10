
import GeneticAlgorithm from '../../services/geneticAlgorithm.js';
import Chromosome from '../../services/chromosome.js';

const mockConfig = {
    courses: [
        { _id: 'c1', courseCode: 'CS101', credits: 3, faculty: [{ role: 'Incharge' }] },
        { _id: 'c2', courseCode: 'CS102', credits: 2, sessionType: 'Lab', faculty: [{ role: 'Incharge' }] }
    ],
    faculty: [{ _id: 'f1' }, { _id: 'f2' }],
    rooms: [{ roomId: 'R1' }, { roomId: 'LAB1' }],
    populationSize: 10,
    maxGenerations: 5
};

describe('Genetic Algorithm Service', () => {
    let ga;
    
    beforeEach(() => {
        ga = new GeneticAlgorithm(mockConfig);
    });

    test('initializes correctly', () => {
        expect(ga.courses).toHaveLength(2);
        expect(ga.populationSize).toBe(10);
    });

    test('calculates valid slots for standard duration', () => {
        const slot = ga.getRandomSlot(1);
        expect(slot.slotNumber).toBeGreaterThanOrEqual(1);
        expect(slot.slotNumber).toBeLessThanOrEqual(8);
    });

    // Lab sessions (3 hours) must start by slot 6 (to fit 6,7,8)
    test('calculates valid slots for lab duration', () => {
        // Run a few times to ensure randomness covers range
        for(let i=0; i<5; i++) {
            const slot = ga.getRandomSlot(3);
            expect(slot.slotNumber).toBeGreaterThanOrEqual(1);
            expect(slot.slotNumber).toBeLessThanOrEqual(6);
        }
    });

    test('generates valid chromosome structure', () => {
        const chromosome = ga.createRandomChromosome();
        expect(chromosome).toBeInstanceOf(Chromosome);
        
        // precise check for lab allocation
        const labSlot = chromosome.slots.find(s => s.courseCode === 'CS102');
        expect(labSlot).toBeDefined();
        expect(labSlot.spanSlots).toBe(3);
        expect(labSlot.slotNumber + labSlot.spanSlots - 1).toBeLessThanOrEqual(8);
    });
    
    test('execution returns valid timetable result', () => {
        const result = ga.run();
        expect(result.bestTimetable).toBeDefined();
        expect(typeof result.fitness).toBe('number');
    });
});
