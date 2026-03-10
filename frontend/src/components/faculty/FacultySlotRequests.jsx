import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, Send } from 'lucide-react';

const FacultySlotRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/slot-change-requests?status=Pending_Faculty', {
                credentials: 'include'
            });
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        if (!window.confirm('Forward this request to Admin for final approval?')) {
            return;
        }

        try {
            setProcessing(requestId);
            const res = await fetch(`/api/slot-change-requests/${requestId}/faculty-approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: 'Approved' })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Request forwarded to Admin');
                fetchRequests();
            } else {
                alert(`Error: ${data.message || 'Failed to approve request'}`);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId) => {
        const message = prompt('Enter reason for rejection:');
        if (!message) return;

        try {
            setProcessing(requestId);
            const res = await fetch(`/api/slot-change-requests/${requestId}/faculty-approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: 'Rejected', message })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Request rejected');
                fetchRequests();
            } else {
                alert(`Error: ${data.message || 'Failed to reject request'}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Slot Change Requests
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Review and forward requests to Admin for final approval
                </p>
            </div>

            {requests.length === 0 ? (
                <div className="modern-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No Pending Requests</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>You have no slot change requests awaiting your review.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                    {requests.map(req => (
                        <div key={req._id} className="modern-card" style={{
                            backgroundColor: 'var(--surface)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border)',
                            borderLeft: '4px solid #fbbf24'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                                        {req.courseCode} - {req.courseName}
                                    </h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Requested by: {req.requestedBy?.name || 'CR'}
                                    </p>
                                </div>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    padding: '0.35rem 0.85rem',
                                    borderRadius: '999px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Clock size={14} />
                                    Pending Faculty
                                </span>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr auto 1fr', 
                                gap: '1.5rem', 
                                alignItems: 'center', 
                                marginTop: '1.5rem', 
                                padding: '1.5rem', 
                                background: 'var(--bg)', 
                                borderRadius: 'var(--radius-md)' 
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>CURRENT SLOT</div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{req.currentDay}</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Slot {req.currentSlotNumber}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        📍 {req.venue}
                                    </div>
                                </div>
                                <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>→</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>REQUESTED SLOT</div>
                                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{req.requestedDay}</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Slot {req.requestedSlotNumber}</div>
                                </div>
                            </div>

                            {req.reason && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e', marginBottom: '0.5rem' }}>REASON</div>
                                    <div style={{ fontSize: '0.95rem', color: '#92400e' }}>{req.reason}</div>
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Submitted: {new Date(req.createdAt).toLocaleString()}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <button
                                    onClick={() => handleApprove(req._id)}
                                    disabled={processing === req._id}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: processing === req._id ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: processing === req._id ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {processing === req._id ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Forward to Admin
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleReject(req._id)}
                                    disabled={processing === req._id}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: processing === req._id ? '#9ca3af' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: processing === req._id ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultySlotRequests;
