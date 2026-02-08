import CourseAssignment from '../models/courseAssignment.js';

// Get all course assignments
export const getAllCourseAssignments = async (req, res) => {
    try {
        const assignments = await CourseAssignment.find()
            .populate('courses.faculty.facultyId', 'name department designation')
            .populate('classAdvisors.facultyId', 'name department')
            .sort({ createdAt: -1 });
        res.status(200).json(assignments);
    } catch (error) {
        console.error('Get all assignments error:', error);
        res.status(500).json({ message: 'Error fetching course assignments', error: error.message });
    }
};

// Get course assignment by parameters
export const getCourseAssignment = async (req, res) => {
    try {
        const { academicYear, semester, department, section } = req.query;
        
        const assignment = await CourseAssignment.findOne({
            academicYear,
            semester,
            department,
            section,
            isActive: true
        })
        .populate('courses.faculty.facultyId', 'name department designation')
        .populate('classAdvisors.facultyId', 'name department');
        
        if (!assignment) {
            return res.status(404).json({ 
                message: 'No course assignment found for the specified parameters' 
            });
        }
        
        res.status(200).json(assignment);
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({ message: 'Error fetching course assignment', error: error.message });
    }
};

// Create new course assignment
export const createCourseAssignment = async (req, res) => {
    try {
        console.log('Creating course assignment with data:', JSON.stringify(req.body, null, 2));
        
        const assignmentData = {
            ...req.body,
            createdBy: req.user?.id || null
        };
        
        const newAssignment = new CourseAssignment(assignmentData);
        const savedAssignment = await newAssignment.save();
        
        console.log('Course assignment created successfully:', savedAssignment._id);
        
        res.status(201).json({
            message: 'Course assignment created successfully',
            assignment: savedAssignment
        });
    } catch (error) {
        console.error('Error creating course assignment:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        res.status(500).json({ message: 'Error creating course assignment', error: error.message });
    }
};

// Update course assignment
export const updateCourseAssignment = async (req, res) => {
    try {
        console.log('Updating course assignment:', req.params.id);
        console.log('Update data:', JSON.stringify(req.body, null, 2));
        
        const updatedAssignment = await CourseAssignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Course assignment not found' });
        }
        
        console.log('Course assignment updated successfully');
        
        res.status(200).json({
            message: 'Course assignment updated successfully',
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error('Error updating course assignment:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        res.status(500).json({ message: 'Error updating course assignment', error: error.message });
    }
};

// Update a specific timetable slot
export const updateTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, slotNumber, slotData } = req.body;
        
        console.log('Updating slot:', { id, day, slotNumber, slotData });
        
        const assignment = await CourseAssignment.findById(id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Course assignment not found' });
        }
        
        // Find existing slot
        const existingSlotIndex = assignment.timetableSlots.findIndex(
            slot => slot.day === day && slot.slotNumber === slotNumber
        );
        
        if (slotData === null || slotData === undefined) {
            // Clear the slot
            if (existingSlotIndex !== -1) {
                assignment.timetableSlots.splice(existingSlotIndex, 1);
            }
        } else {
            // Update or add slot
            const newSlot = {
                day,
                slotNumber,
                ...slotData
            };
            
            if (existingSlotIndex !== -1) {
                assignment.timetableSlots[existingSlotIndex] = newSlot;
            } else {
                assignment.timetableSlots.push(newSlot);
            }
        }
        
        await assignment.save();
        
        res.status(200).json({
            message: 'Slot updated successfully',
            assignment
        });
    } catch (error) {
        console.error('Error updating slot:', error);
        res.status(500).json({ message: 'Error updating slot', error: error.message });
    }
};

// Update specific slot in timetable
export const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, slotNumber, slotData } = req.body;
        
        const assignment = await CourseAssignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Course assignment not found' });
        }
        
        // Find and update the specific slot
        const slotIndex = assignment.timetableSlots.findIndex(
            slot => slot.day === day && slot.slotNumber === slotNumber
        );
        
        if (slotIndex !== -1) {
            assignment.timetableSlots[slotIndex] = {
                ...assignment.timetableSlots[slotIndex].toObject(),
                ...slotData
            };
        } else {
            assignment.timetableSlots.push({
                day,
                slotNumber,
                ...slotData
            });
        }
        
        await assignment.save();
        
        res.status(200).json({
            message: 'Slot updated successfully',
            assignment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating slot', error: error.message });
    }
};

// Delete course assignment
export const deleteCourseAssignment = async (req, res) => {
    try {
        const deletedAssignment = await CourseAssignment.findByIdAndDelete(req.params.id);
        
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Course assignment not found' });
        }
        
        res.status(200).json({ message: 'Course assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course assignment', error: error.message });
    }
};
