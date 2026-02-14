import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, MapPin, CheckCircle2, XCircle, Search, MoreVertical, Building2, Globe } from 'lucide-react';

const NGOManagement = () => {
    const [ngos, setNgos] = useState([]);
    const [pending, setPending] = useState({ donors: [], volunteers: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNgos();
        fetchPending();
    }, []);

    const fetchNgos = async () => {
        try {
            const res = await axios.get('/admin/ngo/all');
            setNgos(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchPending = async () => {
        try {
            const res = await axios.get('/ngo/pending/all');
            setPending(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const handleApproveNGO = async (id) => {
        try {
            await axios.post(`/admin/ngo/approve/${id}`);
            alert('Organization approved for network access.');
            fetchNgos();
        } catch (err) { alert('Failed to approve organization'); }
    };

    const handleApproveDonor = async (id) => {
        try {
            await axios.post(`/ngo/approve/donor/${id}`);
            alert('Donor approved.');
            fetchPending();
        } catch (err) { alert('Failed to approve donor'); }
    };

    const handleApproveVolunteer = async (id) => {
        try {
            await axios.post(`/ngo/approve/volunteer/${id}`);
            alert('Volunteer approved.');
            fetchPending();
        } catch (err) { alert('Failed to approve volunteer'); }
    };

    if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Governance Console...</div>;

    return (
        <div className="ngo-management fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Regional Oversight Control</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Manage and verify organizational partners and community participants.</p>
                </div>
            </div>

            {/* Pending Requests Section */}
            {(pending.donors.length > 0 || pending.volunteers.length > 0) && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--secondary)', background: 'rgba(79, 70, 229, 0.02)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} color="var(--secondary)" />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Network Access Requests</h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                            {pending.donors.map(d => (
                                <div key={d._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{d.name} (Donor)</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{d.email}</div>
                                    </div>
                                    <button onClick={() => handleApproveDonor(d._id)} className="status-badge badge-delivered" style={{ cursor: 'pointer', border: 'none' }}>Approve</button>
                                </div>
                            ))}
                            {pending.volunteers.map(v => (
                                <div key={v._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{v.name} (Volunteer)</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{v.email}</div>
                                    </div>
                                    <button onClick={() => handleApproveVolunteer(v._id)} className="status-badge badge-delivered" style={{ cursor: 'pointer', border: 'none' }}>Approve</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Registered Organizations</h3>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-600)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.25rem 2rem' }}>Organization</th>
                                <th>Primary Region</th>
                                <th>Operational Focus</th>
                                <th>Coverage</th>
                                <th style={{ paddingRight: '2rem' }}>Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ngos.length > 0 ? ngos.map(ngo => (
                                <tr key={ngo._id} style={{ borderBottom: '1px solid var(--gray-100)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--gray-100)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ngo.organizationName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>ID: {ngo.registrationNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} color="var(--gray-600)" /> {ngo.address}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--dark)', background: 'var(--gray-100)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                                            Primary Shelter Support
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Globe size={14} color="var(--gray-600)" /> {ngo.operatingRadius / 1000}km range
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '2rem' }}>
                                        {ngo.status === 'active' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <CheckCircle2 size={18} color="var(--primary)" />
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Authorized</span>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleApproveNGO(ngo._id)} className="status-badge badge-pending" style={{ border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                                                APPROVE NOW
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-500)' }}>No NGO partners registered.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NGOManagement;
