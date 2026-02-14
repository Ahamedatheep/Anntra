import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Target, Zap, Waves, Activity } from 'lucide-react';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/admin/analytics');
                setAnalytics(res.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)' }}>Aggregating system-wide intelligence...</div>;

    return (
        <div className="admin-analytics fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Network Intelligence</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Strategic oversight and real-time impact analytics for the rescue ecosystem.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ width: 'auto', background: 'white', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}>
                        Generate Report
                    </button>
                    <button className="btn-primary" style={{ width: 'auto' }}>
                        Export Data
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Activity size={24} color="var(--primary)" />
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Rescue Intensity (24h)</h3>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Auto-syncing...</span>
                    </div>
                    {/* Simulated Chart Logic */}
                    <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '0 1rem' }}>
                        {[40, 65, 45, 90, 75, 55, 80, 100, 85, 70, 95, 60].map((val, i) => (
                            <div key={i} style={{ flex: 1, position: 'relative' }}>
                                <div style={{ height: `${val}%`, width: '100%', background: i === 7 ? 'var(--primary)' : 'var(--gray-200)', borderRadius: '6px 6px 0 0', transition: 'height 1s ease-out' }}></div>
                                <div style={{ textAlign: 'center', fontSize: '0.6rem', marginTop: '0.5rem', fontWeight: 600, color: 'var(--gray-500)' }}>{i * 2}h</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PieChart size={20} color="var(--secondary)" /> Distribution Mix
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { label: 'Hot Meals', val: '62%', color: 'var(--primary)' },
                            { label: 'Dry Goods', val: '22%', color: 'var(--secondary)' },
                            { label: 'Bakery', val: '16%', color: '#f59e0b' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <span>{item.label}</span>
                                    <span>{item.val}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px' }}>
                                    <div style={{ width: item.val, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>SYSTEM STABILITY</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>99.98%</div>
                    <div style={{ color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                        <TrendingUp size={14} /> Critical redundancy active
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>AVG. RESPONSE TIME</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>4.2 min</div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                        <Zap size={14} /> Optimized routing active
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>CARBON OFFSET</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>824 Tons</div>
                    <div style={{ color: '#ef4444', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                        <Target size={14} /> Surpassing Q1 goals
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
