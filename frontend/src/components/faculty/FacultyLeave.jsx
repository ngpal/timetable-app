import React, { useState, useEffect } from 'react';
import { createLeaveRequest, getLeaveRequestsByFaculty } from '../../services/leaveRequestService';

const FacultyLeave = () => {
    const [leaveType, setLeaveType] = useState('Casual Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [fetchingRequests, setFetchingRequests] = useState(true);

    // Get faculty info from localStorage or context
    const facultyInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            setFetchingRequests(true);
            const response = await getLeaveRequestsByFaculty(facultyInfo.id || facultyInfo._id);
            setMyRequests(response.data || []);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setFetchingRequests(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!startDate || !endDate || !reason.trim()) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const leaveData = {
                facultyId: facultyInfo.id || facultyInfo._id,
                facultyName: facultyInfo.name || 'Faculty User',
                facultyEmail: facultyInfo.email || '',
                leaveType,
                startDate,
                endDate,
                reason
            };

            await createLeaveRequest(leaveData);
            alert('Leave request submitted successfully! Waiting for admin approval.');
            
            // Reset form
            setLeaveType('Casual Leave');
            setStartDate('');
            setEndDate('');
            setReason('');
            
            // Refresh requests list
            fetchMyRequests();
        } catch (error) {
            alert('Failed to submit leave request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeStyle = (status) => {
        const baseStyle = {
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 600
        };

        switch (status) {
            case 'Approved':
                return { ...baseStyle, background: '#DCFCE7', color: '#15803D' };
            case 'Rejected':
                return { ...baseStyle, background: '#fee2e2', color: '#991b1b' };
            default: // Pending
                return { ...baseStyle, background: '#fef3c7', color: '#92400e' };
        }
    };

    return (
        <div className="dashboard-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Apply for Leave</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Submit and track your leave applications</p>
                </div>
            </div>

            <div className="form-card" style={{ margin: '0' }}>
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
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="date" 
                                required 
                                style={{ flex: 1 }} 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span style={{ alignSelf: 'center' }}>to</span>
                            <input 
                                type="date" 
                                required 
                                style={{ flex: 1 }} 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason</label>
                        <textarea
                            rows="4"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            placeholder="Please provide a valid reason..."
                            required
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>

            {/* My Leave Requests */}
            <div className="form-card" style={{ margin: '0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>My Leave Requests</h3>
                
                {fetchingRequests ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading requests...</p>
                ) : myRequests.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No leave requests yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Leave Type</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Start Date</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>End Date</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Reason</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Admin Response</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRequests.map((request) => (
                                    <tr key={request._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem' }}>{request.leaveType}</td>
                                        <td style={{ padding: '0.75rem' }}>{request.startDate}</td>
                                        <td style={{ padding: '0.75rem' }}>{request.endDate}</td>
                                        <td style={{ padding: '0.75rem', maxWidth: '200px' }}>{request.reason}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={getStatusBadgeStyle(request.status)}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {request.adminResponse || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyLeave;
