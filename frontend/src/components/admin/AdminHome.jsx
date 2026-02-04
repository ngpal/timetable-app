import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Faculty', value: '24', subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#4299e1' },
    { title: 'Total Courses', value: '18', subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#48bb78' },
    { title: 'Total Rooms', value: '12', subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#ed8936' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card" 
            onClick={() => navigate(stat.link)}
            style={{ borderTop: `4px solid ${stat.color}` }}
          >
            <h3>{stat.title}</h3>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-subtitle">{stat.subtitle}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminHome;
