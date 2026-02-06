import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllFaculty, addFaculty, updateFaculty, deleteFaculty } from '../../services/facultyService';

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    facultyType: 'Full-time'
  });

  // Fetch faculty data on component mount
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFaculty();
      setFacultyList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty data');
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
      if (editingFaculty) {
        // Update existing faculty
        await updateFaculty(editingFaculty._id, formData);
      } else {
        // Add new faculty
        await addFaculty(formData);
      }
      
      // Refresh the faculty list
      await fetchFaculty();
      
      // Reset form and close
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.userId?.name || '',
      email: faculty.userId?.email || '',
      department: faculty.department || '',
      designation: faculty.designation || '',
      facultyType: faculty.facultyType || 'Full-time'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteFaculty(id);
      await fetchFaculty();
    } catch (err) {
      setError(err.message || 'Failed to delete faculty');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      facultyType: 'Full-time'
    });
    setEditingFaculty(null);
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
        <h1>Faculty Management</h1>
        <button className="action-btn" onClick={handleFormToggle}>
          {showForm ? 'Close Form' : 'Add New Faculty'}
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
          <h3>{editingFaculty ? 'Edit Faculty Details' : 'Add Faculty Details'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Faculty Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter Full Name" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter Email Address" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                name="department"
                placeholder="e.g., Computer Science" 
                value={formData.department}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input 
                type="text" 
                name="designation"
                placeholder="e.g., Professor, HOD, Guest" 
                value={formData.designation}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Faculty Type</label>
              <select 
                name="facultyType"
                value={formData.facultyType}
                onChange={handleInputChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Ad-hoc">Ad-hoc</option>
                <option value="Half-time">Half-time</option>
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
                {loading ? 'Saving...' : 'Save Faculty'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading faculty data...
            </div>
          ) : facultyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No faculty members found. Click "Add New Faculty" to get started.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((faculty) => (
                  <tr key={faculty._id}>
                    <td>{faculty.userId?.name || 'N/A'}</td>
                    <td>{faculty.userId?.email || 'N/A'}</td>
                    <td>{faculty.department}</td>
                    <td>{faculty.designation}</td>
                    <td><span className="status-badge status-active">{faculty.facultyType}</span></td>
                    <td>
                      <button 
                        className="icon-btn edit-btn" 
                        title="Edit"
                        onClick={() => handleEdit(faculty)}
                        disabled={loading}
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDelete(faculty._id)}
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

export default AdminFaculty;
