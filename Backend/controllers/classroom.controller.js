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

// POST add new room
export const addClassroom = async (req, res) => {
    const { roomId, roomName, roomType, capacity } = req.body;
    try {
        const newRoom = await Classroom.create({
            roomId,
            roomName,
            roomType,
            capacity: Number(capacity)
        });
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(400).json({ message: "Room ID must be unique" });
    }
};

// PUT update room
export const updateClassroom = async (req, res) => {
    try {
        const updatedRoom = await Classroom.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
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