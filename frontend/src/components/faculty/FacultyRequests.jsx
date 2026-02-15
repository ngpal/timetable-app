import React, { useState, useEffect } from 'react';

const FacultyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests/all');
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        // action is 'Approved' or 'Rejected'
        // But backend expects status in body
        // The button click passes 'Accept' or 'Reject' as string in previous code, let's standardize.
        // Let's assume action is the status string 'Approved' or 'Rejected'

        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchRequests(); // Refresh list
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Rescheduling Requests</h1>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>No pending requests.</p>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="request-card" style={{ borderLeft: req.status === 'Pending' ? '4px solid #ecc94b' : req.status === 'Approved' ? '4px solid #48bb78' : '4px solid #f56565' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{req.subject} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#718096' }}>by {req.studentName}</span></h4>
                                <p style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>
                                    Request to move <strong>{req.currentDate} ({req.currentSlot})</strong> to <strong>{req.targetDate} ({req.targetSlot})</strong>
                                </p>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#718096' }}>
                                    Reason: {req.reason}
                                </p>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    Status: {req.status}
                                </p>
                            </div>
                            {req.status === 'Pending' && (
                                <div className="request-actions">
                                    <button className="accept-btn" onClick={() => handleAction(req._id, 'Approved')}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleAction(req._id, 'Rejected')}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FacultyRequests;
