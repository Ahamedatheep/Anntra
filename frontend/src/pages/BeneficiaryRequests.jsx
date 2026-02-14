import { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, ChevronRight, MessageSquareHeart } from 'lucide-react';
import axios from 'axios';

const BeneficiaryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/beneficiary/history');
                setRequests(res.data);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="beneficiary-requests fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Support Log</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Track your past support requests and deliveries.</p>
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {requests.length > 0 ? requests.map((req, index) => (
                        <div key={req._id} style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr 1fr 60px',
                            alignItems: 'center',
                            padding: '1.5rem 2.5rem',
                            borderBottom: index === requests.length - 1 ? 'none' : '1px solid var(--gray-100)',
                            backgroundColor: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#fdf2f8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be185d' }}>
                                    <MessageSquareHeart size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.foodBatch?.foodType || 'Support Package'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>ID: {req._id.substring(req._id.length - 8).toUpperCase()}</div>
                                </div>
                            </div>

                            <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{req.foodBatch?.quantity || req.mealsServed + ' Meals'}</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                <Clock size={16} /> {new Date(req.deliveredAt || req.createdAt).toLocaleDateString()}
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '2px' }}>PROVIDER</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.ngo?.organizationName || 'District NGO'}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <span className={`status-badge badge-${req.status || 'delivered'}`}>{req.status || 'delivered'}</span>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--gray-600)' }}>
                            <Package size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>No support history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryRequests;
