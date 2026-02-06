import Faculty from '../models/faculty.js';
import Course from '../models/course.js';
import Classroom from '../models/classroom.js';

// GET: Dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const facultyCount = await Faculty.countDocuments();
        const courseCount = await Course.countDocuments();
        const roomCount = await Classroom.countDocuments();

        res.status(200).json({
            facultyCount,
            courseCount,
            roomCount
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
};
