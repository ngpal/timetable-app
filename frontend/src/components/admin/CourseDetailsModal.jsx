import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, Users } from 'lucide-react';
import axios from 'axios';

const CourseDetailsModal = ({ isOpen, onClose, course }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courseData, setCourseData] = useState(null);

    useEffect(() => {
        if (isOpen && course) {
            fetchCourseData();
        }
    }, [isOpen, course]);

    const fetchCourseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = { 
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            };
            
            const response = await axios.get(`http://localhost:3000/api/timetable/course/${encodeURIComponent(course.courseCode)}`, config);
            setCourseData(response.data);
        } catch (err) {
            console.error("Error fetching course details:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const getSlotsByDay = () => {
        if (!courseData || !courseData.slots) return {};
        
        const schedule = {};
        daysOrder.forEach(day => {
            schedule[day] = [];
        });

        courseData.slots.forEach(slot => {
            if (schedule[slot.day]) {
                schedule[slot.day].push(slot);
            }
        });

        Object.keys(schedule).forEach(day => {
            schedule[day].sort((a, b) => a.slotNumber - b.slotNumber);
        });

        return schedule;
    };

    // Helper to get unique sections for the summary
    const uniqueSectionsCount = courseData?.slots 
        ? new Set(courseData.slots.map(s => `${s.program}-${s.semester}-${s.section}`)).size
        : 0;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px 8px 0 0'
                }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={24} color="#0369a1" />
                            Course Schedule: {course?.courseCode} - {course?.courseName}
                        </h2>
                        {course?.department && (
                            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={16} /> Department: {course.department} | Type: {course.courseType}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            Loading schedule...
                        </div>
                    ) : error ? (
                        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
                            {error}
                        </div>
                    ) : !courseData || courseData.slots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>This course isn't currently assigned to any active sections.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Summary Cards */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1, backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>Total Weekly Classes</h4>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{courseData.slots.length} Slots</p>
                                </div>
                                <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Currently Taught In</h4>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{uniqueSectionsCount} Sections</p>
                                </div>
                            </div>

                            {/* Schedule View */}
                            <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#334155' }}>
                                Weekly Master Schedule
                            </h3>
                            
                            {daysOrder.map(day => {
                                const daySlots = getSlotsByDay()[day];
                                if (!daySlots || daySlots.length === 0) return null;

                                return (
                                    <div key={day} style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px' }}>
                                            {day}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                            {daySlots.map((slot, idx) => (
                                                <div key={idx} style={{ 
                                                    border: '1px solid #e2e8f0', 
                                                    padding: '1rem', 
                                                    borderRadius: '6px',
                                                    borderLeft: '4px solid #8b5cf6',
                                                    backgroundColor: 'white'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Slot {slot.slotNumber}</span>
                                                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', backgroundColor: '#ede9fe', color: '#6d28d9', borderRadius: '12px' }}>
                                                            {slot.sessionType}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={16} /> {slot.venue || 'No Venue'}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <Users size={14} /> 
                                                        {slot.department} - {slot.program} {slot.semester} (Sec {slot.section})
                                                    </div>
                                                    {slot.facultyNames && slot.facultyNames.length > 0 && (
                                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                            By: {slot.facultyNames.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal;
