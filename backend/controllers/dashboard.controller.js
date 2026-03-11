import Faculty from '../models/faculty.js';
import Course from '../models/course.js';
import Classroom from '../models/classroom.js';
import CourseAssignment from '../models/courseAssignment.js';
import SlotChangeRequest from '../models/slotChangeRequest.js';

// GET: Comprehensive dashboard analytics
export const getDashboardStats = async (req, res) => {
    try {
        // --- 1. Summary Counts ---
        const [facultyCount, courseCount, roomCount, timetableCount, pendingRequests] = await Promise.all([
            Faculty.countDocuments(),
            Course.countDocuments(),
            Classroom.countDocuments(),
            CourseAssignment.countDocuments({ isActive: true }),
            SlotChangeRequest.countDocuments({ status: { $in: ['Pending_Faculty', 'Pending_Admin'] } })
        ]);

        // --- 2. Faculty Analytics ---
        const [facultyByDept, facultyByDesignation, facultyByType] = await Promise.all([
            Faculty.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Faculty.aggregate([
                { $group: { _id: '$designation', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Faculty.aggregate([
                { $group: { _id: '$facultyType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        // --- 3. Course Analytics ---
        const [coursesByDept, coursesByType, creditDistribution] = await Promise.all([
            Course.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Course.aggregate([
                { $group: { _id: '$courseType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Course.aggregate([
                { $group: { _id: '$credits', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        // --- 4. Room Analytics ---
        const [roomsByType, roomsByBuilding, capacityStats] = await Promise.all([
            Classroom.aggregate([
                { $group: { _id: '$roomType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Classroom.aggregate([
                { $group: { _id: '$building', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Classroom.aggregate([
                { $group: {
                    _id: null,
                    totalCapacity: { $sum: '$capacity' },
                    avgCapacity: { $avg: '$capacity' },
                    maxCapacity: { $max: '$capacity' },
                    minCapacity: { $min: '$capacity' }
                }}
            ])
        ]);

        // --- 5. Timetable Slot Heatmap ---
        const timetables = await CourseAssignment.find(
            { isActive: true },
            { timetableSlots: 1, department: 1, section: 1 }
        );

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slotHeatmap = {};
        let totalSlotsUsed = 0;

        days.forEach(day => {
            slotHeatmap[day] = {};
            for (let s = 1; s <= 9; s++) {
                slotHeatmap[day][s] = 0;
            }
        });

        timetables.forEach(tt => {
            (tt.timetableSlots || []).forEach(slot => {
                if (slot.day && slot.slotNumber && slot.slotNumber <= 9 && !slot.isSpanContinuation) {
                    if (slot.slotType !== 'Break') {
                        slotHeatmap[slot.day] = slotHeatmap[slot.day] || {};
                        slotHeatmap[slot.day][slot.slotNumber] = (slotHeatmap[slot.day][slot.slotNumber] || 0) + 1;
                        totalSlotsUsed++;
                    }
                }
            });
        });

        // Find busiest day and slot
        let busiestDay = '', busiestDayCount = 0;
        let busiestSlot = 0, busiestSlotCount = 0;

        days.forEach(day => {
            const dayTotal = Object.values(slotHeatmap[day] || {}).reduce((a, b) => a + b, 0);
            if (dayTotal > busiestDayCount) {
                busiestDay = day;
                busiestDayCount = dayTotal;
            }
            for (let s = 1; s <= 9; s++) {
                if ((slotHeatmap[day]?.[s] || 0) > busiestSlotCount) {
                    busiestSlot = s;
                    busiestSlotCount = slotHeatmap[day][s];
                }
            }
        });

        // --- 6. Slot Change Request Analytics ---
        const [requestsByStatus, recentRequests] = await Promise.all([
            SlotChangeRequest.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            SlotChangeRequest.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('courseCode courseName facultyName status currentDay currentSlotNumber requestedDay requestedSlotNumber createdAt reason')
                .lean()
        ]);

        // --- 7. Department Workload (from timetable data) ---
        const deptWorkload = {};
        timetables.forEach(tt => {
            const dept = tt.department || 'Unknown';
            if (!deptWorkload[dept]) {
                deptWorkload[dept] = { sections: new Set(), totalSlots: 0 };
            }
            deptWorkload[dept].sections.add(tt.section);
            deptWorkload[dept].totalSlots += (tt.timetableSlots || []).filter(
                s => s.slotType !== 'Break' && !s.isSpanContinuation
            ).length;
        });

        const departmentWorkload = Object.entries(deptWorkload).map(([dept, data]) => ({
            department: dept,
            sections: data.sections.size,
            totalSlots: data.totalSlots,
            avgSlotsPerSection: data.sections.size > 0 ? Math.round(data.totalSlots / data.sections.size) : 0
        })).sort((a, b) => b.totalSlots - a.totalSlots);

        res.status(200).json({
            // Summary
            facultyCount,
            courseCount,
            roomCount,
            timetableCount,
            pendingRequests,

            // Faculty
            facultyByDept: facultyByDept.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            facultyByDesignation: facultyByDesignation.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            facultyByType: facultyByType.map(d => ({ name: d._id || 'Unknown', value: d.count })),

            // Courses
            coursesByDept: coursesByDept.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            coursesByType: coursesByType.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            creditDistribution: creditDistribution.map(d => ({ credits: d._id, count: d.count })),

            // Rooms
            roomsByType: roomsByType.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            roomsByBuilding: roomsByBuilding.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            capacityStats: capacityStats[0] || { totalCapacity: 0, avgCapacity: 0, maxCapacity: 0, minCapacity: 0 },

            // Heatmap
            slotHeatmap,
            totalSlotsUsed,
            busiestDay,
            busiestSlot,

            // Requests
            requestsByStatus: requestsByStatus.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            recentRequests,

            // Department workload
            departmentWorkload
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
};
