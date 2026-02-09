import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up user
            const { data: { user }, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone, // Save phone to metadata
                        role: 'client' // Default role for standard registration
                    }
                }
            });

            if (error) throw error;

            if (user) {
                // Optional: Create profile entry if needed, similar to ExpertJoin
                // For now, we rely on Supabase Auth metadata or triggers

                alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
                navigate('/login');
            }

        } catch (error) {
            alert('Erro no cadastro: ' + error.message);
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
                        Criar <span className="text-gradient">Conta</span>
                    </h2>

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Seu nome"
                            />
                        </div>

                        <div className="form-group">
                            <label>E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>WhatsApp / Telefone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="form-group">
                            <label>Senha</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                            Já tem uma conta? <Link to="/login" style={{ color: 'hsl(var(--primary))' }}>Fazer Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
