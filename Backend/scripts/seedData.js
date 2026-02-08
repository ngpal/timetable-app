import mongoose from 'mongoose';
import User from '../models/user.js';
import Faculty from '../models/faculty.js';
import Course from '../models/course.js';
import Classroom from '../models/classroom.js';
import CourseAssignment from '../models/courseAssignment.js';

// Sample Amrita Coimbatore Data
const seedData = {
  faculty: [
    {
      name: 'Dr. Rajesh Kumar',
      email: 'p_rajesh@cb.amrita.edu',
      phoneNumber: '+91 9876543210',
      department: 'CSE',
      designation: 'Professor',
      facultyType: 'Full-time',
      isClassAdvisor: true,
      specialization: ['Machine Learning', 'Data Science'],
      qualifications: 'Ph.D. in Computer Science',
      workConstraints: {
        maxHoursPerWeek: 40,
        maxHoursPerDay: 6,
        maxConsecutiveHours: 3
      }
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'p_priya@cb.amrita.edu',
      phoneNumber: '+91 9876543211',
      department: 'CSE',
      designation: 'Associate Professor',
      facultyType: 'Full-time',
      isClassAdvisor: true,
      specialization: ['Software Engineering', 'Cloud Computing'],
      qualifications: 'Ph.D. in Software Engineering'
    },
    {
      name: 'Dr. Arun Menon',
      email: 'p_arun@cb.amrita.edu',
      phoneNumber: '+91 9876543212',
      department: 'CSE',
      designation: 'Assistant Professor',
      facultyType: 'Full-time',
      isClassAdvisor: false,
      specialization: ['Database Systems', 'Big Data'],
      qualifications: 'Ph.D. in Computer Science'
    },
    {
      name: 'Dr. Lakshmi Nair',
      email: 'p_lakshmi@cb.amrita.edu',
      phoneNumber: '+91 9876543213',
      department: 'ECE',
      designation: 'Professor',
      facultyType: 'Full-time',
      isClassAdvisor: true,
      specialization: ['VLSI Design', 'Embedded Systems'],
      qualifications: 'Ph.D. in Electronics'
    },
    {
      name: 'Dr. Suresh Babu',
      email: 'p_suresh@cb.amrita.edu',
      phoneNumber: '+91 9876543214',
      department: 'ECE',
      designation: 'Associate Professor',
      facultyType: 'Full-time',
      isClassAdvisor: false,
      specialization: ['Signal Processing', 'Communication Systems'],
      qualifications: 'Ph.D. in Electronics and Communication'
    }
  ],

  courses: [
    {
      courseCode: '23CSE311',
      courseName: 'Data Structures',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'CSE',
      theoryHours: 3,
      labHours: 0,
      description: 'Introduction to fundamental data structures and algorithms'
    },
    {
      courseCode: '23CSE312',
      courseName: 'Database Management Systems',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'CSE',
      theoryHours: 3,
      labHours: 0,
      description: 'Fundamentals of database design and SQL'
    },
    {
      courseCode: '23CSE313',
      courseName: 'Operating Systems',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'CSE',
      theoryHours: 3,
      labHours: 0,
      description: 'Concepts of operating systems and process management'
    },
    {
      courseCode: '23CSE314',
      courseName: 'Computer Networks',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'CSE',
      theoryHours: 3,
      labHours: 0,
      description: 'Fundamentals of computer networking and protocols'
    },
    {
      courseCode: '23CSE315L',
      courseName: 'Data Structures Lab',
      credits: 2,
      semester: 3,
      year: 2,
      courseType: 'Lab',
      department: 'CSE',
      theoryHours: 0,
      labHours: 3,
      requiresLab: true,
      labComponent: {
        hasLab: true,
        labHours: 3,
        requiresAssistingFaculty: true,
        labType: 'Computer Lab'
      },
      description: 'Practical implementation of data structures'
    },
    {
      courseCode: '23ECE201',
      courseName: 'Electronics',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'ECE',
      theoryHours: 3,
      labHours: 0,
      description: 'Fundamentals of electronic circuits and devices'
    },
    {
      courseCode: '23ECE202',
      courseName: 'Digital Signal Processing',
      credits: 3,
      semester: 3,
      year: 2,
      courseType: 'Core',
      department: 'ECE',
      theoryHours: 3,
      labHours: 0,
      description: 'Digital signal processing techniques and applications'
    }
  ],

  classrooms: [
    {
      roomId: 'C204',
      building: 'ABIII',
      floor: 'SF',
      block: 'C',
      fullRoomId: 'ABIII - C204',
      roomType: 'Classroom',
      capacity: 60,
      facilities: ['Projector', 'Whiteboard', 'AC'],
      isAvailable: true
    },
    {
      roomId: 'C205',
      building: 'ABIII',
      floor: 'SF',
      block: 'C',
      fullRoomId: 'ABIII - C205',
      roomType: 'Classroom',
      capacity: 60,
      facilities: ['Projector', 'Whiteboard', 'AC'],
      isAvailable: true
    },
    {
      roomId: 'C301',
      building: 'ABIII',
      floor: 'TF',
      block: 'C',
      fullRoomId: 'ABIII - C301',
      roomType: 'Classroom',
      capacity: 70,
      facilities: ['Projector', 'Smart Board', 'AC'],
      isAvailable: true
    },
    {
      roomId: 'TF-CP LAB 1',
      building: 'ABIII',
      floor: 'TF',
      block: 'C',
      fullRoomId: 'ABIII - TF-CP LAB 1',
      roomType: 'Computer Lab',
      labType: 'CP LAB',
      capacity: 40,
      facilities: ['Projector', 'AC', 'Computers'],
      isAvailable: true
    },
    {
      roomId: 'TF-CP LAB 2',
      building: 'ABIII',
      floor: 'TF',
      block: 'C',
      fullRoomId: 'ABIII - TF-CP LAB 2',
      roomType: 'Computer Lab',
      labType: 'CP LAB',
      capacity: 40,
      facilities: ['Projector', 'AC', 'Computers'],
      isAvailable: true
    },
    {
      roomId: 'D101',
      building: 'ABIII',
      floor: 'GF',
      block: 'D',
      fullRoomId: 'ABIII - D101',
      roomType: 'Classroom',
      capacity: 50,
      facilities: ['Projector', 'Whiteboard'],
      isAvailable: true
    }
  ]
};

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  // Get admin user before clearing
  const adminUser = await User.findOne({ role: 'Admin' });
  
  // Clear all collections except User with Admin role
  await Faculty.deleteMany({});
  await Course.deleteMany({});
  await Classroom.deleteMany({});
  await CourseAssignment.deleteMany({});
  
  // Delete non-admin users
  await User.deleteMany({ role: { $ne: 'Admin' } });
  
  console.log('✅ Database cleared (admin preserved)');
  return adminUser;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Clear existing data
    const adminUser = await clearDatabase();
    
    if (adminUser) {
      console.log(`✅ Admin user preserved: ${adminUser.email}`);
    }
    
    // Create Users and Faculty
    console.log('👥 Creating faculty...');
    const createdFaculty = [];
    
    for (const facultyData of seedData.faculty) {
      // Create user
      const user = await User.create({
        name: facultyData.name,
        email: facultyData.email,
        role: 'Faculty'
      });
      
      // Create faculty profile
      const faculty = await Faculty.create({
        userId: user._id,
        ...facultyData
      });
      
      createdFaculty.push(faculty);
      console.log(`  ✓ ${faculty.name} (${faculty.department})`);
    }
    
    // Create Courses
    console.log('\n📚 Creating courses...');
    const createdCourses = [];
    
    for (const courseData of seedData.courses) {
      const course = await Course.create(courseData);
      createdCourses.push(course);
      console.log(`  ✓ ${course.courseCode} - ${course.courseName}`);
    }
    
    // Create Classrooms
    console.log('\n🏫 Creating classrooms...');
    const createdClassrooms = [];
    
    for (const classroomData of seedData.classrooms) {
      const classroom = await Classroom.create(classroomData);
      createdClassrooms.push(classroom);
      console.log(`  ✓ ${classroom.fullRoomId} (${classroom.roomType})`);
    }
    
    // Create Sample Course Assignment for CSE S3-A
    console.log('\n📋 Creating sample course assignment...');
    
    const cseFaculty = createdFaculty.filter(f => f.department === 'CSE');
    const cseCourses = createdCourses.filter(c => c.department === 'CSE');
    
    const courseAssignment = await CourseAssignment.create({
      academicYear: '2025-2026',
      semester: 'Odd',
      department: 'CSE',
      section: 'A',
      program: 'B.Tech',
      courses: [
        {
          courseCode: cseCourses[0].courseCode,
          courseName: cseCourses[0].courseName,
          courseType: cseCourses[0].courseType,
          credits: cseCourses[0].credits,
          faculty: [
            { facultyId: cseFaculty[0]._id, role: 'Incharge' }
          ],
          venue: 'ABIII - C204'
        },
        {
          courseCode: cseCourses[1].courseCode,
          courseName: cseCourses[1].courseName,
          courseType: cseCourses[1].courseType,
          credits: cseCourses[1].credits,
          faculty: [
            { facultyId: cseFaculty[2]._id, role: 'Incharge' }
          ],
          venue: 'ABIII - C205'
        },
        {
          courseCode: cseCourses[2].courseCode,
          courseName: cseCourses[2].courseName,
          courseType: cseCourses[2].courseType,
          credits: cseCourses[2].credits,
          faculty: [
            { facultyId: cseFaculty[1]._id, role: 'Incharge' }
          ],
          venue: 'ABIII - C301'
        },
        {
          courseCode: cseCourses[4].courseCode,
          courseName: cseCourses[4].courseName,
          courseType: cseCourses[4].courseType,
          credits: cseCourses[4].credits,
          faculty: [
            { facultyId: cseFaculty[0]._id, role: 'Incharge' },
            { facultyId: cseFaculty[2]._id, role: 'Assisting' }
          ],
          venue: 'ABIII - TF-CP LAB 1'
        }
      ],
      classAdvisors: [
        {
          facultyId: cseFaculty[0]._id,
          name: cseFaculty[0].name
        }
      ],
      isActive: true
    });
    
    console.log(`  ✓ CSE S3-A (${courseAssignment.courses.length} courses)`);
    
    // Summary
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Faculty: ${createdFaculty.length}`);
    console.log(`  - Courses: ${createdCourses.length}`);
    console.log(`  - Classrooms: ${createdClassrooms.length}`);
    console.log(`  - Course Assignments: 1`);
    console.log(`  - Admin user: ${adminUser ? 'Preserved' : 'None'}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

export default seedDatabase;
