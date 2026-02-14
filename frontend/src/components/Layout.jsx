import { useContext } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Package, Users, Truck, Heart, BarChart3, Bell, User } from 'lucide-react';

const Layout = ({ title }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = {
        admin: [
            { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
            { name: 'Deliveries', path: '/admin/deliveries', icon: <Truck size={20} /> },
            { name: 'NGO Oversight', path: '/admin/ngos', icon: <Users size={20} /> },
            { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
        ],
        donor: [
            { name: 'My Donations', path: '/donor', icon: <Package size={20} /> },
            { name: 'New Donation', path: '/donor/new', icon: <Package size={20} /> },
            { name: 'Impact Report', path: '/donor/impact', icon: <BarChart3 size={20} /> },
        ],
        volunteer: [
            { name: 'My Tasks', path: '/volunteer', icon: <Truck size={20} /> },
            { name: 'Trip History', path: '/volunteer/history', icon: <Package size={20} /> },
            { name: 'Performance', path: '/volunteer/stats', icon: <BarChart3 size={20} /> },
        ],
        ngo: [
            { name: 'Overview', path: '/ngo', icon: <LayoutDashboard size={20} /> },
            { name: 'Volunteers', path: '/ngo/volunteers', icon: <Users size={20} /> },
            { name: 'Beneficiaries', path: '/ngo/beneficiaries', icon: <Heart size={20} /> },
        ],
        beneficiary: [
            { name: 'Request Food', path: '/beneficiary', icon: <Heart size={20} /> },
            { name: 'Order History', path: '/beneficiary/requests', icon: <Package size={20} /> },
        ]
    };

    return (
        <div className="dashboard-layout fade-in">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h3>ANNTRA</h3>
                    <span className="role-badge">{user?.role}</span>
                </div>
                <nav>
                    <ul>
                        {menuItems[user?.role]?.map((item) => (
                            <li key={item.path}>
                                <NavLink to={item.path} end className={({ isActive }) => isActive ? 'active' : ''}>
                                    {item.icon} <span>{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} /> <span>Sign Out</span>
                </button>
            </aside>
            <main className="main-content">
                <header className="top-bar">
                    <div className="header-title">
                        <h1>{title || 'Dashboard'}</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Manage your impact and operations here.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button style={{ background: 'none', color: 'var(--gray-600)', position: 'relative' }}>
                            <Bell size={20} />
                            <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>
                        </button>
                        <div className="user-profile">
                            <div className="avatar">{user?.name?.charAt(0)}</div>
                            <div style={{ lineHeight: 1.2 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textTransform: 'capitalize' }}>{user?.role}</div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
