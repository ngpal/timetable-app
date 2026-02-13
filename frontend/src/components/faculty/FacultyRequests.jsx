import React, { useState } from 'react';

const FacultyRequests = () => {
    const [requests, setRequests] = useState([
        { id: 1, class: 'CS Second Year', subject: 'Data Structures', currentSlot: 'Mon Slot 2', requestedSlot: 'Tue Slot 6', reason: 'Sports Event', status: 'Pending' },
        { id: 2, class: 'IT Final Year', subject: 'Project Lab', currentSlot: 'Fri Slot 6,7,8', requestedSlot: 'Thu Slot 6,7,8', reason: 'WorkshopClash', status: 'Pending' }
    ]);

    const handleAction = (id, action) => {
        alert(`Request ${action}ed`);
        setRequests(requests.filter(r => r.id !== id));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Rescheduling Requests</h1>
            </div>

            <div style={{ maxWidth: '100000000000px' }}>
                {requests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>No pending requests.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div>
                                <h4 style={{ margin: '1 1 1.3rem 0' }}>{req.class}</h4>
                                <p style={{ margin: 0, fontSize: '1.25rem', color: '#4a5568' }}>
                                    Request to move from <strong>{req.currentSlot}</strong> to <strong>{req.requestedSlot}</strong>
                                </p>
                            </div>
                            <div className="request-actions">
                                <button className="accept-btn" onClick={() => handleAction(req.id, 'Accept')}>Approve</button>
                                <button className="reject-btn" onClick={() => handleAction(req.id, 'Reject')}>Reject</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FacultyRequests;
