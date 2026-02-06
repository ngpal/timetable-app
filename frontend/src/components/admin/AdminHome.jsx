import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboardService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Total Faculty', value: '0', subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#4299e1' },
    { title: 'Total Courses', value: '0', subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#48bb78' },
    { title: 'Total Rooms', value: '0', subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#ed8936' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      
      // Update stats with real data from backend
      setStats([
        { title: 'Total Faculty', value: String(data.facultyCount), subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#4299e1' },
        { title: 'Total Courses', value: String(data.courseCount), subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#48bb78' },
        { title: 'Total Rooms', value: String(data.roomCount), subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#ed8936' },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00',
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Loading dashboard statistics...
        </div>
      ) : (
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
      )}

    </div>
  );
};

export default AdminHome;
