import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Zap, Clock, ShieldCheck, TrendingUp, ChevronRight, BarChart3, Star } from 'lucide-react';

const VolunteerStats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/volunteer/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching volunteer stats:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-600)' }}>Calculating performance metrics...</div>;

    return (
        <div className="volunteer-stats fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Pilot Performance</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Track your reliability, impact, and mission efficiency across the network.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(to right, #fef3c7, #fff)', border: '1px solid #fcd34d', borderRadius: '12px' }}>
                    <Award size={20} color="#b45309" />
                    <span style={{ fontWeight: 700, color: '#92400e' }}>Level {stats?.tier === 1 ? 'Master Pilot' : stats?.tier === 2 ? 'Senior Pilot' : 'Rising Star'}</span>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
                <div className="card stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
                    <div className="label">Reliability Score</div>
                    <div className="value">{stats?.reliabilityScore || 100}%</div>
                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'var(--gray-100)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${stats?.reliabilityScore || 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                </div>
                <div className="card stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
                    <div className="label">Total Missions</div>
                    <div className="value">{stats?.completedDeliveries || 0}</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>Top 15% in your region</p>
                </div>
                <div className="card stat-card" style={{ borderTop: '4px solid #ec4899' }}>
                    <div className="label">Meals Scaled</div>
                    <div className="value">{Math.floor((stats?.completedDeliveries || 0) * 45)}</div>
                    <div className="trend up"><TrendingUp size={14} /> +8% intensity</div>
                </div>
                <div className="card stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div className="label">Current Tier</div>
                    <div className="value">Tier {stats?.tier || 3}</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>Next tier: {(stats?.completedDeliveries || 0) % 50}/50 trips</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Efficiency Analytics</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { label: 'Avg. Pickup Time', val: '12 mins', sub: 'Faster than 80% of pilots', icon: <Clock size={16} /> },
                            { label: 'System Compliance', val: '100%', sub: 'Zero safety incidents reported', icon: <ShieldCheck size={16} /> },
                            { label: 'Response Rate', val: '94%', sub: 'Active in 18/20 broadcasts', icon: <Zap size={16} /> },
                        ].map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ color: 'var(--primary)' }}>{m.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{m.sub}</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{m.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', background: 'var(--dark)', color: 'white', border: 'none' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Star size={20} color="#fcd34d" fill="#fcd34d" /> Achievement Roadmap
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {[
                            { title: 'Night Owl', desc: 'Complete 3 rescues between 10 PM - 3 AM', progress: 66, color: '#818cf8' },
                            { title: 'Zero Waste Hero', desc: 'Save 1000kg of food in total', progress: 42, color: '#34d399' },
                            { title: 'Community Pillar', desc: 'Maintain 95%+ reliability for 3 months', progress: 85, color: '#fb923c' },
                        ].map((a, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: 600 }}>{a.title}</span>
                                    <span style={{ opacity: 0.7 }}>{a.progress}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                    <div style={{ width: `${a.progress}%`, height: '100%', background: a.color, borderRadius: '2px', boxShadow: `0 0 10px ${a.color}50` }}></div>
                                </div>
                                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerStats;
