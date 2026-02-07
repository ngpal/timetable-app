import CourseAssignment from '../models/courseAssignment.js';

// Sample data generator for testing Amrita timetable
export const generateSampleTimetable = async (req, res) => {
    try {
        const sampleData = {
            academicYear: "2025-2026",
            semester: "Odd",
            department: "CSE",
            section: "D",
            program: "B.Tech",
            
            courses: [
                {
                    courseCode: "23CSE311",
                    courseName: "Software Engineering",
                    courseType: "Theory",
                    credits: 3,
                    faculty: [{ role: "Incharge" }],
                    venue: "ABIII - C204"
                },
                {
                    courseCode: "23CSE312",
                    courseName: "Distributed Systems",
                    courseType: "Theory",
                    credits: 3,
                    faculty: [{ role: "Incharge" }],
                    venue: "ABIII - C204"
                },
                {
                    courseCode: "23CSE313",
                    courseName: "Foundations of Cyber Security",
                    courseType: "Theory",
                    credits: 3,
                    faculty: [{ role: "Incharge" }],
                    venue: "ABIII - C204"
                },
                {
                    courseCode: "23CSE314",
                    courseName: "Compiler Design",
                    courseType: "Theory",
                    credits: 3,
                    faculty: [{ role: "Incharge" }],
                    venue: "ABIII - C204"
                },
                {
                    courseCode: "23CSE311",
                    courseName: "Software Engineering Lab",
                    courseType: "Lab",
                    credits: 2,
                    faculty: [
                        { role: "Incharge" },
                        { role: "Assisting" }
                    ],
                    venue: "ABIII - SF-HW LAB"
                },
                {
                    courseCode: "23CSE312",
                    courseName: "Distributed Systems Lab",
                    courseType: "Lab",
                    credits: 2,
                    faculty: [
                        { role: "Incharge" },
                        { role: "Assisting" }
                    ],
                    venue: "ABIII - TF-CP LAB 1"
                },
                {
                    courseCode: "23CSE314",
                    courseName: "Compiler Design Lab",
                    courseType: "Lab",
                    credits: 2,
                    faculty: [
                        { role: "Incharge" },
                        { role: "Assisting" }
                    ],
                    venue: "ABIII - TF-CP LAB 2"
                },
                {
                    courseCode: "PE-3",
                    courseName: "Professional Elective III",
                    courseType: "Elective",
                    credits: 3,
                    faculty: [{ role: "Incharge" }],
                    venue: "Various"
                }
            ],
            
            timetableSlots: [
                // Monday
                { day: "Monday", slotNumber: 3, slotType: "Project", courseCode: "Project Review", venue: "" },
                { day: "Monday", slotNumber: 4, slotType: "Theory", courseCode: "23CSE312", venue: "ABIII - C204" },
                { day: "Monday", slotNumber: 5, slotType: "Theory", courseCode: "23CSE314", venue: "ABIII - C204" },
                { day: "Monday", slotNumber: 6, slotType: "Theory", courseCode: "23CSE313", venue: "ABIII - C204" },
                { day: "Monday", slotNumber: 8, slotType: "Elective", courseCode: "PE-3", venue: "" },
                { day: "Monday", slotNumber: 9, slotType: "Lab", courseCode: "23CSE312 - LAB", venue: "ABIII - TF-CP LAB 1", spanSlots: 2 },
                
                // Tuesday
                { day: "Tuesday", slotNumber: 2, slotType: "Occupied", occupiedBy: "III B.Tech-F" },
                { day: "Tuesday", slotNumber: 3, slotType: "Elective", courseCode: "PE-3", venue: "" },
                { day: "Tuesday", slotNumber: 4, slotType: "Lab", courseCode: "23CSE314 - LAB", venue: "ABIII - TF-CP LAB 2", spanSlots: 2, notes: "(occupied by III B.Tech-F)" },
                { day: "Tuesday", slotNumber: 5, slotType: "Theory", courseCode: "23CSE314", venue: "ABIII - C204", notes: "Discussion/Evaluation Hour ABIII-TF-CP LAB-2 (A404)" },
                { day: "Tuesday", slotNumber: 8, slotType: "CIR", courseCode: "CIR", venue: "" },
                { day: "Tuesday", slotNumber: 9, slotType: "CIR", courseCode: "CIR", venue: "" },
                { day: "Tuesday", slotNumber: 10, slotType: "CIR", courseCode: "CIR", venue: "" },
                
                // Wednesday
                { day: "Wednesday", slotNumber: 1, slotType: "Theory", courseCode: "23CSE311", venue: "ABIII - C204" },
                { day: "Wednesday", slotNumber: 2, slotType: "Theory", courseCode: "23CSE314", venue: "ABIII - C204" },
                { day: "Wednesday", slotNumber: 5, slotType: "Occupied", occupiedBy: "I.M.Tech" },
                { day: "Wednesday", slotNumber: 6, slotType: "Occupied", occupiedBy: "I.M.Tech" },
                { day: "Wednesday", slotNumber: 8, slotType: "Lab", courseCode: "23CSE311 - LAB", venue: "ABIII - SF-HW LAB", spanSlots: 2 },
                { day: "Wednesday", slotNumber: 11, slotType: "Project", courseCode: "Project Review", venue: "" },
                
                // Thursday
                { day: "Thursday", slotNumber: 2, slotType: "Elective", courseCode: "PE-3", venue: "" },
                { day: "Thursday", slotNumber: 3, slotType: "Theory", courseCode: "23CSE313", venue: "ABIII - C204" },
                { day: "Thursday", slotNumber: 4, slotType: "Theory", courseCode: "23CSE311", venue: "ABIII - C204" },
                { day: "Thursday", slotNumber: 5, slotType: "Theory", courseCode: "23CSE312", venue: "ABIII - C204" },
                { day: "Thursday", slotNumber: 8, slotType: "Discussion", courseCode: "23CSE311", venue: "ABIII - C204", notes: "Discussion/Evaluation Hour AB3- C204" },
                { day: "Thursday", slotNumber: 11, slotType: "Project", courseCode: "Project Review", venue: "" },
                
                // Friday
                { day: "Friday", slotNumber: 3, slotType: "Theory", courseCode: "23CSE313", venue: "ABIII - C204" },
                { day: "Friday", slotNumber: 4, slotType: "Theory", courseCode: "23CSE312", venue: "ABIII - C204" },
                { day: "Friday", slotNumber: 5, slotType: "Theory", courseCode: "23CSE311", venue: "ABIII - C204" },
                { day: "Friday", slotNumber: 6, slotType: "Theory", courseCode: "23CSE314", venue: "ABIII - C204" },
                { day: "Friday", slotNumber: 8, slotType: "Project", courseCode: "Project Review", venue: "" }
            ],
            
            classAdvisors: [
                { name: "Dr. D. Venkataraman" },
                { name: "Dr. T. R. Swapna" }
            ],
            
            mailId: "d_cse6d@cb.amrita.edu, p_swapna@cb.amrita.edu",
            isActive: true
        };
        
        const newTimetable = new CourseAssignment(sampleData);
        const saved = await newTimetable.save();
        
        res.status(201).json({
            message: 'Sample timetable created successfully',
            timetable: saved
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating sample timetable', error: error.message });
    }
};
