import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AccessRestricted = ({ status }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getMessage = () => {
        if (status === 'rejected') {
            return {
                title: "Renove seu Acesso",
                description: "Seu período de acesso expirou ou sua conta precisa de atenção. Para continuar acessando as melhores oportunidades e ferramentas, renove seu plano agora mesmo.",
                color: "hsl(var(--primary))",
                actionLabel: "Renovar Agora",
                // Updated with the actual Cakto link found in SubscriptionPlan.jsx
                actionLink: "https://pay.cakto.com.br/3jC32D7"
            };
        }
        return {
            title: "Conta em Análise",
            description: "Sua conta está sendo analisada pela nossa equipe. Você receberá um aviso assim que for aprovada.",
            color: "hsl(var(--accent))"
        };
    };

    const content = getMessage();

    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <h2 style={{ color: content.color, marginBottom: '16px', fontSize: '2rem' }}>
                    {content.title}
                </h2>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', lineHeight: '1.6' }}>
                    {content.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {status === 'rejected' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a
                                href="https://pay.cakto.com.br/xc9h95o_759330"
                                className="btn btn-primary"
                                style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', width: '100%', justifyContent: 'center' }}
                            >
                                Assinatura Mensal (R$ 67)
                            </a>
                            <a
                                href="https://pay.cakto.com.br/bcdcaqn"
                                className="btn btn-outline"
                                style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', width: '100%', justifyContent: 'center', borderColor: 'hsl(var(--success))', color: 'hsl(var(--success))' }}
                            >
                                Assinatura Anual (R$ 497)
                            </a>
                        </div>
                    ) : (
                        <button className="btn btn-outline" disabled style={{ opacity: 0.7, width: '100%' }}>
                            Aguardando Aprovação...
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        style={{ marginTop: '8px' }}
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRestricted;
