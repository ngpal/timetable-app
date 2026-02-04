import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

const StudentHome = () => {
    const { isCR, userName } = useOutletContext();
    const navigate = useNavigate();

    return (
        <div>
            <div className="page-header">
                <h1>{isCR ? 'Class Representative Dashboard' : 'Student Dashboard'}</h1>
            </div>

            <div className="stats-grid">
    

                <div className="stat-card" style={{ borderTop: '4px solid #38a169' }}>
                    <h3>Attendance</h3>
                    <div className="stat-value" style={{ color: '#276749' }}>85%</div>
                    <div className="stat-subtitle">Overall Attendance</div>
                </div>

                {isCR && (
                    <div className="stat-card" onClick={() => navigate('/student/reschedule')} style={{ borderTop: '4px solid #d69e2e' }}>
                        <h3>Request Stats</h3>
                        <div className="stat-value" style={{ color: '#d69e2e' }}>3 Total</div>
                        <div className="stat-subtitle">2 Pending | 1 Approved</div>
                    </div>
                )}
            </div>
{/* 
            <div className="recent-activity">
                <h3>Notices & Updates</h3>
                {isCR && (
                     <div className="status-item" style={{backgroundColor: '#fffaf0', padding: '1rem', borderLeft: '4px solid #d69e2e'}}>
                        <strong>CR Notice:</strong> Please collect the assignment submissions for Data Structures by Friday.
                    </div>
                )}
                <div className="status-item">
                    <span className="status-dot warning"></span>
                    <strong>Timetable Update:</strong> Tomorrow's 9 AM Theory class moved to 10 AM.
                </div>
                 <div className="status-item">
                    <span className="status-dot healthy"></span>
                    <strong>Exam Schedule:</strong> Mid-terms starting from next Monday.
                </div>
            </div>
        </div>
    );
}; */}  
        </div>
    );
};

export default StudentHome;
