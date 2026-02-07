import Classroom from '../models/classroom.js';

// GET all rooms
export const getClassrooms = async (req, res) => {
    try {
        const rooms = await Classroom.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching classrooms" });
    }
};

// POST: Add a new classroom
export const addClassroom = async (req, res) => {
    const { 
        roomId, 
        building,
        floor,
        block,
        roomType, 
        capacity,
        labType,
        facilities,
        isAvailable
    } = req.body;
    
    try {
        // Auto-generate fullRoomId
        let fullRoomId = building;
        if (floor) fullRoomId += ` - ${floor}`;
        if (block) fullRoomId += `-${block}`;
        if (roomType === 'Lab' || roomType === 'Computer Lab') {
            fullRoomId += ` ${labType || 'LAB'}`;
        }
        fullRoomId += ` ${roomId}`;
        
        const newClassroom = await Classroom.create({
            roomId,
            roomName: fullRoomId, // Auto-generate from fullRoomId
            building,
            floor,
            block,
            fullRoomId,
            roomType,
            capacity: capacity || 60,
            labType,
            facilities: facilities || [],
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });
        
        res.status(201).json(newClassroom);
    } catch (error) {
        console.error('Add classroom error:', error);
        res.status(400).json({ message: error.message || "Error creating classroom" });
    }
};

// PUT: Update classroom details
export const updateClassroom = async (req, res) => {
    const { 
        roomId, 
        building,
        floor,
        block,
        roomType, 
        capacity,
        labType,
        facilities,
        isAvailable
    } = req.body;
    
    try {
        // Auto-generate fullRoomId
        let fullRoomId = building;
        if (floor) fullRoomId += ` - ${floor}`;
        if (block) fullRoomId += `-${block}`;
        if (roomType === 'Lab' || roomType === 'Computer Lab') {
            fullRoomId += ` ${labType || 'LAB'}`;
        }
        fullRoomId += ` ${roomId}`;
        
        const updatedClassroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            {
                roomId,
                roomName: fullRoomId, // Auto-generate from fullRoomId
                building,
                floor,
                block,
                fullRoomId,
                roomType,
                capacity,
                labType,
                facilities,
                isAvailable
            },
            { new: true }
        );
        
        if (!updatedClassroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }
        
        res.status(200).json(updatedClassroom);
    } catch (error) {
        console.error('Update classroom error:', error);
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// DELETE room
export const deleteClassroom = async (req, res) => {
    try {
        await Classroom.findByIdAndDelete(req.params.id);
        res.status(200).json("Room deleted successfully");
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};