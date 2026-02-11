
import Classroom from '../../models/classroom.js';

describe('Classroom Model', () => {
    
    test('should validate a correct classroom', () => {
        const room = new Classroom({
            roomId: 'C201',
            building: 'ABIII',
            fullRoomId: 'ABIII-C201',
            capacity: 60,
            roomType: 'Classroom',
            floor: 'SF'
        });
        
        const error = room.validateSync();
        expect(error).toBeUndefined();
    });

    test('should requires building and fullRoomId', () => {
        const room = new Classroom({ roomId: 'C201' });
        
        const error = room.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['building']).toBeDefined();
        // fullRoomId is required in schema, though controller might gen it, model enforces it
        expect(error.errors['fullRoomId']).toBeDefined();
        expect(error.errors['capacity']).toBeDefined();
    });

    test('should enforce roomType enum', () => {
        const room = new Classroom({
            roomId: 'C201',
            building: 'ABIII',
            fullRoomId: 'ABIII-C201',
            capacity: 60,
            roomType: 'Gaming Room' // Invalid
        });
        
        const error = room.validateSync();
        expect(error).toBeDefined();
        expect(error.errors['roomType']).toBeDefined();
    });
});
