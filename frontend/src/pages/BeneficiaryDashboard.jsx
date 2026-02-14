import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Package, Clock, MapPin, Star, MessageSquare } from 'lucide-react';

const BeneficiaryDashboard = () => {
    const [history, setHistory] = useState([]);
    const [available, setAvailable] = useState([]);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchAvailableFood();
    }, []);

    const fetchData = async () => {
        try {
            const profileRes = await axios.get('/beneficiary/profile');
            setProfile(profileRes.data);

            const historyRes = await axios.get('/beneficiary/history');
            setHistory(historyRes.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const fetchAvailableFood = async () => {
        try {
            const res = await axios.get('/beneficiary/available-food');
            setAvailable(res.data);
        } catch (err) { console.error(err); }
    };

    const handleOrderFood = async (id) => {
        try {
            await axios.post(`/beneficiary/order/${id}`);
            alert('Food ordered successfully! A volunteer will handle the rescue.');
            fetchData();
            fetchAvailableFood();
        } catch (err) { alert('Failed to order food.'); }
    };

    const handleRequestSupport = async () => {
        try {
            await axios.post('/beneficiary/request');
            alert('Your request for food support has been sent to your primary NGO.');
            fetchData();
        } catch (err) { alert('Failed to send request.'); }
    };

    if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Synchronizing with rescue network...</div>;

    return (
        <div className="beneficiary-dashboard fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        color: 'white', border: 'none', padding: '2.5rem'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Heart size={24} fill="white" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{profile?.user?.name || 'Beneficiary Portal'}</h2>
                        <p style={{ opacity: 0.9, marginBottom: '2rem', fontSize: '0.95rem' }}>Managed by: {profile?.ngo?.organizationName || 'Regional NGO'}</p>
                        <button className="btn-primary" style={{ background: 'white', color: '#be185d', fontWeight: 700 }} onClick={handleRequestSupport}>
                            General Support Request
                        </button>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                                <Package size={20} />
                            </div>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Available Surplus Nearby</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {available.length > 0 ? available.map(batch => (
                                <div key={batch._id} className="card" style={{ background: 'var(--gray-50)', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{batch.foodType}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Owner: {batch.donor?.name}</div>
                                        </div>
                                        <button onClick={() => handleOrderFood(batch._id)} className="status-badge badge-delivered" style={{ border: 'none', cursor: 'pointer' }}>Order Now</button>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem' }}>No surplus food available nearby right now.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--dark)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                                <Clock size={20} />
                            </div>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>My Support Timeline</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {history.length > 0 ? history.map((item, i) => (
                                <div key={i} style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr',
                                    alignItems: 'center', padding: '1.25rem', background: 'white',
                                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                                        <div style={{ fontWeight: 600 }}>{new Date(item.requestedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Batch</div>
                                        <div style={{ fontWeight: 600 }}>{item.foodBatch?.foodType || 'General'}</div>
                                    </div>
                                    <div style={{ padding: '0 1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>NGO Status</div>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Awaiting Pickup</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`status-badge badge-${item.status}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{item.status}</span>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                                    <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Your support history is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryDashboard;
