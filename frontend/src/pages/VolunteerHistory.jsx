import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, Calendar, CheckCircle, ChevronRight, Filter } from 'lucide-react';

const VolunteerHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mocking volunteer history for the UI
        setTimeout(() => {
            setHistory([
                { id: 'MIS-1240', food: 'Lunch Sets', date: 'Today, 2:30 PM', donor: 'Grand Hotel', status: 'completed', distance: '4.2 km' },
                { id: 'MIS-1238', food: 'Fresh Veggies', date: 'Yesterday, 10:15 AM', donor: 'City Mart', status: 'completed', distance: '2.1 km' },
                { id: 'MIS-1235', food: 'Bakery Items', date: 'Feb 12, 5:45 PM', donor: 'The Bread Shop', status: 'completed', distance: '1.8 km' },
                { id: 'MIS-1230', food: 'Fruit Baskets', date: 'Feb 10, 11:00 AM', donor: 'Fruit Loft', status: 'completed', distance: '5.6 km' },
            ]);
            setIsLoading(false);
        }, 800);
    }, []);

    return (
        <div className="volunteer-history fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Mission Archive</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Track your past rescues and total impact.</p>
                </div>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid var(--gray-200)', color: 'var(--dark)' }}>
                    <Filter size={18} /> Filter by Date
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {history.length > 0 ? history.map((item, index) => (
                        <div key={item.id} style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1fr 1fr 60px',
                            alignItems: 'center',
                            padding: '1.5rem 2.5rem',
                            borderBottom: index === history.length - 1 ? 'none' : '1px solid var(--gray-100)',
                            transition: 'var(--transition)',
                            cursor: 'pointer'
                        }} className="history-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--gray-100)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.food}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        #{item.id}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                                <Calendar size={16} color="var(--gray-600)" />
                                {item.date}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                                <MapPin size={16} color="var(--gray-600)" />
                                {item.donor}
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '2px' }}>DISTANCE</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.distance}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <CheckCircle size={24} color="var(--primary)" />
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--gray-600)' }}>
                            <Package size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <p>You haven't completed any missions yet. Your future rescues will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Distance</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>84.2 km</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Rescue Streaks</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>12 Days</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Impact Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>984 XP</div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerHistory;
