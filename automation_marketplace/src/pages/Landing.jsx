import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Bot, Zap, ShieldCheck, CheckCircle2, ArrowRight,
    BrainCircuit, Users, ChevronDown, ChevronUp, LayoutDashboard,
    MessageSquare, BarChart3, Globe
} from 'lucide-react';

const Landing = () => {
    const [faqOpen, setFaqOpen] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div className="landing-page">
            <Navbar />

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-bg"></div>
                <div className="container">
                    <div className="hero-content fade-in">
                        <div className="pill-badge">
                            <span className="pill-dot"></span>
                            Marketplace Premium de Automação
                        </div>

                        <h1 className="hero-title">
                            Automação sob medida com o <br />
                            <span className="text-gradient">especialista certo</span>, sem <br />
                            complicação técnica.
                        </h1>

                        <p className="hero-subtitle">
                            Descreva seu desafio e receba o match ideal com gestores de automação validados.
                            Economize tempo, reduza erros e escale sua operação com processos que funcionam de verdade.
                        </p>

                        <div className="hero-actions">
                            <Link to="/request" className="btn btn-primary btn-lg">
                                Quero automatizar meu negócio
                                <ArrowRight size={20} />
                            </Link>

                        </div>

                        <div className="hero-trust">
                            <div className="avatars">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="avatar-circle">
                                        <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Mais de <strong>10 mil projetos</strong> entregues com sucesso.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST & LOGOS */}
            <section className="logos-section">
                <div className="container">
                    <p className="section-label">FERRAMENTAS QUE NOSSOS ESPECIALISTAS DOMINAM</p>
                    <div className="logos-grid">
                        <span className="logo-text">n8n</span>
                        <span className="logo-text">Make</span>
                        <span className="logo-text">Zapier</span>
                        <span className="logo-text">OpenAI</span>
                        <span className="logo-text">Salesforce</span>
                        <span className="logo-text">HubSpot</span>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="steps-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Como funciona</h2>
                        <p>Do caos à automação em 3 passos simples</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon-wrapper">
                                <MessageSquare size={32} />
                                <span className="step-number">01</span>
                            </div>
                            <h3>Envie seu pedido</h3>
                            <p>Descreva o processo que você quer automatizar ou o problema que precisa resolver.</p>
                        </div>

                        <div className="step-card">
                            <div className="step-icon-wrapper">
                                <BrainCircuit size={32} />
                                <span className="step-number">02</span>
                            </div>
                            <h3>Match Inteligente</h3>
                            <p> Nossa curadoria conecta você ao especialista com a stack exata para o seu projeto.</p>
                        </div>

                        <div className="step-card">
                            <div className="step-icon-wrapper">
                                <Zap size={32} />
                                <span className="step-number">03</span>
                            </div>
                            <h3>Implementação</h3>
                            <p>O gestor constrói, testa e entrega sua automação funcionando. Pagamento seguro.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-grid">
                        <div className="benefit-content">
                            <h2>Por que automatizar com a gente?</h2>
                            <p className="benefit-intro">
                                Esqueça freelancers aleatórios ou agências caras.
                                Aqui você tem garantia de entrega e qualidade técnica.
                            </p>

                            <ul className="benefit-list">
                                <li>
                                    <CheckCircle2 size={24} className="check-icon" />
                                    <div>
                                        <strong>Economia de Tempo</strong>
                                        <p>Deixe robôs cuidarem do trabalho repetitivo.</p>
                                    </div>
                                </li>
                                <li>
                                    <CheckCircle2 size={24} className="check-icon" />
                                    <div>
                                        <strong>Processos Padronizados</strong>
                                        <p>Elimine erros humanos e falhas de comunicação.</p>
                                    </div>
                                </li>
                                <li>
                                    <CheckCircle2 size={24} className="check-icon" />
                                    <div>
                                        <strong>Integrações Reais</strong>
                                        <p>Conecte WhatsApp, CRM e Planilhas em um fluxo só.</p>
                                    </div>
                                </li>
                                <li>
                                    <CheckCircle2 size={24} className="check-icon" />
                                    <div>
                                        <strong>Zero Código para Você</strong>
                                        <p>Não precisa ser tech. O especialista resolve tudo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="benefit-visual">
                            {/* Abstract visual representation of automation */}
                            <div className="glass-panel">
                                <div className="workflow-node start">
                                    <span>Novo Lead (WhatsApp)</span>
                                </div>
                                <div className="workflow-line"></div>
                                <div className="workflow-node process">
                                    <span>IA Qualifica Lead</span>
                                </div>
                                <div className="workflow-line"></div>
                                <div className="workflow-split">
                                    <div className="workflow-line-branch"></div>
                                    <div className="workflow-line-branch"></div>
                                </div>
                                <div className="workflow-nodes-row">
                                    <div className="workflow-node end success">
                                        <span>CRM: Ganho</span>
                                    </div>
                                    <div className="workflow-node end neutral">
                                        <span>Nutrição Email</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="use-cases-section">
                <div className="container">
                    <div className="section-header">
                        <h2>O que você pode automatizar?</h2>
                        <p>Exemplos reais de eficiência aplicada</p>
                    </div>

                    <div className="use-cases-grid">
                        <div className="use-case-card">
                            <BarChart3 size={40} className="uc-icon" />
                            <h3>Vendas & CRM</h3>
                            <p>Capture leads do Facebook, qualifique com IA e envie para o CRM automaticamente.</p>
                        </div>
                        <div className="use-case-card">
                            <MessageSquare size={40} className="uc-icon" />
                            <h3>Atendimento</h3>
                            <p>Chatbots inteligentes que respondem dúvidas, agendam reuniões e filtram tickets.</p>
                        </div>
                        <div className="use-case-card">
                            <LayoutDashboard size={40} className="uc-icon" />
                            <h3>Financeiro</h3>
                            <p>Emissão de notas fiscais, cobrança automática e conciliação bancária sem erros.</p>
                        </div>
                        <div className="use-case-card">
                            <Globe size={40} className="uc-icon" />
                            <h3>Marketing</h3>
                            <p>Disparo de emails personalizados baseados no comportamento do usuário no site.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIFFERENTIATORS */}
            <section className="trust-section">
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item">
                            <ShieldCheck size={48} className="trust-icon" />
                            <h3>Segurança Total</h3>
                            <p>Selecionamos rigorosamente nossos gestores para garantir excelência técnica. Um ambiente totalmente seguro para seu projeto.</p>
                        </div>
                        <div className="trust-item">
                            <Users size={48} className="trust-icon" />
                            <h3>Curadoria Top 5%</h3>
                            <p>Não aceitamos qualquer um. Nossos especialistas passam por prova técnica e entrevista.</p>
                        </div>
                        <div className="trust-item">
                            <Bot size={48} className="trust-icon" />
                            <h3>Foco em IA</h3>
                            <p>Nossos gestores dominam as últimas tecnologias de Inteligência Artificial Generativa.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERMEDIATE CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Pronto para escalar sua operação?</h2>
                        <p>Pare de perder tempo com tarefas manuais. Comece hoje.</p>
                        <Link to="/request" className="btn btn-primary btn-lg">
                            Solicitar Automação
                        </Link>
                    </div>
                </div>
            </section>



            {/* FAQ */}
            <section className="faq-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Perguntas Frequentes</h2>
                    </div>
                    <div className="faq-list">
                        {[
                            { q: "Quanto custa para usar a plataforma?", a: "Para empresas, o cadastro do projeto é gratuito. Você só paga o valor acordado com o especialista pelo projeto." },
                            { q: "Em quanto tempo recebo propostas?", a: "Nossa média é de 24 horas para conectar você aos primeiros especialistas qualificados." },
                            { q: "Como funciona o pagamento e a segurança para clientes e gestores?", a: "Os pagamentos no AutoMatch são processados por uma infraestrutura segura. Para o cliente, isso garante uma compra protegida e rastreável. Para o gestor, significa recebimento organizado, registro das transações e mais confiança na relação comercial entre as partes." },
                            { q: "E se a automação parar de funcionar com o tempo?", a: "Soluções com Inteligência Artificial evoluem e mudam constantemente, seja por atualizações de ferramentas, APIs ou modelos de IA. Por isso, é altamente recomendado que, ao fechar um projeto, o cliente avalie a contratação de um plano recorrente de suporte ou manutenção com o gestor. Assim, sempre que houver necessidade de ajustes ou correções, o gestor poderá atuar rapidamente. A contratação desse plano é opcional e fica totalmente a critério do cliente." },
                        ].map((item, i) => (
                            <div key={i} className={`faq-item ${faqOpen === i ? 'open' : ''}`} onClick={() => toggleFaq(i)}>
                                <div className="faq-question">
                                    <span>{item.q}</span>
                                    {faqOpen === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {faqOpen === i && <div className="faq-answer">{item.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="AutoMatch" style={{ height: '32px', marginBottom: '8px' }} />
                            <p>O marketplace premium de automação.</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/login">Login</Link>

                            <Link to="/request">Para Empresas</Link>
                            <a href="https://wa.me/5586999458993" target="_blank" rel="noopener noreferrer">Suporte WhatsApp</a>
                        </div>
                    </div>
                    <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '40px', paddingTop: '24px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '12px' }}>Dúvidas? <a href="https://wa.me/5586999458993" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>Clique aqui para falar conosco no WhatsApp</a></p>
                        <p>&copy; 2024 AutoMatch. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
