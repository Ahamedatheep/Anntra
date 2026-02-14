import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Plus, MapPin, Tag, Clock, ChevronLeft, Send, Sparkles } from 'lucide-react';

const DonorNewDonation = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        category: 'Veg',
        preparationTime: '',
        expiryTime: '',
        address: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const coordinates = [80.2720 + Math.random() * 0.01, 13.0850 + Math.random() * 0.01];
            await axios.post('/food', { ...formData, coordinates });
            navigate('/donor');
        } catch (err) {
            alert('Failed to register donation');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="new-donation fade-in">
            <button onClick={() => navigate('/donor')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-600)', background: 'none', border: 'none', marginBottom: '2rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                <div className="card" style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '14px', color: 'white', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Register Donation</h2>
                            <p style={{ color: 'var(--gray-600)' }}>Provide details about the food you wish to rescue.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="form-group">
                                <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Food Description</label>
                                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                                    <Package size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. 50 packs of Hot Meals (Rice & Curry)"
                                        value={formData.foodType}
                                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                                        required
                                        style={{ paddingLeft: '3.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Quantity / Servings</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. 50 Servings"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                        style={{ marginTop: '0.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Dietary Category</label>
                                    <select
                                        className="form-control"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ marginTop: '0.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)', appearance: 'none' }}
                                    >
                                        <option value="Veg">Vegetarian</option>
                                        <option value="Non-Veg">Non-Vegetarian</option>
                                        <option value="Halal">Halal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Pickup Address</label>
                                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Full address for our rider"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                        style={{ paddingLeft: '3.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Prepared On</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.preparationTime}
                                        onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                                        required
                                        style={{ marginTop: '0.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '0.9rem' }}>Estimated Expiry</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.expiryTime}
                                        onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                                        required
                                        style={{ marginTop: '0.5rem', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1rem', padding: '1.25rem', fontSize: '1.1rem' }}>
                                {isLoading ? 'Processing...' : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Send size={20} /> Launch Food Rescue Mission
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'var(--dark)', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}>
                                <Sparkles size={20} />
                            </div>
                            <h3 style={{ fontWeight: 700 }}>AI Smart Timing</h3>
                        </div>
                        <p style={{ color: 'var(--gray-300)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Based on current traffic and volunteer availability in Chennai, now is an **Optimal Time** for donation. We estimate an arrival within 18 minutes.
                        </p>
                    </div>

                    <div className="card" style={{ border: '1px dashed var(--primary-light)', background: '#f0fdf4' }}>
                        <h4 style={{ color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '1rem' }}>Rescue Impact</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600 }}>CO2 REDUCTION</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)' }}>12.5 kg</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600 }}>MEALS SAVED</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)' }}>50+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorNewDonation;
