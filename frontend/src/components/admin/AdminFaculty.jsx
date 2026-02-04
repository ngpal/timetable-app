import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([
    { id: 1, name: 'Dr. John Smith', department: 'CS', type: 'Full-time' },
    { id: 2, name: 'Prof. Sarah Doe', department: 'IT', type: 'Ad-hoc' },
    { id: 3, name: 'Dr. Mike Ross', department: 'CS', type: 'Full-time' },
  ]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h1>Faculty Management</h1>
        <button className="action-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : 'Add New Faculty'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add Faculty Details</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Faculty Added!"); setShowForm(false); }}>
            <div className="form-group">
              <label>Faculty Name</label>
              <input type="text" placeholder="Enter Full Name" required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Electronics</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <select>
                <option>Professor</option>
                <option>Assistant Professor</option>
                <option>Lecturer</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="action-btn">Save Faculty</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyList.map((faculty) => (
              <tr key={faculty.id}>
                <td>{faculty.id}</td>
                <td>{faculty.name}</td>
                <td>{faculty.department}</td>
                <td><span className="status-badge status-active">{faculty.type}</span></td>
                <td>
                  <button className="icon-btn edit-btn" title="Edit"><Pencil size={24} /></button>
                  <button className="icon-btn delete-btn" title="Delete"><Trash2 size={24} /></button>
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

export default AdminFaculty;
