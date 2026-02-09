import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            alert('Login falhou: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '80px 0', height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div className="hero-blob" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '1000px',
                    height: '1000px',
                    opacity: 0.3,
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                    <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '2rem' }}>
                        Acessar <span className="text-gradient">Painel</span>
                    </h2>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>E-mail</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>Senha</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Entrando...' : 'Acessar Painel'}
                        </button>

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                            Não tem conta? <Link to="/subscription" style={{ color: 'hsl(var(--primary))' }}>Criar conta</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
