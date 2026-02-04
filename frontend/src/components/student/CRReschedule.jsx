import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const CRReschedule = () => {
    const { isCR } = useOutletContext();
    const [request, setRequest] = useState({
        subject: '',
        currentDate: '',
        currentSlot: '',
        targetDate: '',
        targetSlot: '',
        reason: ''
    });

    if (!isCR) {
        return (
            <div style={{textAlign: 'center', marginTop: '3rem', color: '#e53e3e'}}>
                <h2>Access Denied</h2>
                <p>Only Class Representatives can access this page.</p>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Rescheduling Request Sent to Faculty & Admin for approval.");
        setRequest({  subject: '', currentDate: '', currentSlot: '', targetDate: '', targetSlot: '', reason: '' });
    };

    return (
        <div>
            <div className="page-header">
                <h1>Request Class Rescheduling</h1>
                <span className="cr-badge" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>CR Access Only</span>
            </div>

            <div className="request-form-card" style={{maxWidth: '700px', margin: '0 auto'}}>
                <p style={{marginBottom: '2rem', color: '#718096'}}>
                    Use this form to coordinate a schedule change. The request will be forwarded to the respective faculty member.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject / Course</label>
                        <select 
                            value={request.subject} 
                            onChange={e => setRequest({...request, subject: e.target.value})}
                            required
                        >
                            <option value="">Select Course...</option>
                            <option value="CS201">CS201 - Data Structures</option>
                            <option value="CS202">CS202 - DBMS</option>
                            <option value="CS203">CS203 - OS</option>
                        </select>
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Current Date</label>
                            <input type="date" required onChange={e => setRequest({...request, currentDate: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Current Slot</label>
                            <select onChange={e => setRequest({...request, currentSlot: e.target.value})}>
                                <option>9:00 - 10:00</option>
                                <option>10:00 - 11:00</option>
                                <option>11:00 - 12:00</option>
                                <option>2:00 - 3:00</option>
                            </select>
                        </div>
                    </div>

                    <h4 style={{marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem'}}>Proposed New Time</h4>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Target Date</label>
                            <input type="date" required onChange={e => setRequest({...request, targetDate: e.target.value})} />
                        </div>
                         <div className="form-group" style={{flex: 1}}>
                            <label>Target Slot</label>
                            <select onChange={e => setRequest({...request, targetSlot: e.target.value})}>
                                <option>3:00 - 4:00 (Free)</option>
                                <option>4:00 - 5:00 (Free)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason for Rescheduling</label>
                         <textarea 
                            rows="3" 
                            style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px'}}
                            placeholder="e.g. Festival holiday, Guest lecture clash..."
                            onChange={e => setRequest({...request, reason: e.target.value})}
                            required
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn" style={{backgroundColor: '#d69e2e'}}>Send Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CRReschedule;
