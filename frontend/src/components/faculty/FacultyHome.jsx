import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  BookOpen, Clock, CalendarCheck, AlertCircle, ArrowRight,
  Loader2, MapPin, GraduationCap, ClipboardList, TrendingUp
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
const HEATMAP_COLORS = ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'];

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
    className="modern-card"
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>{title}</p>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--text-main)' }}>{value}</h2>
        {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{
        background: `${color}15`, borderRadius: '12px', padding: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    {onClick && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem', fontSize: '0.8rem', color, fontWeight: 500 }}>
        View details <ArrowRight size={14} />
      </div>
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
    <div style={{
      background: `${color}15`, borderRadius: '10px', padding: '0.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={20} color={color} />
    </div>
    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
  </div>
);

// --- Main Component ---

const FacultyHome = () => {
  const navigate = useNavigate();
  const { userName } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch timetable and requests in parallel
        const [timetableRes, requestsRes] = await Promise.all([
          fetch('/api/timetable/my-timetable', { credentials: 'include' }),
          fetch('/api/slot-change-requests', { credentials: 'include' }).catch(() => null)
        ]);

        if (timetableRes.ok) {
          const data = await timetableRes.json();
          setTimetableData(data);
        }

        if (requestsRes && requestsRes.ok) {
          const reqData = await requestsRes.json();
          const requests = reqData.requests || reqData || [];
          const pending = Array.isArray(requests)
            ? requests.filter(r => r.status === 'Pending_Faculty')
            : [];
          setPendingRequests(pending);
        }

        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)' }}>Loading faculty dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#991b1b' }}>
          <AlertCircle size={32} />
          <div>
            <h3 style={{ margin: 0 }}>Error loading dashboard</h3>
            <p style={{ margin: '0.25rem 0 0 0' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Compute derived data
  const slots = timetableData?.slots || [];
  const courses = timetableData?.courses || [];
  const facultyName = timetableData?.facultyName || userName;
  const department = timetableData?.department || '';
  const designation = timetableData?.designation || '';

  // Filter out continuation slots for counting
  const realSlots = slots.filter(s => !s.isSpanContinuation);
  const totalWeeklyHours = realSlots.length;

  // Today's schedule
  const todayName = days[new Date().getDay() - 1] || 'Monday';
  const todaySlots = realSlots
    .filter(s => s.day === todayName)
    .sort((a, b) => a.slotNumber - b.slotNumber);

  // Current hour to highlight active class
  const currentHour = new Date().getHours();
  const currentSlotNumber = currentHour >= 8 && currentHour < 17 ? currentHour - 7 : -1;

  // Build heatmap data (day × slot)
  const heatmapData = {};
  for (const day of days) heatmapData[day] = {};
  for (const s of realSlots) {
    heatmapData[s.day] = heatmapData[s.day] || {};
    heatmapData[s.day][s.slotNumber] = (heatmapData[s.day][s.slotNumber] || 0) + 1;
  }

  // Courses with hours
  const courseHours = {};
  for (const s of realSlots) {
    courseHours[s.courseCode] = (courseHours[s.courseCode] || 0) + 1;
  }
  const courseChartData = courses.map(c => ({
    name: c.courseCode,
    fullName: c.courseName,
    hours: courseHours[c.courseCode] || 0,
    credits: c.credits,
    role: c.role
  })).sort((a, b) => b.hours - a.hours);

  // Slots per day chart
  const dayChartData = days.map(day => ({
    name: day.substring(0, 3),
    fullName: day,
    classes: realSlots.filter(s => s.day === day).length
  }));

  // Sections the faculty teaches
  const sectionsSet = new Set(realSlots.map(s => `${s.department} ${s.section}`));

  return (
    <div className="dashboard-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          Faculty Dashboard
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Welcome back, <strong>{facultyName}</strong>
          {designation && <> · {designation}</>}
          {department && <> · {department}</>}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          icon={BookOpen}
          title="Courses Teaching"
          value={courses.length}
          subtitle={`${sectionsSet.size} section${sectionsSet.size !== 1 ? 's' : ''}`}
          color="#3b82f6"
          onClick={() => navigate('/faculty/timetable')}
        />
        <StatCard
          icon={Clock}
          title="Weekly Hours"
          value={totalWeeklyHours}
          subtitle={`~${(totalWeeklyHours / 5).toFixed(1)} hrs/day avg`}
          color="#10b981"
          onClick={() => navigate('/faculty/timetable')}
        />
        <StatCard
          icon={CalendarCheck}
          title="Today's Classes"
          value={todaySlots.length}
          subtitle={todayName}
          color="#8b5cf6"
        />
        <StatCard
          icon={ClipboardList}
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your review"
          color={pendingRequests.length > 0 ? '#f59e0b' : '#10b981'}
          onClick={() => navigate('/faculty/requests')}
        />
      </div>

      {/* Row: Today's Schedule + Weekly Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '1.5rem' }}>

        {/* Today's Schedule */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader icon={CalendarCheck} title={`Today — ${todayName}`} color="#8b5cf6" />
          {todaySlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <CalendarCheck size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>No classes scheduled today!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todaySlots.map((slot, i) => {
                const isActive = slot.slotNumber === currentSlotNumber;
                const isPast = slot.slotNumber < currentSlotNumber;
                const course = courses.find(c => c.courseCode === slot.courseCode);
                return (
                  <div key={i} style={{
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    padding: '0.75rem', borderRadius: '10px',
                    background: isActive ? '#ede9fe' : isPast ? 'var(--surface)' : 'var(--card-bg)',
                    border: isActive ? '2px solid #8b5cf6' : '1px solid var(--border-light)',
                    opacity: isPast ? 0.6 : 1, transition: 'var(--transition)'
                  }}>
                    <div style={{
                      minWidth: '52px', textAlign: 'center', padding: '0.25rem 0',
                      borderRight: '2px solid var(--border-light)', paddingRight: '0.75rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {slotTimes[slot.slotNumber - 1]?.split('-')[0]}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {slotTimes[slot.slotNumber - 1]?.split('-')[1]}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {slot.courseCode}
                        {isActive && <span style={{ fontSize: '0.7rem', background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>NOW</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {course?.courseName || ''} · {slot.sessionType || 'Theory'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> {slot.venue || '—'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                        {slot.section || ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Heatmap */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader icon={TrendingUp} title="Weekly Schedule Heatmap" color="#10b981" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.4rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'left' }}>Day</th>
                  {slotTimes.map((t, i) => (
                    <th key={i} style={{ padding: '0.3rem', color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.65rem', textAlign: 'center' }}>
                      {t.split('-')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day}>
                    <td style={{ padding: '0.4rem', fontWeight: 500, color: day === todayName ? '#8b5cf6' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {day.substring(0, 3)}
                    </td>
                    {Array.from({ length: 9 }, (_, i) => {
                      const slotNum = i + 1;
                      const count = heatmapData[day]?.[slotNum] || 0;
                      const isLunch = slotNum === 5;
                      const colorIdx = Math.min(count, HEATMAP_COLORS.length - 1);
                      const matchingSlot = realSlots.find(s => s.day === day && s.slotNumber === slotNum);
                      return (
                        <td key={i} title={matchingSlot ? `${matchingSlot.courseCode} — ${matchingSlot.venue || ''}` : isLunch ? 'Lunch Break' : 'Free'}
                          style={{
                            width: '40px', height: '32px', textAlign: 'center',
                            borderRadius: '4px', fontSize: '0.65rem',
                            background: isLunch ? '#fef3c7' : count > 0 ? HEATMAP_COLORS[colorIdx] : 'var(--surface)',
                            color: isLunch ? '#92400e' : count > 0 ? '#166534' : 'var(--text-muted)',
                            fontWeight: count > 0 ? 600 : 400,
                            border: (day === todayName && slotNum === currentSlotNumber) ? '2px solid #8b5cf6' : '1px solid var(--border-light)'
                          }}>
                          {isLunch ? '🍽' : matchingSlot ? matchingSlot.courseCode.slice(-3) : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Free</span>
            {HEATMAP_COLORS.slice(0, 4).map((c, i) => (
              <div key={i} style={{ width: '16px', height: '16px', borderRadius: '3px', background: c, border: '1px solid var(--border-light)' }} />
            ))}
            <span>Busy</span>
          </div>
        </div>
      </div>

      {/* Row: Course Breakdown + Daily Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Course Breakdown */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader icon={GraduationCap} title="Course Workload" color="#3b82f6" />
          {courseChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={courseChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={70} />
                  <Tooltip
                    formatter={(value) => [`${value} hrs/week`, 'Hours']}
                    labelFormatter={(label) => {
                      const c = courseChartData.find(x => x.name === label);
                      return c ? `${c.name} — ${c.fullName}` : label;
                    }}
                  />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                    {courseChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {courseChartData.map((c, i) => (
                  <div key={i} style={{
                    fontSize: '0.7rem', padding: '0.25rem 0.5rem',
                    background: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length],
                    borderRadius: '6px', fontWeight: 500
                  }}>
                    {c.name} · {c.credits} cr · {c.role}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No courses assigned yet</p>
          )}
        </div>

        {/* Daily Distribution */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader icon={Clock} title="Classes per Day" color="#f59e0b" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} classes`, 'Count']}
                labelFormatter={(label) => {
                  const d = dayChartData.find(x => x.name === label);
                  return d ? d.fullName : label;
                }}
              />
              <Bar dataKey="classes" radius={[4, 4, 0, 0]}>
                {dayChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fullName === todayName ? '#8b5cf6' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#8b5cf6', marginRight: '4px' }} />Today</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6', marginRight: '4px' }} />Other days</span>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeader icon={ClipboardList} title={`Pending Rescheduling Requests (${pendingRequests.length})`} color="#f59e0b" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.slice(0, 5).map((req, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-light)',
                background: 'var(--surface)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {req.courseCode} — {req.courseName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {req.currentDay} Slot {req.currentSlotNumber} → {req.requestedDay} Slot {req.requestedSlotNumber}
                    {req.reason && <> · "{req.reason.substring(0, 50)}{req.reason.length > 50 ? '...' : ''}"</>}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e',
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap'
                }}>
                  Awaiting Review
                </div>
              </div>
            ))}
            {pendingRequests.length > 5 && (
              <button
                onClick={() => navigate('/faculty/requests')}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '0.5rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500,
                  fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                View all {pendingRequests.length} requests <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyHome;
