import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, History, Clock, MapPin, Tag, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const DonorDashboard = () => {
    const [donations, setDonations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        category: 'Veg',
        preparationTime: '',
        expiryTime: '',
        address: '',
    });

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const res = await axios.get('/food/donor');
            setDonations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Mocking coordinates for simulation
            const coordinates = [80.2720 + Math.random() * 0.01, 13.0850 + Math.random() * 0.01];
            await axios.post('/food', { ...formData, coordinates });
            setShowForm(false);
            setFormData({ foodType: '', quantity: '', category: 'Veg', preparationTime: '', expiryTime: '', address: '' });
            fetchDonations();
        } catch (err) {
            alert('Failed to register donation');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && donations.length === 0) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Dashboard...</div>;

    return (
        <div className="donor-dashboard fade-in">
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Overview</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Track your recent contributions and register new ones.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    {showForm ? 'Close Form' : (
                        <>
                            <Plus size={20} /> Register New donation
                        </>
                    )}
                </button>
            </div>

            {showForm && (
                <div className="card scale-in" style={{ marginBottom: '2.5rem', border: '2px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                            <Package size={20} />
                        </div>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Register New Food Donation</h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Food Type</label>
                                <input
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    placeholder="e.g., Vegetable Biryani & Dal"
                                    value={formData.foodType}
                                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Quantity</label>
                                <input
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    placeholder="e.g., Serve 50 People"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Category</label>
                                <select
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Veg">Vegetarian</option>
                                    <option value="Non-Veg">Non-Vegetarian</option>
                                    <option value="Halal">Halal</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Pickup Address</label>
                                <input
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    placeholder="Full address for pickup"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Preparation Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    value={formData.preparationTime}
                                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--gray-800)' }}>Est. Expiry Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    style={{ color: 'var(--dark)', border: '1px solid var(--gray-300)' }}
                                    value={formData.expiryTime}
                                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.875rem 2.5rem' }}>
                                Confirm & Register Donation
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                        <History size={20} />
                    </div>
                    <h3 style={{ fontWeight: 700, margin: 0 }}>Donation Pipeline</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {donations.length > 0 ? donations.map((donation) => (
                        <div key={donation._id} className="fade-in" style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1.2fr 1fr 40px',
                            alignItems: 'center',
                            padding: '1.25rem',
                            background: 'var(--gray-100)',
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--gray-200)',
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{donation.foodType}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Tag size={12} /> {donation.category}
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-800)' }}>
                                {donation.quantity}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> Registered On
                                </div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                    {new Date(donation.createdAt).toLocaleDateString()} at {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <span className={`status-badge badge-${donation.status}`}>
                                    {donation.status}
                                </span>
                            </div>

                            <button style={{ background: 'none', color: 'var(--gray-300)' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-600)' }}>
                            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No donations found in your history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
