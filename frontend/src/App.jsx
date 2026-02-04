import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'

import AdminDashboard from './components/admin/AdminDashboard'
import AdminHome from './components/admin/AdminHome'
import AdminFaculty from './components/admin/AdminFaculty'
import AdminCourses from './components/admin/AdminCourses'
import AdminRooms from './components/admin/AdminRooms'
import AdminTimetable from './components/admin/AdminTimetable'
import FacultyDashboard from './components/faculty/FacultyDashboard'
import FacultyHome from './components/faculty/FacultyHome'
import FacultyTimetable from './components/faculty/FacultyTimetable'
import FacultyRequests from './components/faculty/FacultyRequests'
import FacultyLeave from './components/faculty/FacultyLeave'
import StudentDashboard from './components/student/StudentDashboard'
import StudentHome from './components/student/StudentHome'
import StudentTimetable from './components/student/StudentTimetable'
import CRReschedule from './components/student/CRReschedule'
import './App.css'

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        
        {/* Admin Module Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="timetable" element={<AdminTimetable />} />
        </Route>

        {/* Faculty Module Routes */}
        <Route path="/faculty" element={<FacultyDashboard />}>
          <Route index element={<FacultyHome />} />
          <Route path="timetable" element={<FacultyTimetable />} />
          <Route path="requests" element={<FacultyRequests />} />
          <Route path="leave" element={<FacultyLeave />} />
        </Route>

        {/* Student Module Routes */}
        <Route path="/student" element={<StudentDashboard />}>
          <Route index element={<StudentHome />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="reschedule" element={<CRReschedule />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
