import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllClassrooms, addClassroom, updateClassroom, deleteClassroom } from '../../services/classroomService';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    building: '',
    floor: '',
    block: '',
    roomType: 'Classroom',
    capacity: 60,
    labType: '',
    facilities: [],
    isAvailable: true
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => {
      const facilities = prev.facilities || [];
      const newFacilities = facilities.includes(facility)
        ? facilities.filter(f => f !== facility)
        : [...facilities, facility];
      return { ...prev, facilities: newFacilities };
    });
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
      building: room.building || '',
      floor: room.floor || '',
      block: room.block || '',
      roomType: room.roomType || 'Classroom',
      capacity: room.capacity || 60,
      labType: room.labType || '',
      facilities: room.facilities || [],
      isAvailable: room.isAvailable !== undefined ? room.isAvailable : true
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
      building: '',
      floor: '',
      block: '',
      roomType: 'Classroom',
      capacity: 60,
      labType: '',
      facilities: [],
      isAvailable: true
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
            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Building</label>
                <select 
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Building</option>
                  <option value="ABIII">ABIII</option>
                  <option value="AB-I">AB-I</option>
                  <option value="AB-II">AB-II</option>
                  <option value="TAG">TAG</option>
                  <option value="Library">Library</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Floor</label>
                <select 
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                >
                  <option value="">Select Floor</option>
                  <option value="GF">Ground Floor (GF)</option>
                  <option value="FF">First Floor (FF)</option>
                  <option value="SF">Second Floor (SF)</option>
                  <option value="TF">Third Floor (TF)</option>
                  <option value="FoF">Fourth Floor (FoF)</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Block</label>
                <input 
                  type="text" 
                  name="block"
                  placeholder="e.g., C, D, E" 
                  value={formData.block}
                  onChange={handleInputChange}
                  maxLength="2"
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Room Type</label>
                <select 
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Hardware Lab">Hardware Lab</option>
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
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
            </div>

            {(formData.roomType.includes('Lab')) && (
              <div className="form-group">
                <label>Lab Type</label>
                <select 
                  name="labType"
                  value={formData.labType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Lab Type</option>
                  <option value="CP LAB">Computer Programming Lab (CP LAB)</option>
                  <option value="HW LAB">Hardware Lab (HW LAB)</option>
                  <option value="NETWORK LAB">Network Lab</option>
                  <option value="ELECTRONICS LAB">Electronics Lab</option>
                  <option value="RESEARCH LAB">Research Lab</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label style={{display: 'block', marginBottom: '0.75rem'}}>Facilities</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {['Projector', 'Whiteboard', 'AC', 'Computers', 'Smart Board', 'Audio System'].map(facility => (
                  <label key={facility} style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s'
                  }}>
                    <input 
                      type="checkbox"
                      checked={formData.facilities?.includes(facility)}
                      onChange={() => handleFacilityToggle(facility)}
                      style={{
                        marginRight: '0.5rem',
                        marginTop: '0',
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span>{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd'
              }}>
                <input 
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  style={{
                    marginRight: '0.5rem',
                    marginTop: '0',
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{fontWeight: '500'}}>Room is Available</span>
              </label>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              marginTop: '1rem'
            }}>
              <small style={{color: '#0369a1'}}>
                <strong>Note:</strong> Full Room ID will be auto-generated as: {formData.building}
                {formData.floor && ` - ${formData.floor}`}
                {formData.block && `-${formData.block}`}
                {formData.roomType.includes('Lab') && formData.labType && ` ${formData.labType}`}
                {` ${formData.roomId || '[Room Number]'}`}
              </small>
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
