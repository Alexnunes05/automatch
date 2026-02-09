import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav style={{
            borderBottom: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(10, 10, 10, 0.8)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
                <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="AutoMatch" style={{ height: '40px' }} />
                    <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>
                        Auto<span style={{ color: 'hsl(var(--primary))' }}>Match</span>
                    </span>
                </Link>

                {/* Mobile Toggle */}
                <button className="nav-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/templates" onClick={() => setIsMenuOpen(false)} style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}>Templates</Link>
                            <Link to="/projects" onClick={() => setIsMenuOpen(false)} style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}>Projetos</Link>
                            <Link to="/subscription" onClick={() => setIsMenuOpen(false)} style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 'bold' }}>Seja um Gestor</Link>
                            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}>Preços</Link>
                            <Link to="/request" onClick={() => setIsMenuOpen(false)} className="btn btn-primary">Automatizar Agora</Link>
                            <Link to="/subscription" onClick={() => setIsMenuOpen(false)} className="btn btn-outline" style={{ border: 'none', color: 'hsl(var(--text-secondary))' }}>Criar Conta</Link>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-outline">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
