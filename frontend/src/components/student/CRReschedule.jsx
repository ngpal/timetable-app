import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { timetableService } from '../../services/timetableService';

const CRReschedule = () => {
    const { userName: _userName } = useOutletContext();
    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [request, setRequest] = useState({
        courseCode: '',
        currentDay: '',
        currentSlotNumber: '',
        requestedDay: '',
        requestedSlotNumber: '',
        reason: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
        { number: 1, label: 'Slot 1 (08:00-09:00)' },
        { number: 2, label: 'Slot 2 (09:00-10:00)' },
        { number: 3, label: 'Slot 3 (10:00-11:00)' },
        { number: 4, label: 'Slot 4 (11:00-12:00)' },
        { number: 5, label: 'Lunch Break (12:00-13:00)' },
        { number: 6, label: 'Slot 6 (13:00-14:00)' },
        { number: 7, label: 'Slot 7 (14:00-15:00)' },
        { number: 8, label: 'Slot 8 (15:00-16:00)' },
        { number: 9, label: 'Slot 9 (16:00-17:00)' }
    ];

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const timetableRes = await timetableService.getStudentPersonalTimetable();
            if (timetableRes && timetableRes.success) {
                setTimetableData(timetableRes.timetable);
            }
        } catch (error) {
            console.error("Error fetching timetable:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!timetableData) {
            alert('Timetable not loaded');
            return;
        }

        // Find the slot being moved
        const currentSlot = timetableData.timetableSlots.find(
            s => s.day === request.currentDay && s.slotNumber === parseInt(request.currentSlotNumber)
        );

        if (!currentSlot) {
            alert('Invalid current slot selection');
            return;
        }

        // Find course information
        const course = timetableData.courses.find(c => c.courseCode === request.courseCode);
        if (!course) {
            alert('Course not found');
            return;
        }

        const facultyMember = course.faculty.find(f => f.role === 'Incharge') || course.faculty[0];

        const requestBody = {
            courseAssignmentId: timetableData._id,
            courseCode: request.courseCode,
            courseName: course.courseName,
            facultyName: facultyMember?.name || 'TBD',
            venue: currentSlot.venue,
            currentDay: request.currentDay,
            currentSlotNumber: parseInt(request.currentSlotNumber),
            requestedDay: request.requestedDay,
            requestedSlotNumber: parseInt(request.requestedSlotNumber),
            reason: request.reason
        };

        try {
            setSubmitting(true);
            const res = await fetch('/api/slot-change-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Request submitted successfully to Faculty');
                setRequest({
                    courseCode: '',
                    currentDay: '',
                    currentSlotNumber: '',
                    requestedDay: '',
                    requestedSlotNumber: '',
                    reason: ''
                });
            } else {
                alert(`Error: ${data.message || 'Failed to submit request'}`);
            }
        } catch (error) {
            console.error("Request error:", error);
            alert("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading timetable data...</p>
            </div>
        );
    }

    if (!timetableData) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
                    <AlertCircle size={32} />
                    <div>
                        <h3 style={{ margin: 0 }}>No Timetable Found</h3>
                        <p style={{ margin: '0.25rem 0 0 0' }}>Unable to load your section's timetable. Please contact admin.</p>
                    </div>
                </div>
            </div>
        );
    }

    const availableCourses = timetableData.courses || [];

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Request Class Rescheduling
                </h2>
            </div>

            {/* Submit Request Form */}
                <div className="modern-card" style={{ maxWidth: '700px', margin: '0 auto 2rem', padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                    <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Select Course</label>
                        <select
                            value={request.courseCode}
                            onChange={e => setRequest({ ...request, courseCode: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                            required
                        >
                            <option value="">Select</option>
                            {availableCourses.map(course => (
                                <option key={course.courseCode} value={course.courseCode}>
                                    {course.courseCode} - {course.courseName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Current Slot</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Day</label>
                            <select
                                value={request.currentDay}
                                onChange={e => setRequest({ ...request, currentDay: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                                required
                            >
                                <option value="">Select</option>
                                {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Slot</label>
                            <select
                                value={request.currentSlotNumber}
                                onChange={e => setRequest({ ...request, currentSlotNumber: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                                required
                            >
                                <option value="">Select</option>
                                {slots.filter(s => s.number !== 5).map(slot => (
                                    <option key={slot.number} value={slot.number}>{slot.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>Requested New Slot</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Day</label>
                            <select
                                value={request.requestedDay}
                                onChange={e => setRequest({ ...request, requestedDay: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                                required
                            >
                                <option value="">Select</option>
                                {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Slot</label>
                            <select
                                value={request.requestedSlotNumber}
                                onChange={e => setRequest({ ...request, requestedSlotNumber: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                                required
                            >
                                <option value="">Select</option>
                                {slots.filter(s => s.number !== 5).map(slot => (
                                    <option key={slot.number} value={slot.number}>{slot.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Reason for Rescheduling</label>
                        <textarea
                            rows="3"
                            value={request.reason}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'inherit' }}
                            onChange={e => setRequest({ ...request, reason: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                backgroundColor: submitting ? '#9ca3af' : '#2563EB', 
                                color: '#FFFFFF', 
                                border: 'none', 
                                borderRadius: 'var(--radius-md)', 
                                fontSize: '1rem', 
                                fontWeight: 600, 
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1D4ED8')}
                            onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#2563EB')}
                        >
                            {submitting && <Loader2 className="animate-spin" size={18} />}
                            {submitting ? 'Submitting...' : 'Submit Request to Faculty'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CRReschedule;
