import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Users, MapPin, Search, Filter, Plus, ChevronRight } from 'lucide-react';

const NGOBeneficiaries = () => {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', familySize: '' });

    useEffect(() => {
        fetchBeneficiaries();
    }, []);

    const fetchBeneficiaries = async () => {
        try {
            const res = await axios.get('/ngo/beneficiaries');
            setBeneficiaries(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            // In a real app, you'd register the user FIRST or have a combined endpoint.
            // For this flow, we'll use a mocked "userId" strategy or the backend handles user creation.
            // Assuming backend /beneficiary/add handles both or links existing.
            await axios.post('/ngo/beneficiary/add', {
                ...formData,
                coordinates: [80.2 + Math.random() * 0.1, 13.0 + Math.random() * 0.1]
            });
            alert('Beneficiary group enrolled successfully!');
            setShowEnrollModal(false);
            fetchBeneficiaries();
        } catch (err) { alert('Enrollment failed. Ensure user exists or system is online.'); }
    };

    return (
        <div className="ngo-beneficiaries fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Beneficiary Database</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Manage community outreach and track support distribution.</p>
                </div>
                <button onClick={() => setShowEnrollModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', gap: '0.75rem' }}>
                    <Plus size={18} /> Enroll New Group
                </button>
            </div>

            {showEnrollModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Enroll Community Group</h3>
                        <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Name / Organization</label>
                                <input className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Representative Email</label>
                                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>Phone</label>
                                    <input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label>Group Size</label>
                                    <input type="number" className="form-control" value={formData.familySize} onChange={e => setFormData({ ...formData, familySize: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Primary Address</label>
                                <input className="form-control" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowEnrollModal(false)} className="btn-secondary" style={{ background: 'var(--gray-200)', color: 'var(--dark)' }}>Cancel</button>
                                <button type="submit" className="btn-primary">Confirm Enrollment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <Search size={18} color="var(--gray-400)" />
                        <input
                            type="text"
                            placeholder="Search by name, address or family ID..."
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--gray-200)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                <th style={{ padding: '1.25rem 2rem' }}>Beneficiary</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Contact Info</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Family Size</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Primary Location</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Status</th>
                                <th style={{ padding: '1.25rem 2rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-500)' }}>Syncing beneficiary data...</td>
                                </tr>
                            ) : beneficiaries.length > 0 ? beneficiaries.map(b => (
                                <tr key={b._id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s', cursor: 'pointer' }} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {b.user?.name?.charAt(0) || 'B'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{b.user?.name || 'Local Resident'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID: {b._id.substring(b._id.length - 8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ fontSize: '0.875rem' }}>{b.user?.phone || 'No phone'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Users size={16} color="var(--gray-400)" />
                                            <span style={{ fontWeight: 600 }}>{b.familySize || 1}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <MapPin size={16} color="var(--gray-400)" />
                                            {b.address || 'Chennai Central'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <span className={`status-badge ${b.status === 'active' ? 'badge-delivered' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                        <ChevronRight size={18} color="var(--gray-300)" />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                        <Heart size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p>No beneficiaries enrolled yet. Use the button above to add someone.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NGOBeneficiaries;
