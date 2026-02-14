import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Globe, TrendingUp, Award, Thermometer, ShieldCheck, Share2 } from 'lucide-react';

const DonorImpact = () => {
    const [impact, setImpact] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const res = await axios.get('/donor/analytics');
                setImpact({
                    mealsSaved: res.data.mealsSaved || 0,
                    co2Reduced: `${(res.data.mealsSaved * 0.4).toFixed(1)} kg`,
                    methaneAvoided: `${(res.data.mealsSaved * 0.01).toFixed(2)} kg`,
                    trustScore: res.data.reliability || 100,
                    recentBadges: ['Eco Warrior', 'Community Hero', 'Fast Responder'],
                    monthlyGrowth: '+12%'
                });
            } catch (err) {
                console.error('Error fetching impact:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImpact();
    }, []);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>Calculating your legacy...</div>;

    return (
        <div className="donor-impact fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', border: 'none', padding: '2.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Donor Trust Score</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>{impact.trustScore}%</div>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>You are in the top 2% of contributors in Chennai. Keep up the high reliability!</p>
                    </div>

                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={20} color="#f59e0b" /> Active Badges
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {impact.recentBadges.map((badge, i) => (
                                <div key={i} style={{
                                    background: 'var(--gray-100)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    border: '1px solid var(--gray-200)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Environmental Realization</h2>
                            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                <Share2 size={16} /> Share Impact
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="card" style={{ background: 'var(--gray-100)', border: 'none', padding: '1.5rem' }}>
                                <Globe size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700 }}>CO2 REDUCTION</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{impact.co2Reduced}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem' }}>
                                    <TrendingUp size={12} /> {impact.monthlyGrowth} monthly growth
                                </div>
                            </div>

                            <div className="card" style={{ background: 'var(--gray-100)', border: 'none', padding: '1.5rem' }}>
                                <Thermometer size={24} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700 }}>METHANE AVOIDED</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{impact.methaneAvoided}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                                    Equivalent to 2.5 metric tons of waste
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--dark)', color: 'white', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>The Power of One</h4>
                                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    Your contributions have directly provided **{impact.mealsSaved} hearty meals** to children and elderly residents in North Chennai. Every rescue mission prevents waste and fosters community resilience.
                                </p>
                            </div>
                            <Heart size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorImpact;
