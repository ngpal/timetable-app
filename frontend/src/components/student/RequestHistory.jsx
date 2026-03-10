import React, { useState, useEffect } from 'react';
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RequestHistory = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const requestsRes = await fetch('/api/slot-change-requests', {
                credentials: 'include'
            });
            const requestsData = await requestsRes.json();
            setRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending_Faculty: { bg: '#fef3c7', color: '#92400e', label: 'Pending Faculty' },
            Pending_Admin: { bg: '#dbeafe', color: '#1e40af', label: 'Pending Admin' },
            Approved: { bg: '#DCFCE7', color: '#15803D', label: 'Approved' },
            Rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' }
        };
        const style = styles[status] || styles.Pending_Faculty;
        return (
            <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                backgroundColor: style.bg,
                color: style.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {status === 'Approved' && <CheckCircle size={14} />}
                {status === 'Rejected' && <XCircle size={14} />}
                {(status === 'Pending_Faculty' || status === 'Pending_Admin') && <Clock size={14} />}
                {style.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading request history...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Request History
                </h2>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {requests.length === 0 ? (
                    <div className="modern-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No requests submitted yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {requests.map(req => (
                            <div key={req._id} className="modern-card" style={{
                                backgroundColor: 'var(--surface)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border)',
                                borderLeft: `4px solid ${
                                    req.status === 'Pending_Faculty' ? '#fbbf24' : 
                                    req.status === 'Pending_Admin' ? '#3b82f6' : 
                                    req.status === 'Approved' ? '#22C55E' : '#ef4444'
                                }`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                                            {req.courseCode} - {req.courseName}
                                        </h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Faculty: {req.facultyName}
                                        </p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current</div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.currentDay}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Slot {req.currentSlotNumber}</div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Requested</div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.requestedDay}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Slot {req.requestedSlotNumber}</div>
                                    </div>
                                </div>
                                {req.status === 'Approved' && req.assignedVenue && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#DCFCE7', border: '2px solid #22C55E', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={20} color="#15803D" />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                Approved - Classroom Assigned
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#15803D', fontWeight: 700 }}>
                                                Room: {req.assignedVenue}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {req.reason && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>Reason:</strong> {req.reason}
                                    </div>
                                )}
                                {req.adminNote && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: '#92400e' }}>
                                        <strong>Admin Note:</strong> {req.adminNote}
                                    </div>
                                )}
                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Submitted: {new Date(req.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestHistory;
