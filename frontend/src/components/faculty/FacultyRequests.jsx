import React, { useState } from 'react';

const FacultyRequests = () => {
    const [requests, setRequests] = useState([
        { id: 1, class: 'CS Second Year', subject: 'Data Structures', currentSlot: 'Mon 10-11', requestedSlot: 'Tue 2-3', reason: 'Sports Event', status: 'Pending' },
        { id: 2, class: 'IT Final Year', subject: 'Project Lab', currentSlot: 'Fri 2-5', requestedSlot: 'Thu 2-5', reason: 'WorkshopClash', status: 'Pending' }
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

            <div style={{maxWidth: '100000000000px'}}>
                {requests.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#718096', padding: '2rem'}}>No pending requests.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div>
                                <h4 style={{margin: '0 0 0.5rem 0'}}>{req.class} - {req.subject}</h4>
                                <p style={{margin: 0, fontSize: '0.9rem', color: '#4a5568'}}>
                                    Request to move from <strong>{req.currentSlot}</strong> to <strong>{req.requestedSlot}</strong>
                                </p>
                                <p style={{margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#718096'}}>Reason: {req.reason}</p>
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
