import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle2, Zap, Briefcase, ShoppingBag, ArrowRight } from 'lucide-react';

const Pricing = () => {
    return (
        <div className="pricing-page">
            <Navbar />

            <div className="container" style={{ padding: '80px 0', minHeight: 'calc(100vh - 80px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="pill-badge" style={{ margin: '0 auto 16px' }}>
                        <span className="pill-dot"></span>
                        Transparência Total
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>
                        Investimento que se paga com <br />
                        <span className="text-gradient">eficiência</span>.
                    </h1>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Escolha como você quer automatizar seu negócio. Sem taxas escondidas, sem mensalidades obrigatórias.
                    </p>
                </div>

                <div className="pricing-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '32px',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    {/* Card 1: Projetos Personalizados */}
                    <div className="glass-card fade-in" style={{ padding: '40px', position: 'relative', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            background: 'rgba(124, 58, 237, 0.1)',
                            width: '48px', height: '48px',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            color: 'hsl(var(--primary))'
                        }}>
                            <Briefcase size={24} />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Projetos Sob Medida</h3>
                        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', minHeight: '48px' }}>
                            Para automações complexas que exigem análise e construção personalizada.
                        </p>

                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>Grátis</span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}> para postar</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', space: 'y-4' }}>
                            {[
                                'Publique seu desafio gratuitamente',
                                'Receba propostas de especialistas',
                                'Negocie o valor direto com o gestor'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', color: 'hsl(var(--text-primary))' }}>
                                    <CheckCircle2 size={20} color="hsl(var(--primary))" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/request" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Solicitar Orçamento
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Card 2: Templates Prontos */}
                    <div className="glass-card fade-in" style={{ padding: '40px', position: 'relative', border: '1px solid hsl(var(--primary))', boxShadow: '0 0 30px rgba(124, 58, 237, 0.1)' }}>
                        <div style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'hsl(var(--primary))', color: '#fff',
                            padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold'
                        }}>
                            MAIS RÁPIDO
                        </div>

                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            width: '48px', height: '48px',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            color: 'hsl(var(--success))'
                        }}>
                            <ShoppingBag size={24} />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Marketplace</h3>
                        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', minHeight: '48px' }}>
                            Soluções prontas para usar. Baixe, configure e rode em minutos.
                        </p>

                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>A partir de </span>
                            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>R$ 47</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                            {[
                                'Acesso imediato ao arquivo',
                                'Vídeo tutorial de configuração',
                                'Suporte do criador via chat',
                                'Garantia de 7 dias'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', color: 'hsl(var(--text-primary))' }}>
                                    <CheckCircle2 size={20} color="hsl(var(--success))" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/templates" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            Ver Templates
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Card 3: Para Gestores */}
                    <div className="glass-card fade-in" style={{ padding: '40px', position: 'relative', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            background: 'rgba(255, 200, 0, 0.1)',
                            width: '48px', height: '48px',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            color: '#ffd700'
                        }}>
                            <Zap size={24} />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Expert Pro</h3>
                        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', minHeight: '48px' }}>
                            Acesso a leads qualificados e venda de templates.
                        </p>

                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>R$ 67</span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>/mês</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                            {[
                                'Acesso a todos os leads',
                                'Publique seus templates',
                                'Comunidade exclusiva',
                                'Suporte prioritário'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', color: 'hsl(var(--text-primary))' }}>
                                    <CheckCircle2 size={20} color="#ffd700" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/subscription" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)', border: 'none', color: '#000' }}>
                            Assinar Agora
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                <div style={{ marginTop: '80px', textAlign: 'center' }}>
                    <p style={{ color: 'hsl(var(--text-secondary))' }}>
                        Dúvidas sobre qual modelo é ideal para você? <a href="https://wa.me/5586999458993" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--primary))' }}>Fale com nossa equipe</a>.
                    </p>
                </div>
            </div>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="AutoMatch" style={{ height: '32px', marginBottom: '8px' }} />
                            <p>O marketplace premium de automação.</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/login">Login</Link>
                            <Link to="/pricing">Preços</Link>
                            <Link to="/request">Para Empresas</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 AutoMatch. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
