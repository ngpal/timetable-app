import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FacultySlotEnquiry = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        day: 'Monday',
        timeSlot: '8am - 9am',
        message: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        '8am - 9am',
        '9am - 10am',
        '10am - 11am',
        '11am - 12pm',
        '12pm - 1pm',
        '2pm - 3pm',
        '3pm - 4pm',
        '4pm - 5pm',
        '5pm - 6pm'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        console.log('Enquiry Sent:', formData);
        alert('Enquiry sent successfully to Class Representative!');
        setFormData({ day: 'Monday', timeSlot: '8am - 9am', message: '' });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 100px)', // Adjust height for vertical centering
            width: '100%'
        }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748', textAlign: 'center' }}>Slot Availability Enquiry</h2>

            <div className="form-card" style={{ maxWidth: '500px', width: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="day">Select Day</label>
                        <select
                            id="day"
                            name="day"
                            value={formData.day}
                            onChange={handleChange}
                            required
                        >
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="timeSlot">Select Time Slot</label>
                        <select
                            id="timeSlot"
                            name="timeSlot"
                            value={formData.timeSlot}
                            onChange={handleChange}
                            required
                        >
                            {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message (Optional)</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="e.g., Is this slot free for a makeup class?"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Send Enquiry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacultySlotEnquiry;
