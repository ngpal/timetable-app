import Course from '../models/course.js';

// GET: Fetch all courses for the table
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses" });
    }
};

// POST: Add a new course
export const addCourse = async (req, res) => {
    const { courseCode, courseName, theoryHours, labHours, department } = req.body;
    try {
        const newCourse = await Course.create({
            courseCode,
            courseName,
            theoryHours: Number(theoryHours),
            labHours: Number(labHours),
            department
        });
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: "Course Code must be unique" });
    }
};

// PUT: Update course details
export const updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

// DELETE: Remove a course
export const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.status(200).json("Course deleted successfully");
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};