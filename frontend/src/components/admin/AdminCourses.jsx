import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([
    { id: 'CS101', name: 'Data Structures', theoryHours: 3, labHours: 2 },
    { id: 'CS102', name: 'Database Systems', theoryHours: 3, labHours: 2 },
    { id: 'CS103', name: 'Operating Systems', theoryHours: 4, labHours: 0 },
    { id: 'CS104', name: 'Software Engineering', theoryHours: 3, labHours: 0 },
    { id: 'CS105', name: 'Computer Networks', theoryHours: 3, labHours: 2 },
  ]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h1>Course Management</h1>
        <button className="action-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : 'Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add Course Details</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Course Added!"); setShowForm(false); }}>
            <div className="form-group">
              <label>Course Code</label>
              <input type="text" placeholder="e.g. CS101" required />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input type="text" placeholder="e.g. Data Analysis" required />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Theory Hours / Week</label>
                  <input type="number" min="0" max="10" defaultValue="3" />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Lab Hours / Week</label>
                  <input type="number" min="0" max="10" defaultValue="2" />
                </div>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="action-btn">Save Course</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Theory Hours</th>
              <th>Lab Hours</th>
              <th>Total Load</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.theoryHours}</td>
                <td>{course.labHours}</td>
                <td>{course.theoryHours + course.labHours} hrs</td>
                <td>
                  <button className="icon-btn edit-btn" title="Edit">
                    <Pencil size={24} />
                  </button>
                  <button className="icon-btn delete-btn" title="Delete">
                    <Trash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default AdminCourses;
