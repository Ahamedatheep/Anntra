import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Package, Navigation, CheckCircle2, AlertCircle, Clock, ChevronRight, Zap } from 'lucide-react';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const VolunteerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('missions');
    const [aiAdvice, setAiAdvice] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (selectedTask) {
            fetchAIAdvice(selectedTask);
        } else {
            setAiAdvice('');
        }
    }, [selectedTask]);

    const fetchAIAdvice = async (task) => {
        try {
            const context = `Food Type: ${task.foodType}, Status: ${task.status}, Urgency: ${task.urgencyLevel}, Location: ${task.address}`;
            const res = await axios.post('/ai/advise', { context });
            setAiAdvice(res.data.advice);
        } catch (err) {
            setAiAdvice('Optimize your route for the fastest delivery to ensure food freshness.');
        }
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchActiveTasks(), fetchAvailableTasks(), fetchStats()]);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/volunteer/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchActiveTasks = async () => {
        try {
            const res = await axios.get('/food/volunteer/active');
            setTasks(res.data);
            if (res.data.length > 0 && !selectedTask) setSelectedTask(res.data[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAvailableTasks = async () => {
        try {
            const res = await axios.get('/volunteer/available');
            setAvailableTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (status) => {
        try {
            setIsLoading(true);
            const coords = [
                selectedTask.location.coordinates[0] + (Math.random() - 0.5) * 0.005,
                selectedTask.location.coordinates[1] + (Math.random() - 0.5) * 0.005
            ];
            await axios.put(`/food/${selectedTask._id}/status`, { status, coordinates: coords });
            await fetchActiveTasks();
            const updated = tasks.find(t => t._id === selectedTask._id);
            if (updated) setSelectedTask({ ...updated, status });
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const claimTask = async (id) => {
        try {
            setIsLoading(true);
            await axios.post(`/volunteer/claim/${id}`);
            alert('Mission claimed successfully! Proceed to pickup.');
            await fetchAllData();
            setActiveTab('missions');
        } catch (err) {
            alert('Failed to claim mission');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && tasks.length === 0) return <div style={{ textAlign: 'center', padding: '100px' }}>Syncing Mission...</div>;

    return (
        <div className="volunteer-dashboard fade-in">
            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reliability Score</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.reliabilityScore?.toFixed(0) || 0}%</span>
                        <span style={{ color: 'var(--primary)', marginBottom: '4px' }}><CheckCircle2 size={16} /></span>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Rescues</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.completedDeliveries || 0}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Network Tier</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tier {stats?.tier || 3}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '2rem' }}>
                {/* Task List Panel */}
                <div className="card" style={{ padding: '1.5rem', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('missions')}
                            style={{
                                background: 'none', border: 'none',
                                fontWeight: activeTab === 'missions' ? 700 : 500,
                                color: activeTab === 'missions' ? 'var(--primary)' : 'var(--gray-600)',
                                borderBottom: activeTab === 'missions' ? '2px solid var(--primary)' : 'none',
                                padding: '0.5rem', cursor: 'pointer'
                            }}
                        >
                            Active Missions ({tasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('marketplace')}
                            style={{
                                background: 'none', border: 'none',
                                fontWeight: activeTab === 'marketplace' ? 700 : 500,
                                color: activeTab === 'marketplace' ? 'var(--primary)' : 'var(--gray-600)',
                                borderBottom: activeTab === 'marketplace' ? '2px solid var(--primary)' : 'none',
                                padding: '0.5rem', cursor: 'pointer'
                            }}
                        >
                            Marketplace ({availableTasks.length})
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeTab === 'missions' ? (
                            tasks.length > 0 ? tasks.map(t => (
                                <div
                                    key={t._id}
                                    onClick={() => setSelectedTask(t)}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        background: selectedTask?._id === t._id ? 'var(--gray-100)' : 'white',
                                        border: selectedTask?._id === t._id ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t.foodType}</span>
                                        <span className={`status-badge badge-${t.status}`} style={{ fontSize: '0.65rem' }}>{t.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                        <MapPin size={14} /> {t.address.length > 30 ? t.address.substring(0, 30) + '...' : t.address}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                    <Clock size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No active assignments.</p>
                                </div>
                            )
                        ) : (
                            availableTasks.length > 0 ? availableTasks.map(t => (
                                <div
                                    key={t._id}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'white',
                                        border: '1px solid var(--gray-200)',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t.foodType}</span>
                                        <button onClick={() => claimTask(t._id)} className="status-badge badge-delivered" style={{ cursor: 'pointer', border: 'none' }}>Claim Rescue</button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                        <MapPin size={14} /> {t.address}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>Donor: {t.donor?.name || 'Local Donor'}</div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                    <Package size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No available rescues nearby.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Task Map & Details Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedTask ? (
                        <>
                            {aiAdvice && (
                                <div className="card fade-in" style={{
                                    background: 'linear-gradient(to right, #f0f9ff, #fff)',
                                    border: '1px solid #bae6fd',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ color: 'var(--secondary)' }}>
                                        <Zap size={24} fill="var(--secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AI Mission Advisor</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--gray-900)', fontStyle: 'italic' }}>"{aiAdvice}"</div>
                                    </div>
                                </div>
                            )}

                            <div className="card fade-in" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'var(--gray-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Navigation size={24} />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedTask.foodType}</h2>
                                            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: '4px 0 0' }}>Status: <span style={{ textTransform: 'capitalize', color: 'var(--gray-900)', fontWeight: 600 }}>{selectedTask.status.replace('_', ' ')}</span></p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {selectedTask.status === 'assigned' && (
                                            <button onClick={() => updateStatus('picked_up')} className="btn-primary" style={{ background: 'var(--secondary)', width: 'auto', padding: '0.6rem 1.25rem' }}>
                                                Confirm Pickup
                                            </button>
                                        )}
                                        {selectedTask.status === 'picked_up' && (
                                            <button onClick={() => updateStatus('in_transit')} className="btn-primary" style={{ background: 'var(--secondary)', width: 'auto', padding: '0.6rem 1.25rem' }}>
                                                Start Transit
                                            </button>
                                        )}
                                        {selectedTask.status === 'in_transit' && (
                                            <button onClick={() => updateStatus('delivered')} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                                                Complete Mission
                                            </button>
                                        )}
                                        {selectedTask.status === 'delivered' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                                                <CheckCircle2 size={20} /> MISSION COMPLETED
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <MapPin size={20} color="var(--primary)" />
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Pickup</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{selectedTask.address}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <AlertCircle size={20} color="#f59e0b" />
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Urgency</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 500, textTransform: 'capitalize' }}>{selectedTask.urgencyLevel} Delivery</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)', zIndex: 1 }}>
                                    <MapContainer
                                        center={[selectedTask.location.coordinates[1], selectedTask.location.coordinates[0]]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[selectedTask.location.coordinates[1], selectedTask.location.coordinates[0]]}>
                                            <Popup>Current Mission Target</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--gray-500)', textAlign: 'center' }}>
                            <Navigation size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <h3 style={{ fontWeight: 700, color: 'var(--gray-900)' }}>Select a mission to begin</h3>
                            <p style={{ maxWidth: '280px', fontSize: '0.95rem' }}>Your contribution matters. Pick an active mission or claim one from the marketplace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
