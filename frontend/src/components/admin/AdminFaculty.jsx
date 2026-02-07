import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllFaculty, addFaculty, updateFaculty, deleteFaculty } from '../../services/facultyService';

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    designation: '',
    facultyType: 'Full-time',
    isClassAdvisor: false,
    specialization: '',
    qualifications: '',
    workConstraints: {
      maxHoursPerWeek: 40,
      maxHoursPerDay: 6,
      maxConsecutiveHours: 3
    }
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
    const { name, value, type, checked } = e.target;
    
    // Handle nested workConstraints
    if (name.startsWith('workConstraints.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        workConstraints: {
          ...prev.workConstraints,
          [field]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process specialization string to array
      const dataToSend = {
        ...formData,
        specialization: formData.specialization 
          ? formData.specialization.split(',').map(s => s.trim()).filter(s => s)
          : []
      };
      
      if (editingFaculty) {
        // Update existing faculty
        await updateFaculty(editingFaculty._id, dataToSend);
      } else {
        // Add new faculty
        await addFaculty(dataToSend);
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
      name: faculty.name || faculty.userId?.name || '',
      email: faculty.email || faculty.userId?.email || '',
      phoneNumber: faculty.phoneNumber || '',
      department: faculty.department || '',
      designation: faculty.designation || '',
      facultyType: faculty.facultyType || 'Full-time',
      isClassAdvisor: faculty.isClassAdvisor || false,
      specialization: Array.isArray(faculty.specialization) 
        ? faculty.specialization.join(', ') 
        : '',
      qualifications: faculty.qualifications || '',
      workConstraints: {
        maxHoursPerWeek: faculty.workConstraints?.maxHoursPerWeek || 40,
        maxHoursPerDay: faculty.workConstraints?.maxHoursPerDay || 6,
        maxConsecutiveHours: faculty.workConstraints?.maxConsecutiveHours || 3
      }
    });
    setShowForm(true);
    setShowAdvanced(true); // Show advanced fields when editing
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
      phoneNumber: '',
      department: '',
      designation: '',
      facultyType: 'Full-time',
      isClassAdvisor: false,
      specialization: '',
      qualifications: '',
      workConstraints: {
        maxHoursPerWeek: 40,
        maxHoursPerDay: 6,
        maxConsecutiveHours: 3
      }
    });
    setEditingFaculty(null);
    setError(null);
    setShowAdvanced(false);
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
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber"
                placeholder="Enter Phone Number" 
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science (CSE)</option>
                <option value="Electronics and Communication">Electronics and Communication (ECE)</option>
                <option value="Electrical and Electronics">Electrical and Electronics (EEE)</option>
                <option value="Mechanical">Mechanical (ME)</option>
                <option value="Civil">Civil (CE)</option>
                <option value="Chemical">Chemical (CHE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Aerospace">Aerospace (AE)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <select 
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="HOD">HOD</option>
                <option value="Guest Faculty">Guest Faculty</option>
              </select>
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
                <option value="Visiting">Visiting</option>
              </select>
            </div>

            {/* Advanced Fields Toggle */}
            <div style={{marginTop: '1rem', marginBottom: '1rem'}}>
              <button
                type="button"
                className="action-btn"
                style={{backgroundColor: '#6b9e4d', width: '100%'}}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼ Hide Advanced Fields' : '▶ Show Advanced Fields'}
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="form-group">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0'
                  }}>
                    <input 
                      type="checkbox"
                      name="isClassAdvisor"
                      checked={formData.isClassAdvisor}
                      onChange={handleInputChange}
                      style={{
                        marginRight: '0.5rem',
                        marginTop: '0',
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span style={{fontWeight: '500'}}>Is Class Advisor</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Specialization (comma-separated)</label>
                  <input 
                    type="text" 
                    name="specialization"
                    placeholder="e.g., Machine Learning, Data Science, AI" 
                    value={formData.specialization}
                    onChange={handleInputChange}
                  />
                  <small style={{color: '#666', fontSize: '0.85rem'}}>
                    Enter multiple specializations separated by commas
                  </small>
                </div>

                <div className="form-group">
                  <label>Qualifications</label>
                  <textarea 
                    name="qualifications"
                    placeholder="e.g., Ph.D. in Computer Science" 
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    rows="2"
                    style={{resize: 'vertical'}}
                  />
                </div>

                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginTop: '1rem',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h4 style={{marginTop: 0, marginBottom: '1rem', color: '#333'}}>Work Constraints</h4>
                  
                  <div className="form-group">
                    <label>Max Hours Per Week</label>
                    <input 
                      type="number" 
                      name="workConstraints.maxHoursPerWeek"
                      min="1"
                      max="60"
                      value={formData.workConstraints.maxHoursPerWeek}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Hours Per Day</label>
                    <input 
                      type="number" 
                      name="workConstraints.maxHoursPerDay"
                      min="1"
                      max="12"
                      value={formData.workConstraints.maxHoursPerDay}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Consecutive Hours</label>
                    <input 
                      type="number" 
                      name="workConstraints.maxConsecutiveHours"
                      min="1"
                      max="6"
                      value={formData.workConstraints.maxConsecutiveHours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

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
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Specialization</th>
                  <th>Class Advisor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((faculty) => (
                  <tr key={faculty._id}>
                    <td>{faculty.name || faculty.userId?.name || 'N/A'}</td>
                    <td>{faculty.email || faculty.userId?.email || 'N/A'}</td>
                    <td>{faculty.phoneNumber || '-'}</td>
                    <td>{faculty.department}</td>
                    <td>{faculty.designation}</td>
                    <td><span className="status-badge status-active">{faculty.facultyType}</span></td>
                    <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {Array.isArray(faculty.specialization) && faculty.specialization.length > 0
                        ? faculty.specialization.join(', ')
                        : '-'}
                    </td>
                    <td>
                      {faculty.isClassAdvisor && (
                        <span className="status-badge" style={{backgroundColor: '#48bb78', color: 'white'}}>
                          ✓ Advisor
                        </span>
                      )}
                    </td>
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
