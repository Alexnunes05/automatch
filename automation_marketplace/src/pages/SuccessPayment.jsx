import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, ArrowRight, UserPlus } from 'lucide-react';

const SuccessPayment = () => {
    return (
        <>
            <Navbar />
            <div className="container" style={{
                padding: '100px 0',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div className="fade-in">
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'hsl(var(--success))'
                    }}>
                        <CheckCircle size={48} />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Assinatura Confirmada!</h1>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 40px' }}>
                        Parabéns! Seu acesso ao Expert Pro foi liberado. Agora, o último passo é criar sua conta para acessar o marketplace.
                    </p>

                    <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', width: '100%', margin: '0 auto' }}>
                        <h3 style={{ marginBottom: '24px' }}>Finalize seu cadastro</h3>
                        <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
                            <UserPlus size={20} /> Criar minha conta agora
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    <p style={{ marginTop: '32px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                        Dúvidas? <a href="https://wa.me/5586999458993" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--primary))' }}>Fale com o suporte</a>.
                    </p>
                </div>
            </div>
        </>
    );
};

export default SuccessPayment;
