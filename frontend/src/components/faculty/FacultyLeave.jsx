import React, { useState } from 'react';

const FacultyLeave = () => {
    const [leaveType, setLeaveType] = useState('Casual Leave');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Leave Application Submitted to Admin for Approval.');
    };

    return (
        <div>
            <div className="page-header">
                <h1>Apply for Leave / Unavailability</h1>
            </div>

            <div className="form-card" style={{margin: '0'}}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Leave Type</label>
                        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                            <option>Casual Leave</option>
                            <option>Medical Leave</option>
                            <option>On Duty (OD)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date Range</label>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <input type="date" required style={{flex: 1}} />
                            <span style={{alignSelf: 'center'}}>to</span>
                            <input type="date" required style={{flex: 1}} />
                        </div>
                    </div>

                     <div className="form-group">
                        <label>Reason</label>
                        <textarea 
                            rows="4" 
                            style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px'}}
                            placeholder="Please provide a valid reason..."
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn">Submit Application</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacultyLeave;
