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
    const { 
        courseCode, 
        courseName, 
        credits,
        semester,
        year,
        courseType,
        electiveCategory,
        theoryHours, 
        labHours,
        requiresLab,
        labComponent,
        department,
        description
    } = req.body;
    
    try {
        const newCourse = await Course.create({
            courseCode,
            courseName,
            credits: credits || 3,
            semester,
            year,
            courseType: courseType || 'Core',
            electiveCategory,
            theoryHours: theoryHours || 0,
            labHours: labHours || 0,
            requiresLab: requiresLab || false,
            labComponent: labComponent || {},
            department,
            description
        });
        
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Add course error:', error);
        res.status(400).json({ message: error.message || "Error creating course" });
    }
};

// PUT: Update course details
export const updateCourse = async (req, res) => {
    const { 
        courseCode, 
        courseName, 
        credits,
        semester,
        year,
        courseType,
        electiveCategory,
        theoryHours, 
        labHours,
        requiresLab,
        labComponent,
        department,
        description
    } = req.body;
    
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            {
                courseCode,
                courseName,
                credits,
                semester,
                year,
                courseType,
                electiveCategory,
                theoryHours,
                labHours,
                requiresLab,
                labComponent,
                department,
                description
            },
            { new: true }
        );
        
        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: "Update failed", error: error.message });
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