import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Navbar from '../components/Navbar';
import { CheckCircle, Shield, Zap, Star } from 'lucide-react';

const SubscriptionPlan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

    const handleSubscribe = () => {
        // Link de pagamento Cakto
        const monthlyLink = "https://pay.cakto.com.br/xc9h95o_759330";
        const yearlyLink = "https://pay.cakto.com.br/bcdcaqn";

        if (billingCycle === 'yearly') {
            window.location.href = yearlyLink;
        } else {
            window.location.href = monthlyLink;
        }
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Carregando...</div>;

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '60px 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Escolha o Plano Ideal</h1>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem', marginBottom: '32px' }}>
                        Desbloqueie acesso total ao marketplace e comece a pegar projetos hoje mesmo.
                    </p>

                    {/* Toggle de Ciclo */}
                    <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '100px', alignItems: 'center' }}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            style={{
                                background: billingCycle === 'monthly' ? 'hsl(var(--primary))' : 'transparent',
                                color: billingCycle === 'monthly' ? '#000' : '#fff',
                                border: 'none', padding: '8px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'
                            }}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            style={{
                                background: billingCycle === 'yearly' ? 'hsl(var(--primary))' : 'transparent',
                                color: billingCycle === 'yearly' ? '#000' : '#fff',
                                border: 'none', padding: '8px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            Anual <span style={{ fontSize: '0.7rem', background: 'hsl(var(--success))', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>-38% OFF</span>
                        </button>
                    </div>
                </div>

                <div className="glass-card fade-in" style={{
                    maxWidth: '450px', width: '100%', padding: '40px',
                    border: '1px solid hsl(var(--primary))',
                    boxShadow: '0 0 30px rgba(0, 255, 128, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '20px', right: '-30px', background: 'hsl(var(--primary))', color: '#000',
                        padding: '4px 40px', transform: 'rotate(45deg)', fontWeight: 'bold', fontSize: '0.8rem'
                    }}>
                        POPULAR
                    </div>

                    <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Expert Pro</h2>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '3rem', fontWeight: '800', color: 'hsl(var(--success))' }}>
                                {billingCycle === 'monthly' ? 'R$ 67' : 'R$ 497'}
                            </span>
                            <span style={{ color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                                /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                            </span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <p style={{ color: 'hsl(var(--success))', fontSize: '0.9rem', marginTop: '4px' }}>
                                Equivalente a R$ 41,41/mês
                            </p>
                        )}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                        {[
                            'Acesso ilimitado a leads qualificados',
                            'Publique templates no Marketplace',
                            'Suporte prioritário via WhatsApp',
                            'Acesso à comunidade exclusiva'
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                                <CheckCircle size={20} color="hsl(var(--primary))" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleSubscribe}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        <Zap size={20} /> Assinar Agora
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                        <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Pagamento seguro via Cakto. Cancele a qualquer momento.
                    </p>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', maxWidth: '600px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Perguntas Frequentes</h3>
                    <div style={{ textAlign: 'left' }}>
                        <details style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Como funciona o pagamento?</summary>
                            <p style={{ marginTop: '8px', color: 'hsl(var(--text-secondary))' }}>O pagamento é mensal e recorrente. Você pode usar cartão de crédito ou Pix via Cakto.</p>
                        </details>
                        <details style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Posso cancelar quando quiser?</summary>
                            <p style={{ marginTop: '8px', color: 'hsl(var(--text-secondary))' }}>Sim, você pode cancelar a assinatura a qualquer momento no seu painel de usuário sem multas.</p>
                        </details>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPlan;
