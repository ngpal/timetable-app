import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboardService';
import { getAllCourses } from '../../services/courseService';
import { PieChart, Pie, BarChart, Bar, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Total Faculty', value: '0', subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#4299e1' },
    { title: 'Total Courses', value: '0', subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#48bb78' },
    { title: 'Total Rooms', value: '0', subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#ed8936' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTypeData, setCourseTypeData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  const COLOR_PALETTE = [
    '#4299e1', 
    '#48bb78', 
    '#9f7aea', 
    '#ed8936', 
    '#f56565', 
    '#38b2ac', 
    '#ed64a6', 
    '#ecc94b', 
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
    
      setStats([
        { title: 'Total Faculty', value: String(data.facultyCount), subtitle: 'Active Professors & Lecturers', link: '/admin/faculty', color: '#1E40AF' },
        { title: 'Total Courses', value: String(data.courseCount), subtitle: 'Theory & Labs Offered', link: '/admin/courses', color: '#047857' },
        { title: 'Total Rooms', value: String(data.roomCount), subtitle: 'Classrooms & Labs', link: '/admin/rooms', color: '#B45309' },
      ]);

   
      const courses = await getAllCourses();

      const courseTypeMap = {};
      courses.forEach(course => {
        const type = course.courseType || 'Other';
        courseTypeMap[type] = (courseTypeMap[type] || 0) + 1;
      });


      const courseData = Object.entries(courseTypeMap).map(([name, value], index) => ({
        name,
        value,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length]
      }));

      setCourseTypeData(courseData);


      const departmentMap = {};
      courses.forEach(course => {
        const dept = course.department || 'Not Assigned';
        departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      });

      const deptData = Object.entries(departmentMap)
        .map(([name, value], index) => ({ 
          name, 
          value,
          fill: COLOR_PALETTE[index % COLOR_PALETTE.length]
        }))
        .sort((a, b) => b.value - a.value); 

      setDepartmentData(deptData);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: '#718096', fontSize: '1rem', marginTop: '0.5rem' }}>
            Monitor your institution's resources, courses, and timetable analytics
          </p>
        </div>
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

          {}
          <div style={{ 
            marginTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '2rem'
          }}>
            {}
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#2d3748', fontSize: '1.5rem', fontWeight: '600' }}>Course Type Distribution</h2>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={courseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {courseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '1rem' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {}
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#2d3748', fontSize: '1.5rem', fontWeight: '600' }}>Courses per Department</h2>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
              }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-30}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      style={{ fontSize: '0.9rem', fontWeight: '500' }}
                      tick={{ fill: '#4a5568' }}
                    />
                    <YAxis 
                      style={{ fontSize: '0.85rem' }}
                      tick={{ fill: '#4a5568' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      cursor={{ fill: 'rgba(66, 153, 225, 0.1)' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '1rem' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="value" 
                      name="Courses" 
                      radius={[8, 8, 0, 0]}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminHome;
