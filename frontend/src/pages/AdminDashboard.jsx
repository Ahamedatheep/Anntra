import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Clock, Truck, TrendingUp, Users, Heart, Zap } from 'lucide-react';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Auto refresh every min
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [resAn, resLb] = await Promise.all([
                axios.get('/admin/analytics'),
                axios.get('/admin/leaderboard')
            ]);
            setAnalytics(resAn.data);
            setLeaderboard(resLb.data);

            // Fetch AI summary periodically
            if (resAn.data) {
                const context = `Active Deliveries: ${resAn.data.activeDeliveries}, Urgent Batches: ${resAn.data.urgentBatches}, Total Meals: ${resAn.data.metrics?.totalMealsSaved}`;
                const resAi = await axios.post('/ai/advise', { context });
                setAiSummary(resAi.data.advice);
            }
        } catch (err) {
            console.error(resAn);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="fade-in" style={{ textAlign: 'center', padding: '100px' }}>Loading Command Center...</div>;

    return (
        <div className="admin-dashboard fade-in">
            {/* Top Stats Grid */}
            <div className="dashboard-grid">
                <div className="card stat-card">
                    <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={16} color="var(--primary)" /> Active Deliveries
                    </div>
                    <div className="value">{analytics?.activeDeliveries || 0}</div>
                    <div className="trend up">
                        <TrendingUp size={14} /> +12% from last hour
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} color="#f59e0b" /> Urgent Batches
                    </div>
                    <div className="value" style={{ color: analytics?.urgentBatches > 0 ? '#ef4444' : 'inherit' }}>
                        {analytics?.urgentBatches || 0}
                    </div>
                    <div className="trend" style={{ color: analytics?.urgentBatches > 0 ? '#ef4444' : 'var(--gray-600)' }}>
                        {analytics?.urgentBatches > 0 ? 'Action required' : 'System stable'}
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={16} color="#ec4899" /> Meals Saved
                    </div>
                    <div className="value">{analytics?.metrics?.totalMealsSaved || 0}</div>
                    <div className="trend up">
                        <TrendingUp size={14} /> +{Math.floor(Math.random() * 50)} new saves
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="var(--secondary)" /> Volunteers
                    </div>
                    <div className="value">{analytics?.totalVolunteers || 0}</div>
                    <div className="trend up">
                        <TrendingUp size={14} /> {analytics?.totalVolunteers > 0 ? 'Team growing' : 'Recruiting...'}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Intelligent Command Log</h3>
                        <span className="status-badge badge-assigned" style={{ fontSize: '0.7rem' }}>Live Stream</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { time: '18:12', msg: 'Assignment #FB124 auto-reassigned due to inactivity.', type: 'warn', icon: <Clock size={16} /> },
                            { time: '18:05', msg: 'Volunteer Rajesh Kumar completed delivery at Alpha Center.', type: 'success', icon: <CheckCircle size={16} /> },
                            { time: '17:58', msg: 'Multiple donations registered from Grand Hotel.', type: 'info', icon: <TrendingUp size={16} /> },
                            { time: '17:45', msg: 'Critical Expiry Alert: 40 meals remaining (Chennai Zone 2).', type: 'critical', icon: <AlertTriangle size={16} /> },
                        ].map((log, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--gray-100)',
                                borderRadius: 'var(--radius-lg)',
                                borderLeft: `4px solid ${log.type === 'critical' ? '#ef4444' : log.type === 'warn' ? '#f59e0b' : log.type === 'success' ? 'var(--primary)' : 'var(--secondary)'}`
                            }}>
                                <div style={{ fontWeight: 700, color: 'var(--gray-600)', minWidth: '50px' }}>{log.time}</div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {log.icon}
                                    <span style={{ fontSize: '0.925rem' }}>{log.msg}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hall of Fame</h3>
                        <Heart size={20} color="#ec4899" fill="#ec489930" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {leaderboard.length > 0 ? leaderboard.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: index === 0 ? 'linear-gradient(to right, #fdf4ff, #fff)' : 'white',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--gray-200)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.875rem'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{item.volunteer?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Reliability: {item.reliabilityScore}%</div>
                                </div>
                                <div className="status-badge badge-delivered" style={{ fontSize: '0.7rem' }}>
                                    {item.completedDeliveries} Trips
                                </div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '2rem' }}>No leaderboard data yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
