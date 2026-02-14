import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Search, Filter, MoreVertical, MapPin, Clock, CheckCircle2 } from 'lucide-react';

const AdminDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const res = await axios.get('/admin/deliveries/active');
            setDeliveries(res.data);
        } catch (err) {
            console.error('Error fetching deliveries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-deliveries fade-in">
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '12px', color: 'white' }}>
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Deliveries</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Monitoring real-time logistics across the network.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="user-profile" style={{ padding: '0.6rem 1rem' }}>
                            <Search size={18} />
                            <input type="text" placeholder="Track ID..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }} />
                        </div>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}>
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.25rem 2rem' }}>Tracking ID</th>
                                <th>Shipment / Food</th>
                                <th>Route (From → To)</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th style={{ paddingRight: '2rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.length > 0 ? deliveries.map(d => (
                                <tr key={d._id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: 600, color: 'var(--primary)' }}>#{d._id.substring(d._id.length - 6).toUpperCase()}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{d.foodType}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {new Date(d.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{d.donor?.name || 'Partner Donor'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>↓ {d.address}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge badge-${d.urgencyLevel}`} style={{ background: d.urgencyLevel === 'critical' ? '#fee2e2' : d.urgencyLevel === 'urgent' ? '#ffedd5' : '#f0fdf4', color: d.urgencyLevel === 'critical' ? '#ef4444' : d.urgencyLevel === 'urgent' ? '#f59e0b' : '#16a34a' }}>
                                            {d.urgencyLevel}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.status === 'delivered' ? 'var(--primary)' : '#3b82f6' }}></div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{d.status.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '2rem' }}>
                                        <button style={{ background: 'none', color: 'var(--gray-600)' }}>
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-500)' }}>No active deliveries found in the network.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '1.5rem 2rem', background: 'var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--gray-600)' }}>Showing 4 of 128 active shipments</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="status-badge" style={{ background: 'white', color: 'var(--dark)', border: '1px solid var(--gray-200)', cursor: 'pointer' }}>Previous</button>
                        <button className="status-badge" style={{ background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDeliveries;
