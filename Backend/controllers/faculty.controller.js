import User from '../models/user.js';
import Faculty from '../models/faculty.js';

// GET: Combine User and Faculty data for your table
export const getFaculty = async (req, res) => {
    try {
        const facultyMembers = await Faculty.find().populate('userId', 'name email');
        res.status(200).json(facultyMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST: Create User and Faculty profile
export const addFaculty = async (req, res) => {
    const { name, email, department, facultyType, designation } = req.body;
    try {
        // Create base user first
        const newUser = await User.create({ name, email, role: 'Faculty' });

        // Create faculty details linked to that user
        const newFaculty = await Faculty.create({
            userId: newUser._id,
            department,
            facultyType,
            designation
        });

        res.status(201).json({ user: newUser, faculty: newFaculty });
    } catch (error) {
        res.status(400).json({ message: "Error: Email exists or invalid data" });
    }
};

// DELETE: Remove both records
export const deleteFaculty = async (req, res) => {
    try {
        const facultyRecord = await Faculty.findById(req.params.id);
        if (facultyRecord) {
            await User.findByIdAndDelete(facultyRecord.userId);
            await Faculty.findByIdAndDelete(req.params.id);
        }
        res.status(200).json("Faculty and User record deleted");
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// PUT: Update Faculty and linked User data
export const updateFaculty = async (req, res) => {
    const { name, email, department, facultyType, designation } = req.body;
    try {
        // Find the Faculty record first
        const facultyRecord = await Faculty.findById(req.params.id);
        if (!facultyRecord) return res.status(404).json({ message: "Faculty not found" });

        // Update the linked User record (name and email)
        await User.findByIdAndUpdate(facultyRecord.userId, {
            name,
            email
        }, { new: true });

        // Update the Faculty specific details
        const updatedFaculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            {
                department,
                facultyType,
                designation
            },
            { new: true }
        ).populate('userId', 'name email');

        res.status(200).json(updatedFaculty);
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};