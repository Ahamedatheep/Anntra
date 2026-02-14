import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, CheckCircle2, XCircle, Search, Filter, Award, Zap } from 'lucide-react';

const NGOVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const res = await axios.get('/ngo/volunteers');
                setVolunteers(res.data);
            } catch (err) {
                console.error('Error fetching volunteers:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVolunteers();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axios.post(`/ngo/approve/volunteer/${id}`);
            alert('Volunteer approved!');
            // Refresh list
            const res = await axios.get('/ngo/volunteers');
            setVolunteers(res.data);
        } catch (err) {
            alert('Failed to approve volunteer');
        }
    };

    return (
        <div className="ngo-volunteers fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Volunteer Management</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Review reliability scores and manage zonal assignments.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="user-profile" style={{ padding: '0.6rem 1rem' }}>
                        <Search size={18} />
                        <input type="text" placeholder="Search by name..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {volunteers.length > 0 ? volunteers.map(v => (
                    <div key={v._id} className="card scale-in" style={{ padding: '2rem', border: v.status === 'pending' ? '2px dashed var(--gray-300)' : '1px solid var(--gray-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1.5rem', fontWeight: 700 }}>
                                {(v.name || v.username || '?').charAt(0)}
                            </div>
                            <span className={`status-badge ${v.stats?.tier === 1 ? 'badge-delivered' : v.stats?.tier === 2 ? 'badge-assigned' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                                Tier {v.stats?.tier || 3}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{v.name || v.username}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem' }}>{v.email}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>Reliability</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (v.stats?.reliabilityScore || 0) > 90 ? 'var(--primary)' : 'var(--dark)' }}>{v.stats?.reliabilityScore || 100}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>Trips</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{v.stats?.completedDeliveries || 0}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {v.status === 'active' ? (
                                <>
                                    <button className="btn-secondary" style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem', border: '1px solid var(--gray-200)', background: 'white', color: 'var(--dark)' }}>Edit Zone</button>
                                    <button className="btn-primary" style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem', background: '#ef4444' }}>Suspend</button>
                                </>
                            ) : (
                                <button onClick={() => handleApprove(v._id)} className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>Approve Onboarding</button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)', gridColumn: '1 / -1' }}>
                        No volunteers managed under your organization yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NGOVolunteers;
