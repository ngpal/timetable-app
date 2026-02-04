import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([
    { id: '101', name: 'Lecture Hall 1', capacity: 60, type: 'Classroom' },
    { id: 'LAB1', name: 'Computer Lab 1', capacity: 30, type: 'Lab' },
    { id: '102', name: 'Lecture Hall 2', capacity: 60, type: 'Classroom' },
  ]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h1>Classroom Management</h1>
        <button className="action-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : 'Add New Room'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add Classroom/Lab Details</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Room Added!"); setShowForm(false); }}>
            <div className="form-group">
              <label>Room ID / Number</label>
              <input type="text" placeholder="e.g. 301" required />
            </div>
            <div className="form-group">
              <label>Room Name</label>
              <input type="text" placeholder="e.g. Seminar Hall" required />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" placeholder="Enter seating capacity" required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select>
                <option>Classroom</option>
                <option>Lab</option>
                <option>Auditorium</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="action-btn">Save Room</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.name}</td>
                <td><span className={`status-badge ${room.type === 'Lab' ? 'status-inactive' : 'status-active'}`}>{room.type}</span></td>
                <td>{room.capacity}</td>
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

export default AdminRooms;
