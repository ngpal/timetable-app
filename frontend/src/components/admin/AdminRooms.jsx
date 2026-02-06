import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllClassrooms, addClassroom, updateClassroom, deleteClassroom } from '../../services/classroomService';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    roomName: '',
    roomType: 'Classroom',
    capacity: 0
  });

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllClassrooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingRoom) {
        // Update existing room
        await updateClassroom(editingRoom._id, formData);
      } else {
        // Add new room
        await addClassroom(formData);
      }

      // Refresh the room list
      await fetchRooms();

      // Reset form and close
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomId: room.roomId || '',
      roomName: room.roomName || '',
      roomType: room.roomType || 'Classroom',
      capacity: room.capacity || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteClassroom(id);
      await fetchRooms();
    } catch (err) {
      setError(err.message || 'Failed to delete classroom');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomId: '',
      roomName: '',
      roomType: 'Classroom',
      capacity: 0
    });
    setEditingRoom(null);
    setError(null);
  };

  const handleFormToggle = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Classroom Management</h1>
        <button className="action-btn" onClick={handleFormToggle}>
          {showForm ? 'Close Form' : 'Add New Room'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00',
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>{editingRoom ? 'Edit Classroom/Lab Details' : 'Add Classroom/Lab Details'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Room ID / Number</label>
              <input 
                type="text" 
                name="roomId"
                placeholder="e.g. 301 or LAB1" 
                value={formData.roomId}
                onChange={handleInputChange}
                disabled={editingRoom !== null} // Disable editing room ID
                required 
              />
            </div>
            <div className="form-group">
              <label>Room Name</label>
              <input 
                type="text" 
                name="roomName"
                placeholder="e.g. Seminar Hall" 
                value={formData.roomName}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input 
                type="number" 
                name="capacity"
                placeholder="Enter seating capacity" 
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                required
              >
                <option value="Classroom">Classroom</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleFormToggle}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Room'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading classrooms...
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No classrooms found. Click "Add New Room" to get started.
            </div>
          ) : (
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
                  <tr key={room._id}>
                    <td>{room.roomId}</td>
                    <td>{room.roomName}</td>
                    <td>
                      <span className={`status-badge ${room.roomType === 'Lab' ? 'status-inactive' : 'status-active'}`}>
                        {room.roomType}
                      </span>
                    </td>
                    <td>{room.capacity}</td>
                    <td>
                      <button 
                        className="icon-btn edit-btn" 
                        title="Edit"
                        onClick={() => handleEdit(room)}
                        disabled={loading}
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDelete(room._id)}
                        disabled={loading}
                      >
                        <Trash2 size={24} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
