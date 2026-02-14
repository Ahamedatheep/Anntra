import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, Users, Heart, Shield, Radio, Activity, ArrowUpRight, MapPin, Search } from 'lucide-react';

const NGODashboard = () => {
    const [stats, setStats] = useState({ donors: 0, volunteers: 0, beneficiaries: 0 });
    const [deliveries, setDeliveries] = useState([]);
    const [pending, setPending] = useState({ donors: [], volunteers: [] });
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        fetchPending();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const profileRes = await axios.get('/ngo/profile');
            setProfile(profileRes.data);

            const deliveriesRes = await axios.get('/ngo/deliveries/local');
            setDeliveries(deliveriesRes.data);

            setStats({
                donors: profileRes.data.approvedDonors?.length || 0,
                volunteers: profileRes.data.approvedVolunteers?.length || 0,
                beneficiaries: profileRes.data.managedBeneficiaries?.length || 0
            });
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const fetchPending = async () => {
        try {
            const res = await axios.get('/ngo/pending/all');
            setPending(res.data);
        } catch (err) { console.error(err); }
    };

    const handleApproveDonor = async (id) => {
        try {
            await axios.post(`/ngo/approve/donor/${id}`);
            alert('Donor verified successfully.');
            fetchPending();
            fetchDashboardData();
        } catch (err) { alert('Approval failed'); }
    };

    const handleApproveVolunteer = async (id) => {
        try {
            await axios.post(`/ngo/approve/volunteer/${id}`);
            alert('Volunteer verified successfully.');
            fetchPending();
            fetchDashboardData();
        } catch (err) { alert('Approval failed'); }
    };

    const handleEmergencyBroadcast = async () => {
        if (deliveries.length === 0) return alert('No active deliveries to broadcast');
        try {
            await axios.post('/ngo/emergency/broadcast', { foodBatchId: deliveries[0]._id });
            alert('Emergency broadcast sent to nearby volunteers!');
        } catch (err) { alert('Failed to send broadcast'); }
    };

    return (
        <div className="ngo-dashboard fade-in">
            {/* NGO Header/Bio */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: 'white',
                marginBottom: '2.5rem',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2.5rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Shield size={32} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{profile?.organizationName || 'NGO Partner'}</h2>
                    </div>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>{profile?.address || 'Regional Oversight Hub'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', textTransform: 'capitalize' }}> {profile?.status || 'Active'} </div>
                </div>
            </div>

            {/* Governance Panel */}
            {(pending.donors.length > 0 || pending.volunteers.length > 0) && (
                <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid var(--secondary)', background: 'rgba(79, 70, 229, 0.02)' }}>
                    <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="var(--secondary)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Governance: Pending Approvals</h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {pending.donors.map(d => (
                                <div key={d._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        <div style={{ fontWeight: 700 }}>{d.name}</div>
                                        <div style={{ color: 'var(--gray-500)' }}>Donor Request</div>
                                    </div>
                                    <button onClick={() => handleApproveDonor(d._id)} className="status-badge badge-delivered" style={{ cursor: 'pointer', border: 'none' }}>Approve</button>
                                </div>
                            ))}
                            {pending.volunteers.map(v => (
                                <div key={v._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        <div style={{ fontWeight: 700 }}>{v.name}</div>
                                        <div style={{ color: 'var(--gray-500)' }}>Volunteer Request</div>
                                    </div>
                                    <button onClick={() => handleApproveVolunteer(v._id)} className="status-badge badge-delivered" style={{ cursor: 'pointer', border: 'none' }}>Approve</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="dashboard-grid">
                <div className="card stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
                    <div className="label">Managed Donors</div>
                    <div className="value">{stats.donors}</div>
                    <button onClick={() => navigate('/ngo')} style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem', cursor: 'pointer' }}>
                        Verify New <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="card stat-card" style={{ borderTop: '4px solid var(--secondary)' }}>
                    <div className="label">Volunteer Network</div>
                    <div className="value">{stats.volunteers}</div>
                    <button onClick={() => navigate('/ngo/volunteers')} style={{ background: 'none', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem', cursor: 'pointer' }}>
                        Manage Zones <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="card stat-card" style={{ borderTop: '4px solid #ec4899' }}>
                    <div className="label">Beneficiary Database</div>
                    <div className="value">{stats.beneficiaries}</div>
                    <button onClick={() => navigate('/ngo/beneficiaries')} style={{ background: 'none', color: '#ec4899', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem', cursor: 'pointer' }}>
                        Enroll Group <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>

            {/* Main Monitoring Section */}
            <div className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#f59e0b', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                            <Radio size={20} />
                        </div>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>District Monitoring System</h3>
                    </div>
                    <div className="user-profile" style={{ padding: '0.5rem 1rem' }}>
                        <Search size={16} /> <span style={{ fontSize: '0.875rem' }}>Search Deliveries...</span>
                    </div>
                </div>

                <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', minHeight: '300px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        <span>Time</span>
                        <span>Partners</span>
                        <span>Volunteer</span>
                        <span>Zonal Info</span>
                        <span>Activity</span>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-600)' }}>Initializing district monitoring...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {deliveries.length > 0 ? deliveries.map(d => (
                                <div key={d._id} className="fade-in" style={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--gray-200)'
                                }}>
                                    <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        <div style={{ fontWeight: 600 }}>{d.donor?.name || 'Local Donor'}</div>
                                        <div style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>→ {d.address || 'Target Shelter'}</div>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{d.assignedVolunteer?.name || 'Unassigned'}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                        <MapPin size={12} /> {d.urgencyLevel || 'Normal'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Activity size={14} color="var(--primary)" />
                                        <span className={`status-badge badge-${d.status}`} style={{ fontSize: '0.7rem' }}>{d.status}</span>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>No active local deliveries found.</div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <button
                            className="btn-primary"
                            style={{ width: 'auto', background: '#dc2626', gap: '0.75rem' }}
                            onClick={handleEmergencyBroadcast}
                        >
                            <Radio size={18} /> INITIALIZE EMERGENCY BROADCAST (3KM)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
