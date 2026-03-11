import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboardService';
import {
  PieChart, Pie, BarChart, Bar, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Users, BookOpen, Building2, CalendarCheck, Clock, AlertCircle,
  TrendingUp, ArrowRight, Loader2, BarChart3, GraduationCap, DoorOpen
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
const HEATMAP_COLORS = ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const slotTimes = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

// --- Sub-components ---

const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
      padding: '1.5rem', cursor: onClick ? 'pointer' : 'default',
      boxShadow: 'var(--shadow-md)', transition: 'var(--transition)',
      borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1 }}>{value}</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '0.4rem' }}>{subtitle}</p>
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    {onClick && (
      <div style={{ position: 'absolute', bottom: 12, right: 16, color: 'var(--text-light)' }}>
        <ArrowRight size={16} />
      </div>
    )}
  </div>
);

const ChartCard = ({ title, icon: Icon, children, style = {} }) => (
  <div style={{
    background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
    padding: '1.5rem', boxShadow: 'var(--shadow-md)', ...style
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
      {Icon && <Icon size={18} color="var(--primary)" />}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const HeatmapCell = ({ value, maxValue }) => {
  const intensity = maxValue > 0 ? Math.min(Math.floor((value / maxValue) * 7), 7) : 0;
  const bg = value === 0 ? 'var(--surface-hover)' : HEATMAP_COLORS[intensity];
  const textColor = intensity >= 5 ? '#fff' : 'var(--text-main)';
  return (
    <td style={{
      background: bg, color: textColor, textAlign: 'center', padding: '0.5rem 0.35rem',
      fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px', minWidth: 48,
      transition: 'all 0.2s'
    }}>
      {value || '—'}
    </td>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    'Pending_Faculty': { bg: '#fef3c7', color: '#92400e', label: 'Faculty Review' },
    'Pending_Admin': { bg: '#dbeafe', color: '#1e40af', label: 'Admin Review' },
    'Approved': { bg: '#dcfce7', color: '#166534', label: 'Approved' },
    'Rejected': { bg: '#fef2f2', color: '#991b1b', label: 'Rejected' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
      fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color
    }}>{s.label}</span>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem',
      boxShadow: 'var(--shadow-lg)', fontSize: '0.85rem'
    }}>
      <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{payload[0].name || payload[0].payload?.name}</p>
      <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{payload[0].value}</p>
    </div>
  );
};

// --- Main Component ---

const AdminHome = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardStats();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '0.75rem', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '1.1rem' }}>Loading dashboard analytics...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-lg)', margin: '2rem' }}>
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  // Compute heatmap max for scaling
  const heatmapMax = Math.max(
    1,
    ...days.flatMap(d => Array.from({ length: 9 }, (_, i) => data.slotHeatmap?.[d]?.[i + 1] || 0))
  );

  // Prepare area chart data for requests (by status)
  const requestStatusMap = {};
  (data.requestsByStatus || []).forEach(r => { requestStatusMap[r.name] = r.value; });

  return (
    <div className="dashboard-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Dashboard Analytics</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          Real-time overview of your institution's timetable system
        </p>
      </div>

      {/* 1. Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Users} title="Total Faculty" value={data.facultyCount} subtitle="Across all departments" color="#3b82f6" onClick={() => navigate('/admin/faculty')} />
        <StatCard icon={BookOpen} title="Total Courses" value={data.courseCount} subtitle="Theory & Labs" color="#10b981" onClick={() => navigate('/admin/courses')} />
        <StatCard icon={DoorOpen} title="Total Rooms" value={data.roomCount} subtitle="Classrooms & Labs" color="#f59e0b" onClick={() => navigate('/admin/rooms')} />
        <StatCard icon={CalendarCheck} title="Timetables" value={data.timetableCount} subtitle="Active assignments" color="#8b5cf6" onClick={() => navigate('/admin/timetable')} />
        <StatCard icon={Clock} title="Pending Requests" value={data.pendingRequests} subtitle="Awaiting approval" color={data.pendingRequests > 0 ? '#ef4444' : '#10b981'} onClick={() => navigate('/admin/slot-requests')} />
      </div>

      {/* 2. Timetable Heatmap */}
      <ChartCard title="Timetable Slot Utilization" icon={BarChart3} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <strong>{data.totalSlotsUsed}</strong> total slots scheduled
          </span>
          {data.busiestDay && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Busiest day: <strong>{data.busiestDay}</strong>
            </span>
          )}
          {data.busiestSlot > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Peak slot: <strong>Slot {data.busiestSlot}</strong> ({slotTimes[data.busiestSlot - 1]})
            </span>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Day</th>
                {slotTimes.map((t, i) => (
                  <th key={i} style={{ textAlign: 'center', padding: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{ padding: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{day}</td>
                  {Array.from({ length: 9 }, (_, i) => (
                    <HeatmapCell key={i} value={data.slotHeatmap?.[day]?.[i + 1] || 0} maxValue={heatmapMax} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-light)' }}>
          <span>Less</span>
          {HEATMAP_COLORS.slice(0, 6).map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, background: c, borderRadius: 2, border: '1px solid var(--border-light)' }} />
          ))}
          <span>More</span>
        </div>
      </ChartCard>

      {/* 3. Faculty & Course Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Faculty by Department */}
        <ChartCard title="Faculty by Department" icon={Users}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.facultyByDept} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
              <XAxis type="number" style={{ fontSize: '0.78rem' }} />
              <YAxis type="category" dataKey="name" width={50} style={{ fontSize: '0.82rem', fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Faculty" radius={[0, 6, 6, 0]}>
                {(data.facultyByDept || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Course Type Distribution */}
        <ChartCard title="Course Type Distribution" icon={BookOpen}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.coursesByType}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: '0.75rem' }}
              >
                {(data.coursesByType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 4. Department Workload + Room Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Department Workload */}
        <ChartCard title="Department Workload" icon={TrendingUp}>
          {(data.departmentWorkload || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.departmentWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="department" style={{ fontSize: '0.82rem', fontWeight: 500 }} />
                <YAxis style={{ fontSize: '0.78rem' }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.7rem', boxShadow: 'var(--shadow-lg)', fontSize: '0.82rem' }}>
                      <p style={{ fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>{d.department}</p>
                      <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)' }}>{d.sections} sections · {d.totalSlots} slots</p>
                      <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)' }}>~{d.avgSlotsPerSection} slots/section</p>
                    </div>
                  );
                }} />
                <Bar dataKey="totalSlots" name="Total Slots" radius={[6, 6, 0, 0]}>
                  {(data.departmentWorkload || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No timetable data available yet</p>
          )}
        </ChartCard>

        {/* Room by Type + Faculty Type */}
        <ChartCard title="Infrastructure Overview" icon={Building2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Room types */}
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rooms by Type</h4>
              {(data.roomsByType || []).map((room, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{room.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{room.value}</span>
                </div>
              ))}
              {data.capacityStats && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Total capacity: <strong>{Math.round(data.capacityStats.totalCapacity)}</strong> · Avg: <strong>{Math.round(data.capacityStats.avgCapacity)}</strong>
                </div>
              )}
            </div>
            {/* Faculty types */}
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faculty Types</h4>
              {(data.facultyByType || []).map((ft, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[(i + 4) % COLORS.length] }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{ft.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{ft.value}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {(data.facultyByDesignation || []).map(d => d.name).slice(0, 3).join(', ')}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 5. Courses by Department + Credit Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <ChartCard title="Courses by Department" icon={GraduationCap}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.coursesByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="name" style={{ fontSize: '0.82rem', fontWeight: 500 }} />
              <YAxis style={{ fontSize: '0.78rem' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Courses" radius={[6, 6, 0, 0]}>
                {(data.coursesByDept || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Slot Change Requests */}
        <ChartCard title="Slot Change Requests" icon={Clock}>
          {/* Status summary */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { key: 'Pending_Faculty', label: 'Faculty Review', color: '#f59e0b' },
              { key: 'Pending_Admin', label: 'Admin Review', color: '#3b82f6' },
              { key: 'Approved', label: 'Approved', color: '#10b981' },
              { key: 'Rejected', label: 'Rejected', color: '#ef4444' }
            ].map(s => (
              <div key={s.key} style={{
                flex: '1 1 calc(50% - 0.5rem)', padding: '0.6rem',
                background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${s.color}`, minWidth: 120
              }}>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {requestStatusMap[s.key] || 0}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent requests list */}
          {(data.recentRequests || []).length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Activity</h4>
              {data.recentRequests.slice(0, 4).map((req, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>{req.courseCode}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      {req.currentDay} S{req.currentSlotNumber} → {req.requestedDay} S{req.requestedSlotNumber}
                    </span>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminHome;
