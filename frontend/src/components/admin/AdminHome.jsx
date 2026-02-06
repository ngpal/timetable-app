import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboardService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Total Faculty', value: '0', subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#4299e1' },
    { title: 'Total Courses', value: '0', subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#48bb78' },
    { title: 'Total Rooms', value: '0', subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#ed8936' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

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

      // Prepare chart data
      setChartData([
        { name: 'Faculty', count: data.facultyCount, color: '#4299e1' },
        { name: 'Courses', count: data.courseCount, color: '#48bb78' },
        { name: 'Rooms', count: data.roomCount, color: '#ed8936' },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4299e1', '#48bb78', '#ed8936'];

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
        <>
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

          {/* Charts Section */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem' 
          }}>
            {/* Bar Chart */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Resource Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4299e1" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Resource Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminHome;
