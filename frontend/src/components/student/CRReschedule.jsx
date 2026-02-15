import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const CRReschedule = () => {
    const { userName } = useOutletContext();
    const [request, setRequest] = useState({
        subject: '',
        currentDate: '',
        currentSlot: '',
        targetDate: '',
        targetSlot: '',
        reason: '',
        secureKey: ''
    });
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests/all');
            const data = await res.json();
            if (data.success) {
                // In a real app, filtering by studentName matches best
                // setRequests(data.requests.filter(r => r.studentName === userName));
                // But as per current requirement/implementation context, showing all behaves like a public notice board for CRs
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/requests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...request, studentName: userName })
            });

            const data = await res.json();

            if (data.success) {
                alert(data.message);
                setRequest({ subject: '', currentDate: '', currentSlot: '', targetDate: '', targetSlot: '', reason: '', secureKey: '' });
                fetchRequests();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Request error:", error);
            alert("Failed to send request. Please try again.");
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Request Class Rescheduling</h1>
            </div>

            <div className="request-form-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <p style={{ marginBottom: '2rem', color: '#718096' }}>
                    Use this form to coordinate a schedule change. You must verify your identity as Class Rep with the Secure Key.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Secure Key (CR Verification)</label>
                        <input
                            type="password"
                            placeholder="Enter CR Secure Key"
                            value={request.secureKey}
                            onChange={e => setRequest({ ...request, secureKey: e.target.value })}
                            style={{ borderColor: '#ed8936' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Subject / Course</label>
                        <select
                            value={request.subject}
                            onChange={e => setRequest({ ...request, subject: e.target.value })}
                            required
                        >
                            <option value="">Select Course...</option>
                            <option value="CS201">CS201 - Data Structures</option>
                            <option value="CS202">CS202 - DBMS</option>
                            <option value="CS203">CS203 - OS</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Current Date</label>
                            <input type="date" required value={request.currentDate} onChange={e => setRequest({ ...request, currentDate: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Current Slot</label>
                            <select value={request.currentSlot} onChange={e => setRequest({ ...request, currentSlot: e.target.value })}>
                                <option value="">Select Slot...</option>
                                <option>9:00 - 10:00</option>
                                <option>10:00 - 11:00</option>
                                <option>11:00 - 12:00</option>
                                <option>2:00 - 3:00</option>
                            </select>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>Proposed New Time</h4>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Target Date</label>
                            <input type="date" required value={request.targetDate} onChange={e => setRequest({ ...request, targetDate: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Target Slot</label>
                            <select value={request.targetSlot} onChange={e => setRequest({ ...request, targetSlot: e.target.value })}>
                                <option value="">Select Slot...</option>
                                <option>3:00 - 4:00 (Free)</option>
                                <option>4:00 - 5:00 (Free)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason for Rescheduling</label>
                        <textarea
                            rows="3"
                            value={request.reason}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            placeholder="e.g. Festival holiday, Guest lecture clash..."
                            onChange={e => setRequest({ ...request, reason: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="action-btn" style={{ backgroundColor: '#d69e2e' }}>Send Request</button>
                    </div>
                </form>
            </div>

            {/* Request History Section */}
            <div style={{ maxWidth: '700px', margin: '3rem auto' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem' }}>Request History</h2>
                {requests.length === 0 ? (
                    <p style={{ color: '#718096', marginTop: '1rem' }}>No requests submitted yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {requests.map(req => (
                            <div key={req._id} style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                borderLeft: req.status === 'Pending' ? '4px solid #ecc94b' : req.status === 'Approved' ? '4px solid #48bb78' : '4px solid #f56565'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, color: '#2d3748' }}>{req.subject}</h4>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        backgroundColor: req.status === 'Pending' ? '#feebc8' : req.status === 'Approved' ? '#c6f6d5' : '#fed7d7',
                                        color: req.status === 'Pending' ? '#d69e2e' : req.status === 'Approved' ? '#2f855a' : '#c53030'
                                    }}>
                                        {req.status}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>
                                    Requested: {req.currentDate} ({req.currentSlot}) &rarr; {req.targetDate} ({req.targetSlot})
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CRReschedule;
